import { Router } from 'express';
import { commentController } from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/:ticketId', (req, res, next) => commentController.findByTicket(req, res, next));
router.post('/:ticketId', (req, res, next) => commentController.create(req, res, next));
router.delete('/:ticketId/:id', (req, res, next) => commentController.delete(req, res, next));

export default router;
