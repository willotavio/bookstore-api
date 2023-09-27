const connection = require('../database/connection');

class BookService{

    async getBooks(){
        try{
            const books = await connection.select().table('books');
            return {status: true, books: books};
        }
        catch(err){
            console.log(err);
            return {status: false, message: "An error occurred"};
        }
    }

    async getBookById(id: string){
        try{
            const book = await connection.select().table('books').where('id', id);
            if(book.length > 0){
                return {status: true, book: book}
            }
            else{
                return {status: false, message: "Book not found"}
            }
        }
        catch(err){
            console.log(err);
            return {status: false, message: "An error occurred"};
        }
    }

}

export = new BookService();