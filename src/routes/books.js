const express = require('express');
const db = require('../db/database');
const { validateBook } = require('../utils/validation');

const router = express.Router();
const allowedSortFields = { name: 'name' };

// GET /books - list, search by genre, and apply the assignment's sorting twist.
router.get('/', (req, res, next) => {
  try {
    const { genre, sort, order } = req.query;
    let sql = 'SELECT id, name, genre, author, available, created_at FROM books';
    const parameters = [];

    if (genre) {
      sql += ' WHERE LOWER(genre) = LOWER(?)';
      parameters.push(String(genre).trim());
    }

    if (sort !== undefined) {
      if (!Object.prototype.hasOwnProperty.call(allowedSortFields, sort)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot sort by that field.'
        });
      }

      const normalizedOrder = String(order || 'asc').toLowerCase();
      if (!['asc', 'desc'].includes(normalizedOrder)) {
        return res.status(400).json({
          success: false,
          message: 'Order must be asc or desc.'
        });
      }

      // The column is selected only from an allow-list; values remain parameterized.
      sql += ` ORDER BY ${allowedSortFields[sort]} ${normalizedOrder.toUpperCase()}`;
    } else if (order !== undefined) {
      return res.status(400).json({
        success: false,
        message: 'The order parameter requires a valid sort field.'
      });
    }

    const books = db.prepare(sql).all(...parameters);
    return res.status(200).json({ success: true, count: books.length, data: books });
  } catch (error) {
    return next(error);
  }
});

// GET /books/:id - retrieve one book.
router.get('/:id', (req, res, next) => {
  try {
    const book = db.prepare(
      'SELECT id, name, genre, author, available, created_at FROM books WHERE id = ?'
    ).get(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }
    return res.status(200).json({ success: true, data: book });
  } catch (error) {
    return next(error);
  }
});

// POST /books - add a book.
router.post('/', (req, res, next) => {
  try {
    const result = validateBook(req.body);
    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: result.errors
      });
    }

    const insert = db.prepare(
      'INSERT INTO books (name, genre, author) VALUES (?, ?, ?)'
    );
    const info = insert.run(
      result.values.name, result.values.genre, result.values.author
    );
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(info.lastInsertRowid);
    return res.status(201).json({ success: true, message: 'Book created.', data: book });
  } catch (error) {
    return next(error);
  }
});

// PUT /books/:id - update a book's name and genre (author is also maintained).
router.put('/:id', (req, res, next) => {
  try {
    const existing = db.prepare('SELECT id FROM books WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }

    const result = validateBook(req.body);
    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: result.errors
      });
    }

    db.prepare(
      'UPDATE books SET name = ?, genre = ?, author = ? WHERE id = ?'
    ).run(result.values.name, result.values.genre, result.values.author, req.params.id);

    const updated = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
    return res.status(200).json({ success: true, message: 'Book updated.', data: updated });
  } catch (error) {
    return next(error);
  }
});

// DELETE /books/:id - delete a book unless it is referenced by a loan.
router.delete('/:id', (req, res, next) => {
  try {
    const existing = db.prepare('SELECT id FROM books WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }

    const loan = db.prepare('SELECT id FROM loans WHERE book_id = ? LIMIT 1').get(req.params.id);
    if (loan) {
      return res.status(409).json({
        success: false,
        message: 'This book cannot be deleted because it has loan records.'
      });
    }

    db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);
    return res.status(200).json({ success: true, message: 'Book deleted.' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
