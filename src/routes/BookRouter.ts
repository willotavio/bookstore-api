const router = require('express').Router();
const BookController = require('../controllers/BookController');

router.get('/', BookController.getBooks);
router.get('/:bookId', BookController.getBookById);

export = router;