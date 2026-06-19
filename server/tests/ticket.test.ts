import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/database';
import jwt from 'jsonwebtoken';
import { config } from '../src/config';

vi.mock('../src/config/database', () => {
  return {
    default: {
      ticket: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
    },
  };
});

describe('Ticket Endpoints', () => {
  let token: string;

  beforeEach(() => {
    vi.clearAllMocks();
    token = jwt.sign({ userId: 'user-123', role: 'EMPLOYEE' }, config.jwt.secret, { expiresIn: '1h' });
  });

  describe('GET /api/tickets', () => {
    it('should return a list of tickets with pagination metadata', async () => {
      const mockTickets = [
        { id: 'ticket-1', title: 'Issue 1', category: 'IT', priority: 'MEDIUM', status: 'OPEN' },
        { id: 'ticket-2', title: 'Issue 2', category: 'HR', priority: 'HIGH', status: 'IN_PROGRESS' },
      ];

      (prisma.ticket.findMany as any).mockResolvedValue(mockTickets);
      (prisma.ticket.count as any).mockResolvedValue(2);

      const res = await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tickets).toHaveLength(2);
      expect(res.body.data.pagination.total).toBe(2);
    });

    it('should return 401 when request lacks auth token', async () => {
      const res = await request(app).get('/api/tickets');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
