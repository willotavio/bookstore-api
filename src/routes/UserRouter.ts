import express from 'express';
const router = express.Router();
import UserController from '../controllers/UserController';

router.get('/', UserController.getUsers);
router.get('/:userId', UserController.getUserById);

export default router;