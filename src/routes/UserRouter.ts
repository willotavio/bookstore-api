import express from 'express';
const router = express.Router();
import UserController from '../controllers/UserController';
import { mainAdminMiddleware } from '../middleware/MainAdminMiddleware';
import { userMiddleware } from '../middleware/UserMiddleware';

router.get('/', mainAdminMiddleware, UserController.getUsers);
router.get('/:userId', mainAdminMiddleware, UserController.getUserById);
router.post('/', mainAdminMiddleware, UserController.addUser);
router.put('/:userId', mainAdminMiddleware, UserController.updateUser);
router.put('/update/:userId', userMiddleware, UserController.updateProfile);
router.delete('/:userId', mainAdminMiddleware, UserController.deleteUser);

export default router;