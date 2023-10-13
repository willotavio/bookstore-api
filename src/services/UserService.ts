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
                return {status: true, user};
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
                return {status: true, user};
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
                const pictureBuffer = Buffer.from(user.profilePicture, 'base64');
                relativePath = path.join('src', 'uploads', 'profile-pictures', `${id}-profilepic.jpg`);
                let absolutePath = path.join(__dirname, '..', '..', relativePath);
                fs.writeFile(absolutePath, pictureBuffer, (err) => {
                    if(err){
                        console.log(err);
                        return {status: false, error: err, message: "Error saving the image"};
                    }
                });
            }
            const salt = await bcrypt.genSalt(10);
            if(user.password){
                user.password = await bcrypt.hash(user.password, salt);
            }
            await connection.insert({...user, id, profilePicture: relativePath}).table('users');
            return {status: true, user};
        }
        catch(err){
            console.log(err);
            return {status: false, error: err, message: "An error occurred"};
        }
    }

    async login(email: string, password: string): Promise<LoginResult>{
        const userFound = await this.getUserByEmail(email);
        if(userFound.user){
            const passwordMatches = await bcrypt.compare(password, userFound.user[0].password);
            if(passwordMatches){
                return new Promise((resolve, reject) => {
                    jwt.sign({id: userFound.user[0].id, email: userFound.user[0].email, role: userFound.user[0].role}, JWT_SECRET.JWT_SECRET, {expiresIn: '48h'}, (err, token) => {
                        if(token){
                            const { password, ...user } = userFound.user[0];
                            resolve({status: true, user, token: token});
                        }
                        reject({status: false, error: err, message: "An error occurred during token generation"});
                    })
                })
            }
            else{
                return {status: false, message: "Invalid password"};
            }
        }
        else{
            return {status: false, message: "Invalid email"};
        }
    }

    async updateUser(user: User, id: string){
        const userExists = await this.getUserById(id);
        if(userExists.status){
            let emailExists: boolean = false;
            if(user.email){
                emailExists = (await this.getUserByEmail(user.email)).status;
            }
            if(!user.email || !emailExists || userExists.user[0].email === user.email){
                try{
                    if(user.password){
                        const salt = await bcrypt.genSalt(10);
                        const password = await bcrypt.hash(user.password, salt);
                        user.password = password;
                    }
                    let relativePath = userExists.user[0].profilePicture;
                    if(user.profilePicture){
                        const pictureBuffer = Buffer.from(user.profilePicture, 'base64');
                        relativePath = path.join('src', 'uploads', 'profile-pictures', `${id}-profilepic.jpg`);
                        let absolutePath = path.join(__dirname, '..', '..', relativePath);
                        fs.writeFile(absolutePath, pictureBuffer, (err) => {
                            if(err){
                                console.log(err);
                                return {status: false, error: err, message: "Error saving the image"};
                            }
                        });
                    }
                    if(!user.role){
                        user.role === userExists.user[0].role;
                    }
                    await connection.update({...user, profilePicture: relativePath}).table('users').where('id', id);
                    const updatedUser = await this.getUserById(id);
                    return {status: true, user: updatedUser};
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
                const passwordMatches = await bcrypt.compare(currentPassword, userExists.user[0].password);
                if(passwordMatches){
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
                    const passwordMatches = await bcrypt.compare(password, userExists.user[0].password);
                    if(!passwordMatches){
                        return {status: false, message: "Invalid password"};
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

}

export default new UserService();