import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { userService } from '../services/user.service';

export class UserController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const role = req.query.role as string;
      const result = await userService.findAll(page, limit, search, role);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.findById(req.params.id as string);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.update(req.params.id as string, req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async getAgents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const agents = await userService.getAgents();
      res.json({ success: true, data: agents });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
