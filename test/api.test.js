const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const Database = require('better-sqlite3');

// Use an isolated in-memory database for repeatable API tests.
const testDb = new Database(':memory:');
testDb.pragma('foreign_keys = ON');
testDb.exec(`
  CREATE TABLE readers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    genre TEXT NOT NULL,
    author TEXT NOT NULL,
    available INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reader_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    loan_date TEXT DEFAULT (date('now')),
    return_date TEXT,
    status TEXT DEFAULT 'borrowed',
    FOREIGN KEY(reader_id) REFERENCES readers(id),
    FOREIGN KEY(book_id) REFERENCES books(id)
  );
`);
testDb.prepare('INSERT INTO readers (name, email) VALUES (?, ?)').run('Test Reader', 'test@example.com');
testDb.prepare('INSERT INTO books (name, genre, author) VALUES (?, ?, ?)').run('Alpha Book', 'Fiction', 'Author A');
testDb.prepare('INSERT INTO books (name, genre, author) VALUES (?, ?, ?)').run('Zulu Book', 'History', 'Author Z');

// Patch the database module before loading the app's route modules.
require.cache[require.resolve('../src/db/database')] = {
  id: require.resolve('../src/db/database'),
  filename: require.resolve('../src/db/database'),
  loaded: true,
  exports: testDb
};
const app = require('../src/app');

test('GET /books returns all books', async () => {
  const response = await request(app).get('/books');
  assert.equal(response.status, 200);
  assert.equal(response.body.count, 2);
});

test('GET /books?sort=name&order=asc sorts A to Z', async () => {
  const response = await request(app).get('/books?sort=name&order=asc');
  assert.equal(response.status, 200);
  assert.equal(response.body.data[0].name, 'Alpha Book');
});

test('GET /books?sort=name&order=desc sorts Z to A', async () => {
  const response = await request(app).get('/books?sort=name&order=desc');
  assert.equal(response.status, 200);
  assert.equal(response.body.data[0].name, 'Zulu Book');
});

test('Unknown sort field returns exact 400 message', async () => {
  const response = await request(app).get('/books?sort=colour');
  assert.equal(response.status, 400);
  assert.equal(response.body.message, 'Cannot sort by that field.');
});

test('Genre search returns matching books', async () => {
  const response = await request(app).get('/books?genre=fiction');
  assert.equal(response.status, 200);
  assert.equal(response.body.count, 1);
});

test('POST /books validates required fields', async () => {
  const response = await request(app).post('/books').send({ name: 'Incomplete' });
  assert.equal(response.status, 400);
  assert.equal(response.body.message, 'Validation failed.');
});

test('POST /books creates a book', async () => {
  const response = await request(app).post('/books').send({
    name: 'New Book', genre: 'Science', author: 'Author N'
  });
  assert.equal(response.status, 201);
  assert.equal(response.body.data.name, 'New Book');
});

test('POST /loans and GET /loans JOIN reader and book names', async () => {
  const response = await request(app).post('/loans').send({ reader_id: 1, book_id: 1 });
  assert.equal(response.status, 201);
  const joined = await request(app).get('/loans');
  assert.equal(joined.status, 200);
  assert.equal(joined.body.data[0].reader_name, 'Test Reader');
  assert.equal(joined.body.data[0].book_name, 'Alpha Book');
});

test.after(() => testDb.close());
