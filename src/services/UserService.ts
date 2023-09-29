import connection from '../database/connection';

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

}

export default new UserService();