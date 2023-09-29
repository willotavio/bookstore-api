import express from 'express';
const router = express.Router();
import AuthorController from '../controllers/AuthorController';

router.get('/', AuthorController.getAuthors);
router.get('/:authorId', AuthorController.getAuthorById);
router.post('/', AuthorController.addAuthor);
router.put('/:authorId', AuthorController.updateAuthor);

export = router; 