import connection from '../database/connection';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

export interface Book{
    title?: string,
    synopsis?: string,
    releaseDate?: string,
    price?: number,
    authorId?: string,
    coverImage?: string
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
                return {status: true, book: book[0]}
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
            let relativePath = null;
            if(book.coverImage){
                const coverSetted = await this.setCoverImage(relativePath, id, book.coverImage);
                if(coverSetted.relativePath){
                    relativePath = coverSetted.relativePath;     
                }
                else{
                    return { status: false, message: "Error saving the image" };
                }
            }
            await connection.insert({...book, id, coverImage: relativePath}).table('books');
            return { status: true, message: "Book created", book: { ...book, id } };
        }
        catch(err){
            console.log(err);
            return { status: false, message: "This author does not exists" };
        }
    }

    async updateBook(id: string, book: Book){
        try{
            const bookExists = await this.getBookById(id);
            if(bookExists.status){
                let relativePath = bookExists.book.coverImage;
                if(book.coverImage){
                const coverSetted = await this.setCoverImage(relativePath, id, book.coverImage);
                if(coverSetted.relativePath){
                    book.coverImage = coverSetted.relativePath;     
                }
                else{
                    return {status: false, message: "Error saving the image"};
                }
            }
                await connection.update(book).table('books').where('id', id);
                return {status: true, message: "Book updated"};
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
                if(bookExists.book.coverImage){
                    const imageDeleted = await this.deleteCoverImage(id);
                    if(!imageDeleted.status){
                        return {status: false, error: "Error deleting the image"};
                    }
                }
                await connection.del().table('books').where('id', id);
                return {status: true, message: "Book deleted"};
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

    async setCoverImage(relativePath: string | null, id: string, coverImage: string){
        const pictureBuffer = Buffer.from(coverImage, 'base64');
        relativePath = path.join('src', 'uploads', 'book-covers', `${id}-coverimage.jpg`);
        let absolutePath = path.join(__dirname, '..', '..', relativePath);
        fs.writeFile(absolutePath, pictureBuffer, (err) => {
            if(err){
                console.log(err);
                return {status: false, error: err};
            }
        });
        return {status: true, relativePath};
    }

    async deleteCoverImage(id: string){
        const relativePath = path.join('src', 'uploads', 'book-covers', `${id}-coverimage.jpg`);
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

export default new BookService();