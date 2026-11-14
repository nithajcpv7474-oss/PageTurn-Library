const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const databaseDirectory = __dirname;
if (!fs.existsSync(databaseDirectory)) {
  fs.mkdirSync(databaseDirectory, { recursive: true });
}

const databasePath = path.join(databaseDirectory, 'pageturn.sqlite');
const db = new Database(databasePath);

db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

module.exports = db;
