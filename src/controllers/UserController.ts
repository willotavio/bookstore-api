import UserService from '../services/UserService';
import { User } from '../services/UserService';
import { Request, Response, NextFunction } from 'express';

class UserController{

    async getUsers(req: Request, res: Response){
        const result = await UserService.getUsers();
        result.status ? res.status(200).json(result.users) : res.status(500).json(result.error);
    }

    async getUserById(req: Request, res: Response){
        const id = req.params.userId;
        const result = await UserService.getUserById(id);
        if(result.status){
            res.status(200).json(result.user);
            return;
        }
        else if(result.error){
            res.status(500).json(result.message);
            return;
        }
        else{
            res.status(404).json(result.message);
            return;
        }
    }

    async addUser(req: Request, res: Response){
        const { name, email, password, role } = req.body;
        if(name && email && password && role){
            const user: User = {name, email, password, role};
            const result = await UserService.addUser(user);
            if(result.status){
                res.sendStatus(201);
                return;
            }
            else{
                res.status(500).json(result.message);
                return;
            }
        }
        else{
            res.sendStatus(400);
            return;
        }
    }

}

export default new UserController();