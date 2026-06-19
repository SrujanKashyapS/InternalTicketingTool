import { Router } from 'express';
import { knowledgeController } from '../controllers/knowledge.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { uploadSingle } from '../middleware/upload';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => knowledgeController.findAll(req, res, next));
router.get('/:id', (req, res, next) => knowledgeController.findById(req, res, next));
router.post('/upload', authorize('ADMIN', 'AGENT'), uploadSingle, (req, res, next) => knowledgeController.upload(req, res, next));
router.delete('/:id', authorize('ADMIN'), (req, res, next) => knowledgeController.delete(req, res, next));
router.post('/:id/reindex', authorize('ADMIN'), (req, res, next) => knowledgeController.reindex(req, res, next));
router.post('/query', (req, res, next) => knowledgeController.query(req, res, next));

export default router;
