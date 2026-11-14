const express = require('express');
const cors = require('cors');

const booksRouter = require('./routes/books');
const readersRouter = require('./routes/readers');
const loansRouter = require('./routes/loans');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to PageTurn Library API',
    endpoints: ['/readers', '/books', '/loans']
  });
});

app.use('/readers', readersRouter);
app.use('/books', booksRouter);
app.use('/loans', loansRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
