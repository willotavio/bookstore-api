const con = require('../database/connection');

class BookService{

    async getBooks(){
        try{
            const books = await con.select().table('books');
            return {status: true, books: books};
        }
        catch(err){
            console.log(err);
            return {status: false, message: "An error occurred"};
        }
    }

}

export = new BookService();