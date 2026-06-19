import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment is required').max(5000),
  isInternal: z.boolean().default(false),
  isAIGenerated: z.boolean().default(false),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
