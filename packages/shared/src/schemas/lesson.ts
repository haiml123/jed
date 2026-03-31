import { z } from 'zod';

export const CreateLessonSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  videoUrl: z.string().url().optional(),
  videoDuration: z.number().int().positive().optional(),
  thumbnailUrl: z.string().url().optional(),
  isMandatory: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
});

export const UpdateLessonSchema = CreateLessonSchema.partial();

export const CreateUnitSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  order: z.number().int().min(0).default(0),
  lessonId: z.string(),
  keyTakeaways: z.array(z.object({
    text: z.string().min(1),
    order: z.number().int().min(0),
  })).optional(),
});

export type CreateLessonInput = z.infer<typeof CreateLessonSchema>;
export type UpdateLessonInput = z.infer<typeof UpdateLessonSchema>;
export type CreateUnitInput = z.infer<typeof CreateUnitSchema>;
