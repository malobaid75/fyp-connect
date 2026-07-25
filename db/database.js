const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Allows tests to point this at a separate throwaway file via env var,
// so running the test suite never touches the real fypconnect.db
const dbFile = process.env.DB_FILE || 'fypconnect.db';
const dbPath = path.join(__dirname, dbFile);
const schemaPath = path.join(__dirname, 'schema.sql');

const db = new sqlite3.Database(dbPath);

const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema, (err) => {
  if (err) console.error('Failed to initialise schema:', err.message);
});

module.exports = db;