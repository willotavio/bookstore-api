const router = require('express').Router();
const BookController = require('../controllers/BookController');

router.get('/', BookController.getBooks);

export = router;