import connection from '../database/connection';
import crypto from 'crypto';
import { deleteObject, getDownloadURL, ref, uploadString } from 'firebase/storage';
import { storage } from '../config/firebase';
import { v4 } from 'uuid';

export interface Book{
    title?: string,
    synopsis?: string,
    releaseDate?: string,
    price?: number,
    authorId?: string,
    coverImage?: string
}

class BookService{

    async getBooks(limit: number, offset: number, searchTitle?: string){
        try{
            let books;
            if(searchTitle){
                books = await connection.select('books.*', 'authors.name as authorName').table('books').limit(limit).offset(offset).join('authors', 'books.authorId', '=', 'authors.id').where("books.title", "like", `%${ searchTitle }%`);
            }
            else{
                books = await connection.select('books.*', 'authors.name as authorName').table('books').limit(limit).offset(offset).join('authors', 'books.authorId', '=', 'authors.id');
            }
            return { status: true, books: books };
        }
        catch(err){
            console.log(err);
            return { status: false, message: "An error occurred" };
        }
    }

    async getBookById(id: string){
        try{
            const book = await connection.select('books.*', 'authors.name as authorName').table('books').where('books.id', id).join('authors', 'books.authorId', '=', 'authors.id');
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
            let coverImageSetted;
            if(book.title && book.coverImage){
                coverImageSetted = await this.setCoverImage(book.title, book.coverImage);
                if(!coverImageSetted.status){
                    return { status: false, message: "Error saving the image" };
                }
            }
            await connection.insert({ ...book, id, coverImage: coverImageSetted?.status ? coverImageSetted.coverImageUrl : "https://firebasestorage.googleapis.com/v0/b/bookstore-api-b889d.appspot.com/o/book-covers%2Fnull.jpg?alt=media&token=575e25b9-fc67-4dd7-ae6f-82aa609d64a7" }).table('books');
            const addedBook = await this.getBookById(id);
            return { status: true, message: "Book created", book: addedBook.book };
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
                let coverImageSetted;
                if(book.coverImage){
                    coverImageSetted = await this.setCoverImage(bookExists.book.title, book.coverImage);
                    if(!coverImageSetted.status){
                        return { status: false, message: "Error saving the image" };
                    }
                    book.coverImage = coverImageSetted.coverImageUrl;
                    if(bookExists.book.coverImage !== "https://firebasestorage.googleapis.com/v0/b/bookstore-api-b889d.appspot.com/o/book-covers%2Fnull.jpg?alt=media&token=575e25b9-fc67-4dd7-ae6f-82aa609d64a7"){
                        const imageDeleted = await this.deleteCoverImage(bookExists.book.coverImage);
                        if(!imageDeleted.status){
                            return { status: false, error: "Error deleting the image" };
                        }
                    }
                }
                await connection.update(book).table('books').where('id', id);
                const updatedBook = await this.getBookById(id);
                return { status: true, message: "Book updated", book: updatedBook.book };
            }
            else{
                return { status: false, message: bookExists.message };
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
                if(bookExists.book.coverImage !== "https://firebasestorage.googleapis.com/v0/b/bookstore-api-b889d.appspot.com/o/book-covers%2Fnull.jpg?alt=media&token=575e25b9-fc67-4dd7-ae6f-82aa609d64a7"){
                    const imageDeleted = await this.deleteCoverImage(bookExists.book.coverImage);
                    if(!imageDeleted.status){
                        return { status: false, error: "Error deleting the image" };
                    }
                }
                await connection.del().table('books').where('id', id);
                return { status: true, message: "Book deleted" };
            }
            else{
                return { status: false, message: bookExists.message };
            }
        }
        catch(err){
            console.log(err);
            return {status: false, error: err, message: "An error occurred"};
        }
    }

    async setCoverImage(title: string | null, coverImage: string){
        try{
            const coverImagePath = `book-covers/${title}-${v4()}`;
            const storageRef = ref(storage, coverImagePath);
            await uploadString(storageRef, coverImage, 'data_url');
            const coverImageUrl = await getDownloadURL(storageRef);
            return { status: true, message: "Book cover setted", coverImageUrl };
        }
        catch(error){
            console.log(error);
            return { status: false, message: error };
        }
    }

    async deleteCoverImage(coverImageUrl: string){
        try{
            const url = new URL(coverImageUrl);
            const path = decodeURIComponent(url.pathname).split("o/")[1];
            const deleteRef = ref(storage, path);
            await deleteObject(deleteRef);
            return { status: true, message: "Book cover deleted" };
        }
        catch(error){
            console.log(error);
            return { status: false, message: error };
        }
    }

}

export default new BookService();