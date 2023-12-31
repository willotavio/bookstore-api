import { Author} from '../services/AuthorService';
import AuthorService from '../services/AuthorService';
import { Request, Response } from 'express';

class AuthorController{

    async getAuthors(req: Request, res: Response){
        const limit = parseInt(req.query.limit as string, 10) || 10;
        const offset = parseInt(req.query.offset as string, 10) || 0;
        const searchName = req.query.searchName as string || "";
        const result = await AuthorService.getAuthors(limit, offset, searchName);
        result.status ? res.status(200).json({ authors: result.authors }) : res.status(500).json({ message: result.message });
    }

    async getAuthorById(req: Request, res: Response){
        const id = req.params.authorId;
        const result = await AuthorService.getAuthorById(id);
        if(result.status){
            res.status(200).json({ author: result.author });
            return;
        }
        else{
            res.status(404).json({ message: result.message });
            return;
        }
    }

    async addAuthor(req: Request, res: Response){
        const { name, biography, birthDate } = req.body;
        if(name && biography && birthDate){
            const author = { name, biography, birthDate };
            try{
                const result = await AuthorService.addAuthor(author);
                if(result.status){
                    res.status(201).json({ message: result.message, author: result.author });
                    return;    
                }
                else{
                    res.status(500).json({ message: result.message });
                    return;
                }
            }
            catch(err){
                console.log(err);
                res.status(500).json({ message: "An error occurred" });
                return;
            }
        }
        else{
            res.status(400).json({ message: "Provide the correct information" });
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
                res.status(200).json({ message: result.message, author: result.author });
                return;
            }
            else if(result.error){
                res.status(500).json({ error: result.error });
                return
            }
            else{
                res.status(404).json({ message: result.message });
                return;
            }
        }
        else{
            res.status(400).json({ message: "Provide the correct information" });
            return;
        }
    }

    async deleteAuthor(req: Request, res: Response){
        const id = req.params.authorId;
        const result = await AuthorService.deleteAuthor(id);
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

export = new AuthorController();