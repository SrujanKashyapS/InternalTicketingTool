import { z } from 'zod';

export const createTicketSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  category: z.enum(['IT', 'HR', 'PAYROLL', 'FACILITIES', 'SECURITY', 'OPERATIONS', 'OTHER']).optional(),
});

export const updateTicketSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  category: z.enum(['IT', 'HR', 'PAYROLL', 'FACILITIES', 'SECURITY', 'OPERATIONS', 'OTHER']).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED']).optional(),
  assignedAgentId: z.string().uuid().optional().nullable(),
  resolution: z.string().optional(),
});

export const ticketQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  category: z.enum(['IT', 'HR', 'PAYROLL', 'FACILITIES', 'SECURITY', 'OPERATIONS', 'OTHER']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  assignedAgentId: z.string().uuid().optional(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type TicketQueryInput = z.infer<typeof ticketQuerySchema>;
