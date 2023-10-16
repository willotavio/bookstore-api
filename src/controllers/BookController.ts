import { Request, Response, NextFunction } from 'express';
import BookService from '../services/BookService';
import { Book } from '../services/BookService';

class BookController{

    async getBooks(req: Request, res: Response){
        const result = await BookService.getBooks();
        result.status ? res.status(200).json({books: result.books}) : res.status(500).json({message: result.message});
    }

    async getBookById(req: Request, res: Response){
        const id = req.params.bookId;
        const result = await BookService.getBookById(id);
        if(result.status){
            res.status(200).json({book: result.book});
            return;
        }
        res.status(404).json({message: result.message});
    }

    async addBook(req: Request, res: Response){
        let { title, synopsis, releaseDate, price, authorId, coverImage } = req.body;
        if(title && synopsis && releaseDate && price && authorId){
            parseFloat(price);
            const book: Book = { title, synopsis, releaseDate, price, authorId };
            if(coverImage.length > 0){
                book.coverImage = coverImage;
            }
            const result = await BookService.addBook(book);
            if(result.status){
                res.status(201).json({message: result.message});
                return;
            }
            else{
                res.status(500).json({message: result.message});
                return;
            }
        }
        res.status(400).json({message: "Provide the correct information"});
    }

    async updateBook(req: Request, res: Response){
        const id = req.params.bookId;
        const { title, synopsis, releaseDate, price, authorId, coverImage } = req.body;
        if(title || synopsis || releaseDate || price || authorId || coverImage){
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
            if(coverImage && coverImage.length > 0){
                book.coverImage = coverImage;
            }
            const result = await BookService.updateBook(id, book);
            if(result.status){
                res.status(200).json({message: result.message});
                return;
            }
            else{
                res.status(404).json({message: result.message});
                return;
            }
        }
        else{
            res.status(400).json({message: "Provide the correct information"});
            return;
        }
    }

    async deleteBook(req: Request, res: Response){
        const id = req.params.bookId;
        const result = await BookService.deleteBook(id);
        if(result.status){
            res.status(200).json({message: result.message});
            return;
        }
        else if(result.error){
            res.status(500).json({error: result.error});
            return;
        }
        else{
            res.status(404).json({message: result.message});
            return;
        }
    }

}

export default new BookController();