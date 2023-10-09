import express from 'express';
const router = express.Router();
import AuthorController from '../controllers/AuthorController';
import { adminMiddleware } from '../middleware/AdminMiddleware';

router.get('/', AuthorController.getAuthors);
router.get('/:authorId', AuthorController.getAuthorById);
router.post('/', adminMiddleware, AuthorController.addAuthor);
router.put('/:authorId', adminMiddleware, AuthorController.updateAuthor);
router.delete('/:authorId', adminMiddleware, AuthorController.deleteAuthor);

export = router; 