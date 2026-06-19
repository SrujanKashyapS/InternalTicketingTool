import { Router } from 'express';
import { ticketController } from '../controllers/ticket.controller';
import { authenticate } from '../middleware/auth';
import { uploadMultiple, uploadSingle } from '../middleware/upload';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => ticketController.findAll(req, res, next));
router.get('/stats', (req, res, next) => ticketController.getStats(req, res, next));
router.post('/', uploadMultiple, (req, res, next) => ticketController.create(req, res, next));
router.post('/check-duplicates', (req, res, next) => ticketController.checkDuplicates(req, res, next));
router.get('/:id', (req, res, next) => ticketController.findById(req, res, next));
router.patch('/:id', (req, res, next) => ticketController.update(req, res, next));
router.delete('/:id', (req, res, next) => ticketController.delete(req, res, next));
router.post('/:id/attachments', uploadSingle, (req, res, next) => ticketController.uploadAttachment(req, res, next));

export default router;
