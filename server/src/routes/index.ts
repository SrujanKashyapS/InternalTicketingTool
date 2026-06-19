import { Router } from 'express';
import authRoutes from './auth.routes';
import ticketRoutes from './ticket.routes';
import commentRoutes from './comment.routes';
import notificationRoutes from './notification.routes';
import knowledgeRoutes from './knowledge.routes';
import analyticsRoutes from './analytics.routes';
import userRoutes from './user.routes';
import aiRoutes from './ai.routes';
import searchRoutes from './search.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tickets', ticketRoutes);
router.use('/comments', commentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/knowledge', knowledgeRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/users', userRoutes);
router.use('/ai', aiRoutes);
router.use('/search', searchRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
