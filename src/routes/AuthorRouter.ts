import express from 'express';
const router = express.Router();
import AuthorController from '../controllers/AuthorController';
import { authMiddleware } from '../middleware/AuthMiddleware';

router.get('/', AuthorController.getAuthors);
router.get('/:authorId', AuthorController.getAuthorById);
router.post('/', authMiddleware, AuthorController.addAuthor);
router.put('/:authorId', authMiddleware, AuthorController.updateAuthor);
router.delete('/:authorId', authMiddleware, AuthorController.deleteAuthor);

export = router; 