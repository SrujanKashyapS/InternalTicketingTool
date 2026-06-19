import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { analyticsService } from '../services/analytics.service';

export class AnalyticsController {
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await analyticsService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await analyticsService.getAuditLogs(page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
