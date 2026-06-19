import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import { CreateTicketInput, UpdateTicketInput, TicketQueryInput } from '../validators/ticket.validator';
import { paginationHelper, buildPaginationMeta, calculateSLADeadline } from '../utils/helpers';
import { categorizationService } from './ai/categorization.service';
import { embeddingService } from './ai/embedding.service';
import { duplicateService } from './ai/duplicate.service';
import logger from '../utils/logger';

export class TicketService {
  async create(data: CreateTicketInput, creatorId: string) {
    // AI categorization
    let aiResult;
    try {
      aiResult = await categorizationService.categorize(data.title, data.description);
    } catch (error) {
      logger.warn('AI categorization failed, using defaults');
      aiResult = { category: 'OTHER', urgencyScore: 5, sentiment: 'neutral', confidence: 0 };
    }

    const priority = data.priority || (aiResult.urgencyScore >= 8 ? 'CRITICAL' : aiResult.urgencyScore >= 6 ? 'HIGH' : aiResult.urgencyScore >= 4 ? 'MEDIUM' : 'LOW');
    const category = data.category || aiResult.category;

    const ticket = await prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        category: category as any,
        priority: priority as any,
        sentiment: aiResult.sentiment,
        urgencyScore: aiResult.urgencyScore,
        aiConfidence: aiResult.confidence,
        slaDeadline: calculateSLADeadline(priority),
        creatorId,
      },
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
        },
        assignedAgent: {
          select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
        },
      },
    });

    // Generate embedding asynchronously
    embeddingService.generateAndStore(ticket.id, `${data.title} ${data.description}`).catch(
      (err) => logger.error('Embedding generation failed:', err)
    );

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_TICKET',
        entity: 'Ticket',
        entityId: ticket.id,
        userId: creatorId,
        details: { title: data.title, category, priority },
      },
    });

    return { ticket, aiCategorization: aiResult };
  }

  async checkDuplicates(title: string, description: string) {
    return duplicateService.findDuplicates(title, description);
  }

  async findAll(query: TicketQueryInput, userId: string, role: string) {
    const { skip, take } = paginationHelper(query.page, query.limit);

    const where: any = {};

    if (role === 'EMPLOYEE') {
      where.creatorId = userId;
    } else if (role === 'AGENT') {
      where.OR = [
        { assignedAgentId: userId },
        { assignedAgentId: null },
      ];
    }

    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.category) where.category = query.category;
    if (query.assignedAgentId) where.assignedAgentId = query.assignedAgentId;

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take,
        orderBy: { [query.sortBy]: query.sortOrder },
        include: {
          creator: {
            select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
          },
          assignedAgent: {
            select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
          },
          _count: { select: { comments: true, attachments: true } },
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    return {
      tickets,
      pagination: buildPaginationMeta(total, query.page, query.limit),
    };
  }

  async findById(id: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, email: true, avatar: true, department: true },
        },
        assignedAgent: {
          select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true },
            },
            attachments: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        attachments: true,
      },
    });

    if (!ticket) {
      throw new NotFoundError('Ticket');
    }

    return ticket;
  }

  async update(id: string, data: UpdateTicketInput, userId: string) {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      throw new NotFoundError('Ticket');
    }

    const updateData: any = { ...data };

    if (data.status === 'RESOLVED' && ticket.status !== 'RESOLVED') {
      updateData.resolvedAt = new Date();
    }

    if (data.priority && data.priority !== ticket.priority) {
      updateData.slaDeadline = calculateSLADeadline(data.priority, ticket.createdAt);
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
        },
        assignedAgent: {
          select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
        },
      },
    });

    // Create notifications for status changes
    if (data.status && data.status !== ticket.status) {
      await prisma.notification.create({
        data: {
          type: 'STATUS_CHANGE',
          title: 'Ticket Status Updated',
          message: `Ticket "${ticket.title}" status changed to ${data.status}`,
          userId: ticket.creatorId,
          metadata: { ticketId: id, oldStatus: ticket.status, newStatus: data.status },
        },
      });
    }

    // Create notification for assignment
    if (data.assignedAgentId && data.assignedAgentId !== ticket.assignedAgentId) {
      await prisma.notification.create({
        data: {
          type: 'TICKET_ASSIGNED',
          title: 'New Ticket Assigned',
          message: `You have been assigned ticket "${ticket.title}"`,
          userId: data.assignedAgentId,
          metadata: { ticketId: id },
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_TICKET',
        entity: 'Ticket',
        entityId: id,
        userId,
        details: data as any,
      },
    });

    return updated;
  }

  async delete(id: string, userId: string) {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      throw new NotFoundError('Ticket');
    }

    await prisma.ticket.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE_TICKET',
        entity: 'Ticket',
        entityId: id,
        userId,
        details: { title: ticket.title },
      },
    });
  }

  async getStats(userId: string, role: string) {
    const where: any = {};
    if (role === 'EMPLOYEE') where.creatorId = userId;
    if (role === 'AGENT') where.assignedAgentId = userId;

    const [total, open, inProgress, resolved, critical, highPriority] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.count({ where: { ...where, status: 'OPEN' } }),
      prisma.ticket.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.ticket.count({ where: { ...where, status: { in: ['RESOLVED', 'CLOSED'] } } }),
      prisma.ticket.count({ where: { ...where, priority: 'CRITICAL' } }),
      prisma.ticket.count({ where: { ...where, priority: 'HIGH' } }),
    ]);

    return { total, open, inProgress, resolved, critical, highPriority };
  }
}

export const ticketService = new TicketService();
