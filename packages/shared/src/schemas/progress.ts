import { z } from 'zod';

export const UpdateVideoProgressSchema = z.object({
  unitId: z.string(),
  watchPercent: z.number().min(0).max(100),
});

export const SubmitExitTicketSchema = z.object({
  unitId: z.string(),
  response: z.string().min(1, 'Response is required'),
  shareWithDirector: z.boolean().default(false),
});

export const SubmitReflectionSchema = z.object({
  unitId: z.string(),
  content: z.string().min(1, 'Reflection content is required'),
  sharedWithDirector: z.boolean().default(false),
});

export type UpdateVideoProgressInput = z.infer<typeof UpdateVideoProgressSchema>;
export type SubmitExitTicketInput = z.infer<typeof SubmitExitTicketSchema>;
export type SubmitReflectionInput = z.infer<typeof SubmitReflectionSchema>;
