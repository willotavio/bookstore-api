const AuthorService = require('../services/AuthorService');
import { Request, Response, NextFunction } from 'express';

class AuthorController{

    async getAuthors(req: Request, res: Response){
        const result = await AuthorService.getAuthors();
        result.status ? res.status(200).json(result.authors) : res.status(500).json(result.message);
    }

    async getAuthorById(req: Request, res: Response){
        const id = req.params.authorId;
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

    async addAuthor(req: Request, res: Response){
        const { name, biography, birthDate } = req.body;
        if(name && biography && birthDate){
            const author = {name, biography, birthDate};
            try{
                await AuthorService.addAuthor(author);
                res.sendStatus(201);
            }
            catch(err){
                console.log(err);
                res.sendStatus(500);
            }
        }
        else{
            res.sendStatus(400);
            return;
        }
    }

}

export = new AuthorController();