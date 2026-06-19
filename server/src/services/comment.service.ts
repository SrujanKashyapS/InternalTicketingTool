import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import { CreateCommentInput } from '../validators/comment.validator';

export class CommentService {
  async create(ticketId: string, data: CreateCommentInput, authorId: string) {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundError('Ticket');
    }

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        isInternal: data.isInternal,
        isAIGenerated: data.isAIGenerated,
        ticketId,
        authorId,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true },
        },
        attachments: true,
      },
    });

    // Notify ticket creator about new comment (unless they are the author)
    if (ticket.creatorId !== authorId) {
      await prisma.notification.create({
        data: {
          type: 'NEW_COMMENT',
          title: 'New Comment on Your Ticket',
          message: `New comment on "${ticket.title}"`,
          userId: ticket.creatorId,
          metadata: { ticketId, commentId: comment.id },
        },
      });
    }

    // Notify assigned agent about new comment (unless they are the author)
    if (ticket.assignedAgentId && ticket.assignedAgentId !== authorId) {
      await prisma.notification.create({
        data: {
          type: 'NEW_COMMENT',
          title: 'New Comment on Assigned Ticket',
          message: `New comment on "${ticket.title}"`,
          userId: ticket.assignedAgentId,
          metadata: { ticketId, commentId: comment.id },
        },
      });
    }

    // Update ticket updatedAt
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() },
    });

    return comment;
  }

  async findByTicket(ticketId: string) {
    return prisma.comment.findMany({
      where: { ticketId },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true },
        },
        attachments: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async delete(commentId: string) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundError('Comment');
    }
    await prisma.comment.delete({ where: { id: commentId } });
  }
}

export const commentService = new CommentService();
