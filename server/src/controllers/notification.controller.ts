import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { notificationService } from '../services/notification.service';

export class NotificationController {
  async findByUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await notificationService.findByUser(req.user!.userId, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.markAsRead(req.params.id as string, req.user!.userId);
      res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user!.userId);
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.delete(req.params.id as string, req.user!.userId);
      res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
