import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { commentService } from '../services/comment.service';
import { createCommentSchema } from '../validators/comment.validator';

export class CommentController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createCommentSchema.parse(req.body);
      const comment = await commentService.create(req.params.ticketId as string, data, req.user!.userId);
      res.status(201).json({ success: true, data: comment });
    } catch (error) {
      next(error);
    }
  }

  async findByTicket(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comments = await commentService.findByTicket(req.params.ticketId as string);
      res.json({ success: true, data: comments });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await commentService.delete(req.params.id as string);
      res.json({ success: true, message: 'Comment deleted' });
    } catch (error) {
      next(error);
    }
  }
}

export const commentController = new CommentController();
