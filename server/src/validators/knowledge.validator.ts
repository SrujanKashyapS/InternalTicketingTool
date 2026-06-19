import { z } from 'zod';

export const uploadDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
