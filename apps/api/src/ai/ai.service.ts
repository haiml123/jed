import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import OpenAI from 'openai';
import { z } from 'zod';

/*
 * Zod schemas duplicated from packages/shared/src/schemas/ai.ts.
 * We inline them here because the path alias `@jed/shared` is not
 * resolved at runtime in the Vercel serverless bundle (the `packages/`
 * folder lives outside `apps/api` which is what gets packaged).
 *
 * Keep these in sync with packages/shared/src/schemas/ai.ts.
 */
const GeneratedQuizOptionSchema = z.object({
  text: z.string().min(1),
  isCorrect: z.boolean(),
});

const GeneratedQuizQuestionSchema = z.object({
  text: z.string().min(1),
  explanation: z.string().min(1),
  options: z
    .array(GeneratedQuizOptionSchema)
    .length(4, 'Exactly 4 options required')
    .refine(
      (opts) => opts.filter((o) => o.isCorrect).length === 1,
      'Exactly one option must be marked as correct',
    ),
});

const GenerateQuizOutputSchema = z.object({
  questions: z.array(GeneratedQuizQuestionSchema).min(1).max(10),
});

export interface GenerateQuizInput {
  lessonTitle: string;
  topic: string;
  description?: string;
  numQuestions: number;
}

export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

/**
 * AiService — owns the OpenAI client and knows how to turn a Lesson
 * into a batch of multiple-choice quiz questions.
 *
 * All prompts, schemas, and validation live here so lessons.service
 * can stay focused on Prisma CRUD.
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: OpenAI | null;
  private readonly model = 'gpt-4o-mini';

  /**
   * Per-user in-memory rate limit: max 20 generate calls per rolling hour.
   * Fine for a single-instance demo; swap for Redis if we scale horizontally.
   */
  private readonly rateLimit = 20;
  private readonly rateWindowMs = 60 * 60 * 1000;
  private readonly callLog = new Map<string, number[]>();

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        'OPENAI_API_KEY not set — AiService will reject /quiz/generate requests',
      );
      this.client = null;
    } else {
      this.client = new OpenAI({ apiKey });
    }
  }

  /**
   * Check the rate limit for a given user. Throws if they've exceeded it.
   */
  private enforceRateLimit(userId: string): void {
    const now = Date.now();
    const recent = (this.callLog.get(userId) || []).filter(
      (ts) => now - ts < this.rateWindowMs,
    );
    if (recent.length >= this.rateLimit) {
      throw new ServiceUnavailableException(
        `Rate limit exceeded (${this.rateLimit} calls/hour). Please try again later.`,
      );
    }
    recent.push(now);
    this.callLog.set(userId, recent);
  }

  /**
   * Generate quiz questions for a lesson.
   * Uses OpenAI's structured output (json_schema) so we get back clean,
   * validated JSON without needing to parse/retry on malformed text.
   */
  async generateQuiz(
    userId: string,
    input: GenerateQuizInput,
  ): Promise<GenerateQuizOutput> {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'AI service is not configured. OPENAI_API_KEY is missing on the server.',
      );
    }

    this.enforceRateLimit(userId);

    const systemPrompt = `You are a professional development quiz writer for K-12 teachers.
Write clear, practical multiple-choice questions that test whether a teacher understood a lesson's key concepts and can apply them in their classroom.

Rules:
- Each question must have exactly 4 options.
- Exactly one option must be correct.
- The three wrong options must be plausible but clearly wrong on closer reading.
- Include a brief one-sentence explanation of why the correct answer is right.
- Keep each question focused on a single idea.
- Prefer "apply this to your classroom" phrasing over rote recall.`;

    const userPrompt = `Lesson title: ${input.lessonTitle}
Topic: ${input.topic}${input.description ? `\nDescription: ${input.description}` : ''}

Generate ${input.numQuestions} multiple-choice questions for this lesson.`;

    const start = Date.now();

    try {
      const completion = await this.client.chat.completions.create(
        {
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'quiz_questions',
              strict: true,
              schema: {
                type: 'object',
                additionalProperties: false,
                required: ['questions'],
                properties: {
                  questions: {
                    type: 'array',
                    minItems: 1,
                    maxItems: 10,
                    items: {
                      type: 'object',
                      additionalProperties: false,
                      required: ['text', 'explanation', 'options'],
                      properties: {
                        text: { type: 'string' },
                        explanation: { type: 'string' },
                        options: {
                          type: 'array',
                          minItems: 4,
                          maxItems: 4,
                          items: {
                            type: 'object',
                            additionalProperties: false,
                            required: ['text', 'isCorrect'],
                            properties: {
                              text: { type: 'string' },
                              isCorrect: { type: 'boolean' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          temperature: 0.7,
        },
        { timeout: 30_000 },
      );

      const raw = completion.choices[0]?.message?.content;
      if (!raw) {
        throw new InternalServerErrorException('Empty response from OpenAI');
      }

      const parsed = JSON.parse(raw);

      // Double-validate with zod — strict mode already ensures the shape,
      // but this also enforces our "exactly one correct" invariant.
      const validated = GenerateQuizOutputSchema.parse(parsed);

      const elapsed = Date.now() - start;
      const usage = completion.usage;
      this.logger.log(
        `quiz.generate userId=${userId} questions=${validated.questions.length} ` +
          `tokens_in=${usage?.prompt_tokens ?? '?'} tokens_out=${usage?.completion_tokens ?? '?'} ` +
          `elapsed=${elapsed}ms`,
      );

      return validated;
    } catch (e: any) {
      this.logger.error(
        `quiz.generate failed userId=${userId} error=${e?.message ?? e}`,
      );
      if (e instanceof ServiceUnavailableException) throw e;
      if (e?.name === 'ZodError') {
        throw new InternalServerErrorException(
          'AI returned malformed questions. Please try again.',
        );
      }
      // Upstream OpenAI failures → 503
      throw new ServiceUnavailableException(
        'AI service is temporarily unavailable. Please try again in a moment.',
      );
    }
  }
}
