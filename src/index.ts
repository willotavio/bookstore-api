const express = require('express');
const app = express();

app.use(express.urlencoded({
    extends: false
}));
app.use(express.json());

const bookRouter = require('./routes/BookRouter');
app.use('/book', bookRouter);
const authorRouter = require('./routes/AuthorRouter');
app.use('/author', authorRouter);

app.listen(3000, () => {
    console.log('Server running');
})