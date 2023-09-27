import { Request, Response, NextFunction } from 'express';
const BookService = require('../services/BookService');

class BookController{

    async getBooks(req: Request, res: Response){
        const result = await BookService.getBooks();
        res.status(200).json(result);
    }

    async getBookById(req: Request, res: Response){
        const id = req.params.bookId;
        const result = await BookService.getBookById(id);
        result.status ? res.status(200).json(result.book) : res.sendStatus(404);
    }

}

export = new BookController();