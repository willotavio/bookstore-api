import express from 'express';
const router = express.Router();
import BookController from '../controllers/BookController';
import { adminMiddleware } from '../middleware/AdminMiddleware';

router.get('/', BookController.getBooks);
router.get('/:bookId', BookController.getBookById);
router.post('/', adminMiddleware, BookController.addBook);
router.put('/:bookId', adminMiddleware, BookController.updateBook);
router.delete('/:bookId', adminMiddleware, BookController.deleteBook);

export default router;