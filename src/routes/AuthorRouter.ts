const router = require('express').Router();
const AuthorController = require('../controllers/AuthorController');

router.get('/', AuthorController.getAuthors);
router.get('/:authorId', AuthorController.getAuthorById);
router.post('/', AuthorController.addAuthor);

export = router; 