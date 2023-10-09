import express from 'express';
const router = express.Router();
import UserController from '../controllers/UserController';
import { mainAdminMiddleware } from '../middleware/MainAdminMiddleware';

router.get('/', mainAdminMiddleware, UserController.getUsers);
router.get('/:userId', mainAdminMiddleware, UserController.getUserById);
router.post('/', mainAdminMiddleware, UserController.addUser);
router.post('/register', UserController.registerAccount);
router.put('/:userId', mainAdminMiddleware, UserController.updateUser);
router.delete('/:userId', mainAdminMiddleware, UserController.deleteUser);

export default router;