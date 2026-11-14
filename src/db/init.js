const db = require('./database');

db.exec(`
  CREATE TABLE IF NOT EXISTS readers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    genre TEXT NOT NULL,
    author TEXT NOT NULL,
    available INTEGER NOT NULL DEFAULT 1 CHECK (available IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reader_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    loan_date TEXT NOT NULL DEFAULT (date('now')),
    return_date TEXT,
    status TEXT NOT NULL DEFAULT 'borrowed'
      CHECK (status IN ('borrowed', 'returned')),
    FOREIGN KEY (reader_id) REFERENCES readers(id) ON DELETE RESTRICT,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT
  );
`);

const readerCount = db.prepare('SELECT COUNT(*) AS count FROM readers').get().count;
if (readerCount === 0) {
  const insertReader = db.prepare('INSERT INTO readers (name, email) VALUES (?, ?)');
  insertReader.run('Aarav Kumar', 'aarav@example.com');
  insertReader.run('Priya Sharma', 'priya@example.com');
  insertReader.run('Rahul Reddy', 'rahul@example.com');
}

const bookCount = db.prepare('SELECT COUNT(*) AS count FROM books').get().count;
if (bookCount === 0) {
  const insertBook = db.prepare(
    'INSERT INTO books (name, genre, author, available) VALUES (?, ?, ?, ?)'
  );
  insertBook.run('Atomic Habits', 'Self-help', 'James Clear', 1);
  insertBook.run('The Alchemist', 'Fiction', 'Paulo Coelho', 1);
  insertBook.run('Clean Code', 'Technology', 'Robert C. Martin', 1);
  insertBook.run('Wings of Fire', 'Biography', 'A. P. J. Abdul Kalam', 1);
}

console.log('SQLite database initialized and sample data is ready.');
db.close();
