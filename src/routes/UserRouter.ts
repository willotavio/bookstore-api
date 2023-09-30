import express from 'express';
const router = express.Router();
import UserController from '../controllers/UserController';
import { authMiddleware } from '../middleware/AuthMiddleware';

router.get('/',  authMiddleware, UserController.getUsers);
router.get('/:userId', authMiddleware, UserController.getUserById);
router.post('/', authMiddleware, UserController.addUser);

export default router;