import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN'), (req, res, next) => userController.findAll(req, res, next));
router.get('/agents', (req, res, next) => userController.getAgents(req, res, next));
router.get('/:id', (req, res, next) => userController.findById(req, res, next));
router.patch('/:id', authorize('ADMIN'), (req, res, next) => userController.update(req, res, next));

export default router;
