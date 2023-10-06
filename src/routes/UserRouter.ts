import express from 'express';
const router = express.Router();
import UserController from '../controllers/UserController';
import { authMiddleware } from '../middleware/AuthMiddleware';

router.get('/', authMiddleware, UserController.getUsers);
router.get('/:userId', authMiddleware, UserController.getUserById);
router.post('/', authMiddleware, UserController.addUser);
router.put('/:userId', authMiddleware, UserController.updateUser);
router.delete('/:userId', authMiddleware, UserController.deleteUser);

export default router;