import express from 'express';
import UserController from '../controllers/UserController';
import { userMiddleware } from '../middleware/UserMiddleware';

const router = express.Router();

router.post('/', UserController.login);
router.post('/register', UserController.registerAccount);
router.post('/change-password/:userId', userMiddleware, UserController.changePassword);

export default router;