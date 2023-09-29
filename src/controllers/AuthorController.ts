import { Author} from '../services/AuthorService';
import AuthorService from '../services/AuthorService';
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

    async updateAuthor(req: Request, res: Response){
        const id = req.params.authorId;
        const { name, biography, birthDate } = req.body;
        if(name || biography || birthDate){
            let author: Author = {};
            if(name){
                author.name = name;
            }
            if(biography){
                author.biography = biography;
            }
            if(birthDate){
                author.birthDate = birthDate;
            }
            const result = await AuthorService.updateAuthor(id, author);
            if(result.status){
                res.sendStatus(200);
                return;
            }
            else if(result.error){
                res.sendStatus(500);
                return
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

    async deleteAuthor(req: Request, res: Response){
        const id = req.params.authorId;
        const result = await AuthorService.deleteAuthor(id);
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

export = new AuthorController();