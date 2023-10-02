import connection from '../database/connection';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import JWT_SECRET from '../config';

interface LoginResult{
    status: boolean,
    token?: string;
    message?: string;
}

export interface User{
    name?: string;
    email?: string;
    password?: string;
    role?: number;
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
            const salt = await bcrypt.genSalt(10);
            if(user.password){
                user.password = await bcrypt.hash(user.password, salt);
            }
            await connection.insert({...user, id}).table('users');
            return {status: true, user};
        }
        catch(err){
            console.log(err);
            return {status: false, error: err, message: "An error occurred"};
        }
    }

    async login(email: string, password: string): Promise<LoginResult>{
        const user = await this.getUserByEmail(email);
        if(user.user){
            const passwordMatches = await bcrypt.compare(password, user.user[0].password);
            if(passwordMatches){
                return new Promise((resolve, reject) => {
                    jwt.sign({id: user.user[0].id, email: user.user[0].email}, JWT_SECRET.JWT_SECRET, {expiresIn: '48h'}, (err, token) => {
                        if(token){
                            resolve({status: true, token: token});    
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
            try{
                const salt = await bcrypt.genSalt(10); 
                const password = await bcrypt.hash(user.password || "", salt);
                user.password = password;
                await connection.update(user).table('users').where('id', id);
                return {status: true};
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

    async deleteUser(id: string){
        const userExists = await this.getUserById(id);
        if(userExists.status){
            try{
                await connection.del().table('users').where('id', id);
                return {status: true};
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