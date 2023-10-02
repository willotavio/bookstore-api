import express from 'express';
import cors from 'cors';

const app = express();

const allowedOrigins = ['http://localhost:3000'];
const options: cors.CorsOptions = {
    origin: allowedOrigins
}

app.use(cors(options));

app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

import bookRouter from './routes/BookRouter';
app.use('/book', bookRouter);
import authorRouter from './routes/AuthorRouter';
app.use('/author', authorRouter);
import userRouter from './routes/UserRouter';
app.use('/user', userRouter);
import authRouter from './routes/AuthRouter';
app.use('/auth', authRouter);

app.listen(8080, () => {
    console.log('Server running');
})