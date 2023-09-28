const AuthorService = require('../services/AuthorService');
import { Request, Response, NextFunction } from 'express';

class AuthorController{

    async getAuthors(req: Request, res: Response){
        const result = await AuthorService.getAuthors();
        result.status ? res.status(200).json(result.authors) : res.status(500).json(result.message);
    }

    async getAuthorById(req: Request, res: Response){
        const id = req.params.authorId;
        console.log(id);
        const result = await AuthorService.getAuthorById(id);
        if(result.status){
            res.status(200).json(result.author);
            return;
        }
        else{
            res.status(404).json(result.message);
            return;
        }
    }

}

export = new AuthorController();