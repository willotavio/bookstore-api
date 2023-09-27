const express = require('express');
const app = express();

const bookRouter = require('./routes/bookRouter');
app.use('/book', bookRouter);

app.listen(3000, () => {
    console.log('Server running');
})