import express from 'express';
import UserController from '../controllers/UserController';
const router = express.Router();

router.post('/', UserController.login);

export default router;