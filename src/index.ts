import express from 'express';
import cors from 'cors';
import path from 'path';
var cookieParser = require('cookie-parser');

const app = express();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const allowedOrigins = ['http://localhost:3000'];
const options: cors.CorsOptions = {
    origin: allowedOrigins,
    credentials: true
}

app.use(cors(options));

app.use(express.urlencoded({
    extended: true
}));
app.use(express.json({ limit: '2mb' }));

app.use(cookieParser());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

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