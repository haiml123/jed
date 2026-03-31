import { z } from 'zod';

export const SubmitQuizAnswerSchema = z.object({
  questionId: z.string(),
  optionId: z.string(),
});

export const SubmitQuizSchema = z.object({
  unitId: z.string(),
  answers: z.array(SubmitQuizAnswerSchema),
});

export const CreateQuizQuestionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  order: z.number().int().min(0).default(0),
  unitId: z.string(),
  xpValue: z.number().int().positive().default(10),
  options: z.array(z.object({
    text: z.string().min(1),
    isCorrect: z.boolean(),
  })).min(2, 'At least 2 options required'),
});

export type SubmitQuizInput = z.infer<typeof SubmitQuizSchema>;
export type CreateQuizQuestionInput = z.infer<typeof CreateQuizQuestionSchema>;
