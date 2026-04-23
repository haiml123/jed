import { z } from 'zod';

/**
 * Input for the POST /lessons/quiz/generate endpoint.
 * The admin sends the current Lesson form state + how many questions they want.
 */
export const GenerateQuizInputSchema = z.object({
  lessonTitle: z.string().min(1, 'Lesson title is required').max(200),
  topic: z.string().min(1, 'Topic is required').max(200),
  description: z.string().max(3000).optional().default(''),
  numQuestions: z.number().int().min(1).max(10).default(5),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

/**
 * Shape of each quiz option returned from OpenAI.
 * Exactly one option must have isCorrect = true.
 */
export const GeneratedQuizOptionSchema = z.object({
  text: z.string().min(1),
  isCorrect: z.boolean(),
});
export type GeneratedQuizOption = z.infer<typeof GeneratedQuizOptionSchema>;

/**
 * Shape of each generated quiz question.
 * Exactly 4 options, one explanation.
 */
export const GeneratedQuizQuestionSchema = z.object({
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
export type GeneratedQuizQuestion = z.infer<typeof GeneratedQuizQuestionSchema>;

/**
 * Full response from the AI service: an array of generated questions.
 * Both the API and the frontend can use this schema to validate.
 */
export const GenerateQuizOutputSchema = z.object({
  questions: z.array(GeneratedQuizQuestionSchema).min(1).max(10),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;
