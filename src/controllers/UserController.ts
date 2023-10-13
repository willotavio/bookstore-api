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

    async addUser (req: Request, res: Response){
        const { name, email, password, role, profilePicture } = req.body;
        if(name && email && password && role > 0){
            const emailExists = await UserService.getUserByEmail(email);
            if(!emailExists.status){
                const user: User = {name, email, password, role};
                if(profilePicture.length > 0){
                    user.profilePicture = profilePicture;
                }
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
                res.status(400).json({message: "Email already in use"});
                return;
            }
        }
        else{
            res.sendStatus(400);
            return;
        }
    }

    async registerAccount (req: Request, res: Response){
        const { name, email, password, confirmPassword, profilePicture } = req.body;
        if(name && email && password && confirmPassword){
            if(password !== confirmPassword){
                res.status(400).json({message: "Passwords doesn't match"});
                return;
            }
            const emailExists = await UserService.getUserByEmail(email);
            if(!emailExists.status){
                const user: User = {name, email, password, role: 1};
                if(profilePicture && profilePicture.length > 0){
                    user.profilePicture = profilePicture;
                }
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
                res.status(400).json({message: "Email already in use"});
                return;
            }
        }
        else{
            res.sendStatus(400);
            return;
        }
    }

    async login(req: Request, res: Response){
        const { email, password } = req.body;
        if(email && password){
            const authenticated = await UserService.login(email, password);
            if(authenticated.status){
                res.status(200).json({user: authenticated.user, token: authenticated.token});
            }
            else{
                res.sendStatus(401);
            }
        }
        else{
            res.sendStatus(400);
            return;
        }
    }

    async updateUser(req: Request, res: Response){
        const id = req.params.userId;
        const { name, email, password, role, profilePicture } = req.body;
        if(name || email || password || role > 0){
            const user: User = { name, email, password, role};
            if(profilePicture){
                user.profilePicture = profilePicture;
            }
            const result = await UserService.updateUser(user, id);
            if(result.status){
                res.status(200).json(result.user);
                return;
            }
            else if(result.error){
                res.status(500).json(result.error);
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

    async updateProfile(req: Request, res: Response){
        const id = req.params.userId;
        const { name, email, password, confirmPassword, profilePicture } = req.body;
        if(password && password !== confirmPassword){
            res.status(400).json({message: "Passwords doesn't match"});
            return;
        }
        if(name || email || password){
            const user: User = { name, email, password};
            if(profilePicture){
                user.profilePicture = profilePicture;
            }
            const result = await UserService.updateUser(user, id);
            if(result.status){
                res.status(200).json(result.user);
                return;
            }
            else if(result.error){
                res.status(500).json(result.error);
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

    async changePassword(req: Request, res: Response){
        const id = req.params.userId;
        const { newPassword, confirmNewPassword, currentPassword } = req.body;
        if(newPassword !== confirmNewPassword){
            res.status(400).json({message: "Passwords doesn't match"});
            return;
        }
        if(newPassword && currentPassword){
            const result = await UserService.changePassword(id, newPassword, currentPassword);
            if(result.status){
                res.sendStatus(200);
                return;
            }
            else if(result.error){
                res.status(500).json({message: result.message});
                return;
            }
            else{
                res.status(401).json({message: result.message});
                return;
            }
        }
        else{
            res.sendStatus(400);
            return;
        }
    }

    async deleteUser(req: Request, res: Response){
        const id = req.params.userId;
        const result = await UserService.deleteUser(id);
        if(result.status){
            res.sendStatus(200);
            return;
        }
        else if(result.error){
            res.status(500).json(result.error);
            return;
        }
        else{
            res.status(404).json(result.message);
            return;
        }
    }

}

export default new UserController();