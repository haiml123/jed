import { z } from 'zod';

export const CreateAssignmentSchema = z.object({
  lessonId: z.string(),
  groupId: z.string().optional(),
  userId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

export const CreateGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  description: z.string().optional(),
});

export const AddGroupMemberSchema = z.object({
  groupId: z.string(),
  userId: z.string(),
});

export type CreateAssignmentInput = z.infer<typeof CreateAssignmentSchema>;
export type CreateGroupInput = z.infer<typeof CreateGroupSchema>;
export type AddGroupMemberInput = z.infer<typeof AddGroupMemberSchema>;
