import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { searchService } from '../services/search.service';

export class SearchController {
  async search(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json({ success: true, data: { tickets: [], users: [], documents: [], totalResults: 0 } });
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await searchService.globalSearch(query, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController();
