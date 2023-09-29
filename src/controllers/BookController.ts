import { Request, Response, NextFunction } from 'express';
import BookService from '../services/BookService';
import { Book } from '../services/BookService';

class BookController{

    async getBooks(req: Request, res: Response){
        const result = await BookService.getBooks();
        result.status ? res.status(200).json(result.books) : res.status(500).json(result.message);
    }

    async getBookById(req: Request, res: Response){
        const id = req.params.bookId;
        const result = await BookService.getBookById(id);
        if(result.status){
            res.status(200).json(result.book);
            return;
        }
        res.sendStatus(404);
    }

    async addBook(req: Request, res: Response){
        let { title, synopsis, releaseDate, price, authorId } = req.body;
        if(title && synopsis && releaseDate && price && authorId){
            parseFloat(price);
            const book = { title, synopsis, releaseDate, price, authorId };
            const result = await BookService.addBook(book);
            if(result.status){
                res.sendStatus(201);
                return;
            }
            else{
                res.status(500).json(result.message);
                return;
            }
        }
        res.sendStatus(400);
    }

    async updateBook(req: Request, res: Response){
        const id = req.params.bookId;
        const { title, synopsis, releaseDate, price, authorId } = req.body;
        if(title || synopsis || releaseDate || price || authorId){
            const book: Book = {};
            if(title){
                book.title = title;
            }
            if(synopsis){
                book.synopsis = synopsis;
            }
            if(releaseDate){
                book.releaseDate = releaseDate;
            }
            if(price){
                book.price = price;
            }
            if(authorId){
                book.authorId = authorId;
            }
            const result = await BookService.updateBook(id, book);
            if(result.status){
                res.sendStatus(200);
                return;
            }
            else{
                res.status(404).json(result.message);
                return;
            }
        }
        else{
            res.sendStatus(400);
            return;
        }
    }

    async deleteBook(req: Request, res: Response){
        const id = req.params.bookId;
        const result = await BookService.deleteBook(id);
        if(result.status){
            res.sendStatus(200);
            return;
        }
        else if(result.error){
            res.sendStatus(500);
            return;
        }
        else{
            res.status(404).json(result.message);
            return;
        }
    }

}

export default new BookController();