import express from 'express';
const router = express.Router();
import BookController from '../controllers/BookController';
import { authMiddleware } from '../middleware/AuthMiddleware';

router.get('/', BookController.getBooks);
router.get('/:bookId', BookController.getBookById);
router.post('/', authMiddleware, BookController.addBook);
router.put('/:bookId', authMiddleware, BookController.updateBook);
router.delete('/:bookId', authMiddleware, BookController.deleteBook);

export default router;