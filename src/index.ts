import express from 'express';
const app = express();

app.use(express.urlencoded());
app.use(express.json());

import bookRouter from './routes/BookRouter';
app.use('/book', bookRouter);
import authorRouter from './routes/AuthorRouter';
app.use('/author', authorRouter);
import userRouter from './routes/UserRouter';
app.use('/user', userRouter);

app.listen(3000, () => {
    console.log('Server running');
})