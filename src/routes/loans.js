const express = require('express');
const db = require('../db/database');

const router = express.Router();

// GET /loans - include the reader's name and the book's name using JOIN.
router.get('/', (req, res, next) => {
  try {
    const loans = db.prepare(`
      SELECT
        loans.id,
        loans.reader_id,
        readers.name AS reader_name,
        loans.book_id,
        books.name AS book_name,
        loans.loan_date,
        loans.return_date,
        loans.status
      FROM loans
      INNER JOIN readers ON readers.id = loans.reader_id
      INNER JOIN books ON books.id = loans.book_id
      ORDER BY loans.id DESC
    `).all();

    return res.status(200).json({ success: true, count: loans.length, data: loans });
  } catch (error) {
    return next(error);
  }
});

// POST /loans - lend an available book to an existing reader.
router.post('/', (req, res, next) => {
  try {
    const readerId = Number(req.body.reader_id);
    const bookId = Number(req.body.book_id);

    if (!Number.isInteger(readerId) || readerId <= 0 ||
        !Number.isInteger(bookId) || bookId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid reader_id and book_id are required.'
      });
    }

    const reader = db.prepare('SELECT id FROM readers WHERE id = ?').get(readerId);
    if (!reader) {
      return res.status(404).json({ success: false, message: 'Reader not found.' });
    }

    const book = db.prepare('SELECT id, available FROM books WHERE id = ?').get(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }
    if (book.available !== 1) {
      return res.status(409).json({ success: false, message: 'Book is not available.' });
    }

    const createLoan = db.transaction(() => {
      const info = db.prepare(
        'INSERT INTO loans (reader_id, book_id) VALUES (?, ?)'
      ).run(readerId, bookId);
      db.prepare('UPDATE books SET available = 0 WHERE id = ?').run(bookId);
      return info.lastInsertRowid;
    });

    const loanId = createLoan();
    const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(loanId);
    return res.status(201).json({ success: true, message: 'Loan created.', data: loan });
  } catch (error) {
    return next(error);
  }
});

// PATCH /loans/:id/return - mark a loan returned and make its book available.
router.patch('/:id/return', (req, res, next) => {
  try {
    const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(req.params.id);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found.' });
    }
    if (loan.status === 'returned') {
      return res.status(409).json({ success: false, message: 'This loan is already returned.' });
    }

    const returnLoan = db.transaction(() => {
      db.prepare(
        "UPDATE loans SET status = 'returned', return_date = date('now') WHERE id = ?"
      ).run(req.params.id);
      db.prepare('UPDATE books SET available = 1 WHERE id = ?').run(loan.book_id);
    });
    returnLoan();

    const updated = db.prepare('SELECT * FROM loans WHERE id = ?').get(req.params.id);
    return res.status(200).json({ success: true, message: 'Book returned.', data: updated });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
