import express from 'express';
const router = express.Router();
import BookController from '../controllers/BookController';

router.get('/', BookController.getBooks);
router.get('/:bookId', BookController.getBookById);
router.post('/', BookController.addBook);

export default router;