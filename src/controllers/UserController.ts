import UserService from '../services/UserService';
import { User } from '../services/UserService';
import { Request, Response } from 'express';

class UserController{

    async getUsers(req: Request, res: Response){
        const result = await UserService.getUsers();
        result.status ? res.status(200).json({users: result.users}) : res.status(500).json({error: result.error});
    }

    async getUserById(req: Request, res: Response){
        const id = req.params.userId;
        const result = await UserService.getUserById(id);
        if(result.status){
            res.status(200).json({user: result.user});
            return;
        }
        else if(result.error){
            res.status(500).json({message: result.message});
            return;
        }
        else{
            res.status(404).json({message: result.message});
            return;
        }
    }

    async addUser (req: Request, res: Response){
        const { name, email, password, confirmPassword, role, profilePicture } = req.body;
        if(name && email && password && confirmPassword && role > 0){
            if(password !== confirmPassword){
                res.status(400).json({message: "Passwords doesn't match"});
                return;
            }
            const emailExists = await UserService.getUserByEmail(email);
            if(!emailExists.status){
                const user: User = {name, email, password, role};
                if(profilePicture && profilePicture.length > 0){
                    user.profilePicture = profilePicture;
                }
                const result = await UserService.addUser(user);
                if(result.status){
                    res.status(201).json({message: result.message});
                    return;
                }
                else{
                    res.status(500).json({message: result.message});
                    return;
                }
            }
            else{
                res.status(400).json({message: "Email already in use"});
                return;
            }
        }
        else{
            res.status(400).json({message: "Provide the correct informations"});
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
                    res.status(201).json({message: result.message});
                    return;
                }
                else{
                    res.status(500).json({message: result.message});
                    return;
                }
            }
            else{
                res.status(400).json({message: "Email already in use"});
                return;
            }
        }
        else{
            res.status(400).json({message: "Provide the correct informations"});
            return;
        }
    }

    async login(req: Request, res: Response){
        const { email, password } = req.body;
        if(email && password){
            const authenticated = await UserService.login(email, password);
            if(authenticated.status){
                res.cookie('token', authenticated.token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none',
                    maxAge: 60 * 1000 * 60 * 24 * 7
                });
                res.cookie('clientToken', true, {
                    httpOnly: false,
                    secure: true,
                    sameSite: 'none',
                    maxAge: 60 * 1000 * 60 * 24 * 7
                });
                res.status(200).json(authenticated.user);
            }
            else{
                res.status(401).json({message: authenticated.message});
            }
        }
        else{
            res.status(400).json({message: "Provide the credentials correctly"});
            return;
        }
    }

    async logout(req: Request, res: Response){
        if(req.cookies.token){
            res.clearCookie('token');
            res.clearCookie('clientToken');
            res.status(200).json({message: "Logged out"});
        }
        else{
            res.status(400).json({message: "Not logged in"});
        }
    }

    async updateUser(req: Request, res: Response){
        const id = req.params.userId;
        const { name, email, password, role, profilePicture } = req.body;
        if(name || email || password || role > 0 || profilePicture){
            const user: User = { name, email, password, role};
            if(profilePicture){
                user.profilePicture = profilePicture;
            }
            const result = await UserService.updateUser(user, id);
            if(result.status){
                res.status(200).json({user: result.user});
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
        else{
            res.status(400).json({message: "Provide the correct informations"});
            return;
        }   
    }

    async updateProfile(req: Request, res: Response){
        const id = req.params.userId;
        const { name, email, password, profilePicture } = req.body;
        if(name || email || password || profilePicture){
            const user: User = { name, email, password};
            if(profilePicture){
                user.profilePicture = profilePicture;
            }
            const result = await UserService.updateUser(user, id);
            if(result.status){
                res.status(200).json({user: result.user});
                return;
            }
            else if(result.error){
                res.status(500).json({errors: result.error});
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
                res.status(200).json({message: result.message});
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
            res.status(400).json({message: "Provide the passwords correctly"});
            return;
        }
    }

    async deleteUser(req: Request, res: Response){
        const id = req.params.userId;
        const result = await UserService.deleteUser(id);
        if(result.status){
            res.status(200).json({message: "User deleted"});
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

    async deleteProfile(req: Request, res: Response){
        const id = req.params.userId;
        const { password, confirmPassword } = req.body;
        if(password && confirmPassword){
            if(password !== confirmPassword){
                res.status(400).json({message: "Passwords doesn't match"});
                return;
            }
            const result = await UserService.deleteUser(id, password);
            if(result.status){
                res.status(200).json({message: result.message});
                return;
            }
            else{
                res.status(401).json({message: result.message});
                return;
            }
        }
        else{
            res.status(400).json({message: "Provide the password correctly"});
            return;
        }
    }

    async sendVerificationEmail(req: Request, res: Response){
        const { email, userId } = req.body;
        if(!email || !userId){
            res.status(400).json({ message: "Provide the correct information" });
        }
        const emailSent = await UserService.sendVerificationEmail(email, userId);
        if(!emailSent.status){
            res.status(500).json({ message: emailSent.message });
            return;
        }
        res.status(200).json({ message: emailSent.message });
    }

    async verifyEmail(req: Request, res: Response){
        const token = req.query.token + "";
        const result = await UserService.verifyEmail(token);
        if(result.error){
            res.status(500).json({ message: result.message, error: result.error });
        }
        if(!result.status){
            res.status(400).json({ message: result.message });
            return;
        }
        res.status(200).json({ message: result.message });
    }

}

export default new UserController();