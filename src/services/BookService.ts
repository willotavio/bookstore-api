const connection = require('../database/connection');
const crypto = require('crypto');

interface Book{
    title: string,
    synopsis: string,
    releaseDate: string,
    price: number,
    authorId: string
}

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

    async addBook(book: Book){
        let id = crypto.randomUUID();
        try{
            await connection.insert({...book, id}).table('books');
            return {status: true};
        }
        catch(err){
            console.log(err);
            return {status: false, message: "This author does not exists"};
        }
    }

}

export = new BookService();