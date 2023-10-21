import connection from '../database/connection';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import JWT_SECRET from '../config';
import fs from 'fs';
import path from 'path';

interface LoginResult{
    status: boolean,
    token?: string;
    user?: User;
    message?: string;
}

export interface User{
    id?: string;
    name?: string;
    email: string;
    password?: string;
    role?: number;
    profilePicture?: string
}

class UserService{

    async getUsers(){
        try{
            const users = await connection.select().table('users');
            return {status: true, users};
        }
        catch(err){
            console.log(err);
            return {status: false, error: err, message: "An error occurred"};
        }
    }

    async getUserById(id: string){
        try{
            const user = await connection.select().table('users').where('id', id);
            if(user.length > 0){
                return {status: true, user: user[0]};
            }
            else{
                return {status: false, message: "User not found"};
            }
        }
        catch(err){
            console.log(err);
            return {status: false, error: err, message: "An error occurred"}
        }
    }

    async getUserByEmail(email: string){
        try{
            const user = await connection.select().table('users').where('email', email);
            if(user.length > 0){
                return {status: true, user: user[0]};
            }
            else{
                return {status: false, message: "User not found"};
            }
        }
        catch(err){
            console.log(err);
            return {status: false, error: err, message: "An error occurred"};
        }
    }

    async addUser(user: User){
        try{
            const id = crypto.randomUUID();
            let relativePath = null;
            if(user.profilePicture){
                const pictureSetted = await this.setProfilePicture(relativePath, id, user.profilePicture);
                if(pictureSetted.status){
                    relativePath = pictureSetted.relativePath;
                }
                else{
                    return {status: false, message: "Error saving the image"};
                }
            }
            if(user.password){
                user.password = await this.hashPassword(user.password);
            }
            await connection.insert({...user, id, profilePicture: relativePath}).table('users');
            return {status: true, message: "User added"};
        }
        catch(err){
            console.log(err);
            return {status: false, error: err, message: "An error occurred"};
        }
    }

    async login(email: string, password: string){
        const userFound = await this.getUserByEmail(email);
        if(userFound.user){
            if(await this.validatePassword(password, userFound.user.password)){
                const tokenCreated = await this.createToken(userFound.user);
                if(tokenCreated.status){
                    return {status: true, user: tokenCreated.user, token: tokenCreated.token};
                }
                else{
                    return {status: false, message: tokenCreated.message};
                }
            }
            else{
                return {status: false, message: "Invalid password"};
            }
        }
        else{
            return {status: false, message: "Invalid email"};
        }
    }

    async createToken(userInfo: User): Promise<LoginResult>{
        return new Promise((resolve, reject) => {
            jwt.sign({id: userInfo.id, email: userInfo.email, role: userInfo.role}, JWT_SECRET.JWT_SECRET, {expiresIn: '48h'}, (err, token) => {
                if(token){
                    const { password, ...user } = userInfo;
                    resolve({status: true, user, token: token});
                }
                reject({status: false, error: err, message: "An error occurred during token generation"});
            })
        })
    }

    async updateUser(user: User, id: string){
        const userExists = await this.getUserById(id);
        if(userExists.status){
            let emailExists: boolean = false;
            if(user.email){
                emailExists = (await this.getUserByEmail(user.email)).status;
            }
            if(!user.email || !emailExists || userExists.user.email === user.email){
                try{
                    if(user.password){
                        user.password = await this.hashPassword(user.password);
                    }
                    let relativePath = userExists.user.profilePicture;
                    if(user.profilePicture){
                        const pictureSetted = await this.setProfilePicture(relativePath, id, user.profilePicture);
                        if(pictureSetted.status){
                            relativePath = pictureSetted.relativePath;
                        }
                        else{
                            return {status: false, message: "Error saving the image"};
                        }
                    }
                    if(!user.role){
                        user.role === userExists.user.role;
                    }
                    await connection.update({...user, profilePicture: relativePath}).table('users').where('id', id);
                    const updatedUser = await this.getUserById(id);
                    return {status: true, user: updatedUser.user};
                }
                catch(err){
                    console.log(err);
                    return {status: false, error: err, message: "An error occurred"};
                }
            }
            else{
                return {status: false, message: "Email already in use"};
            }
        }
        else{
            return {status: false, message: "User not found"};
        }
    }

    async changePassword(id: string, newPassword: string, currentPassword: string){
        const userExists = await this.getUserById(id);
        if(userExists.status){
            try{
                if(await this.validatePassword(currentPassword, userExists.user.password)){
                    if((await this.updateUser({password: newPassword} as User, id)).status){
                        return {status: true, message: "Password changed"};
                    }
                    else{
                        return {status: false, message: "An error occurred"};
                    }
                }
                else{
                    return {status: false, message: "Wrong password"}
                }
            }
            catch(err){
                console.log(err);
                return {status: false, error: err, message: "An error occurred"};
            }
        }
        else{
            return {status: false, message: "User not found"};
        }
    }

    async deleteUser(id: string, password?: string){
        const userExists = await this.getUserById(id);
        if(userExists.status){
            try{
                if(password){
                    if(!(await this.validatePassword(password, userExists.user.password))){
                        return {status: false, message: "Invalid password"};
                    }    
                }
                if(userExists.user.profilePicture){
                    const imageDeleted = await this.deleteProfilePicture(id);
                    if(!imageDeleted.status){
                        return {status: false, message: "Error deleting the image"};
                    }
                }
                await connection.del().table('users').where('id', id);
                return {status: true, message: "Deleted successfully"};
            }
            catch(err){
                console.log(err);
                return {status: false, error: err, message: "An error occurred"};
            }
        }
        else{
            return {status: false, message: "User not found"};
        }
    }

    async validatePassword(password: string, encryptedPassword: string){
        return await bcrypt.compare(password, encryptedPassword);
    }

    async hashPassword(password: string){
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

    async setProfilePicture(relativePath: string | null, id: string, profilePicture: string){
        const pictureBuffer = Buffer.from(profilePicture, 'base64');
        relativePath = path.join('src', 'uploads', 'profile-pictures', `${id}-profilepic.jpg`);
        let absolutePath = path.join(__dirname, '..', '..', relativePath);
        fs.writeFile(absolutePath, pictureBuffer, (err) => {
            if(err){
                console.log(err);
                return {status: false, error: err};
            }
        });
        return {status: true, relativePath};
    }

    async deleteProfilePicture(id: string){
        const relativePath = path.join('src', 'uploads', 'profile-pictures', `${id}-profilepic.jpg`);
        let absolutePath = path.join(__dirname, '..', '..', relativePath);
        fs.rm(absolutePath, (err) => {
            if(err){
                console.log(err);
                return {status: false, error: err};
            }
        });
        return {status: true, message: "Image deleted"};
    }

}

export default new UserService();