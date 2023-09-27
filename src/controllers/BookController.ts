import { Request, Response, NextFunction } from 'express';
const BookService = require('../services/BookService');

class BookController{

    async getBooks(req: Request, res: Response){
        try{
            const result = await BookService.getBooks();
            res.status(200).json(result);
        }
        catch(err){
            console.log(err);
            res.status(500);
        }
    }

}

export = new BookController();