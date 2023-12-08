import express from 'express';
import UserController from '../controllers/UserController';
import { userMiddleware } from '../middleware/UserMiddleware';

const router = express.Router();

router.post('/login', UserController.login);
router.post('/register', UserController.registerAccount);
router.post('/change-password/:userId', userMiddleware, UserController.changePassword);
router.delete('/:userId', userMiddleware, UserController.deleteProfile);
router.get('/logout', UserController.logout);
router.get('/verify', UserController.verifyEmail);
router.post('/send-verification', UserController.sendVerificationEmail);

export default router;