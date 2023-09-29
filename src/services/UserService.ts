import connection from '../database/connection';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

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

}

export default new UserService();