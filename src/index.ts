const express = require('express');
const app = express();

app.use(express.urlencoded({
    extends: false
}));
app.use(express.json());

const bookRouter = require('./routes/bookRouter');
app.use('/book', bookRouter);

app.listen(3000, () => {
    console.log('Server running');
})