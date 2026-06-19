import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/dashboard', (req, res, next) => analyticsController.getDashboard(req, res, next));
router.get('/audit-logs', authorize('ADMIN'), (req, res, next) => analyticsController.getAuditLogs(req, res, next));

export default router;
