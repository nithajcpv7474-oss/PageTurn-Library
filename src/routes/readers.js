const express = require('express');
const db = require('../db/database');
const { validateReader } = require('../utils/validation');

const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    const readers = db.prepare(
      'SELECT id, name, email, created_at FROM readers ORDER BY id'
    ).all();
    return res.status(200).json({ success: true, count: readers.length, data: readers });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    const reader = db.prepare(
      'SELECT id, name, email, created_at FROM readers WHERE id = ?'
    ).get(req.params.id);
    if (!reader) {
      return res.status(404).json({ success: false, message: 'Reader not found.' });
    }
    return res.status(200).json({ success: true, data: reader });
  } catch (error) {
    return next(error);
  }
});

router.post('/', (req, res, next) => {
  try {
    const result = validateReader(req.body);
    if (!result.valid) {
      return res.status(400).json({
        success: false, message: 'Validation failed.', errors: result.errors
      });
    }
    const info = db.prepare(
      'INSERT INTO readers (name, email) VALUES (?, ?)'
    ).run(result.values.name, result.values.email);
    const reader = db.prepare('SELECT * FROM readers WHERE id = ?').get(info.lastInsertRowid);
    return res.status(201).json({ success: true, message: 'Reader created.', data: reader });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
