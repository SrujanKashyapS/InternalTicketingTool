import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { ForbiddenError } from '../utils/errors';

type Role = 'EMPLOYEE' | 'AGENT' | 'ADMIN';

export function authorize(...roles: Role[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ForbiddenError('No user context'));
    }

    if (!roles.includes(req.user.role as Role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
}

export function isAdmin(req: AuthRequest, _res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    return next(new ForbiddenError('Admin access required'));
  }
  next();
}

export function isAgentOrAdmin(req: AuthRequest, _res: Response, next: NextFunction) {
  if (req.user?.role !== 'AGENT' && req.user?.role !== 'ADMIN') {
    return next(new ForbiddenError('Agent or admin access required'));
  }
  next();
}
