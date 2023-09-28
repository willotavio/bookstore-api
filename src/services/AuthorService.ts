const connection = require('../database/connection');
const crypto = require('crypto');

interface Author{
    name: string,
    biography: string,
    birthDate: string
}

class AuthorService{

    async getAuthors(){
        try{
            const authors = await connection.select().table('authors');
            return {status: true, authors};
        }
        catch(err){
            console.log(err);
            return {status: false, message: "An error occurred"};
        }
    }

    async getAuthorById(id: string){
        try{
            const author = await connection.select().table('authors').where('id', id);
            if(author.length > 0){
                return {status: true, author};
            }
            else{
                return {status: false, message: "Author not found"};
            }
        }
        catch(err){
            console.log(err);
            return {status: false, message: "An error occurred"};
        }
    }

    async addAuthor(author: Author){
        try{
            let id = crypto.randomUUID();
            await connection.insert({...author, id}).table('authors');
        }
        catch(err){
            console.log(err);
            return {status: false, message: "An error occurred"};
        }
    }

}

export = new AuthorService();