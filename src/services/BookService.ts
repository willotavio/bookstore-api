import connection from '../database/connection';
import crypto from 'crypto';

export interface Book{
    title?: string,
    synopsis?: string,
    releaseDate?: string,
    price?: number,
    authorId?: string
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
        try{
            let id = crypto.randomUUID();
            await connection.insert({...book, id}).table('books');
            return {status: true};
        }
        catch(err){
            console.log(err);
            return {status: false, message: "This author does not exists"};
        }
    }

    async updateBook(id: string, book: Book){
        try{
            const bookExists = await this.getBookById(id);
            if(bookExists.status){
                await connection.update(book).table('books').where('id', id);
                return {status: true};
            }
            else{
                return {status: false, message: bookExists.message};
            }
        }
        catch(err){
            console.log(err);
            return {status: false, error: err, message: "An error occurred"};
        }
    }

    async deleteBook(id: string){
        try{
            const bookExists = await this.getBookById(id);
            if(bookExists.status){
                await connection.del().table('books').where('id', id);
                return {status: true};
            }
            else{
                return {status: false, message: bookExists.message};
            }
        }
        catch(err){
            console.log(err);
            return {status: false, error: err, message: "An error occurred"};
        }
    }

}

export default new BookService();