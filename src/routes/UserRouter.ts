import express from 'express';
const router = express.Router();
import UserController from '../controllers/UserController';

router.get('/', UserController.getUsers);
router.get('/:userId', UserController.getUserById);
router.post('/', UserController.addUser);

export default router;