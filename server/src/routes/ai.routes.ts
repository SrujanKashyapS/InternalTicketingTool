import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate);
router.use(aiLimiter);

router.get('/tickets/:ticketId/summary', (req, res, next) => aiController.summarize(req, res, next));
router.get('/tickets/:ticketId/response', authorize('AGENT', 'ADMIN'), (req, res, next) => aiController.generateResponse(req, res, next));
router.get('/tickets/:ticketId/root-cause', authorize('AGENT', 'ADMIN'), (req, res, next) => aiController.rootCause(req, res, next));
router.get('/tickets/:ticketId/escalation', authorize('AGENT', 'ADMIN'), (req, res, next) => aiController.escalation(req, res, next));
router.get('/tickets/:ticketId/similar', (req, res, next) => aiController.similar(req, res, next));
router.post('/copilot', authorize('AGENT', 'ADMIN'), (req, res, next) => aiController.copilot(req, res, next));
router.get('/insights', authorize('ADMIN'), (req, res, next) => aiController.insights(req, res, next));
router.post('/rag', (req, res, next) => aiController.ragQuery(req, res, next));

export default router;
