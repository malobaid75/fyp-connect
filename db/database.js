const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Select the database file. Tests may set DB_FILE to use an isolated
// temporary database so the test suite does not mutate the main DB file.
const dbFile = process.env.DB_FILE || 'fypconnect.db';
const dbPath = path.join(__dirname, dbFile);
const schemaPath = path.join(__dirname, 'schema.sql');

// Open (or create) the SQLite database file
const db = new sqlite3.Database(dbPath);

// Ensure the schema exists by executing the bundled schema SQL. This is
// idempotent for most schema definitions (CREATE TABLE IF NOT EXISTS...).
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema, (err) => {
  if (err) console.error('Failed to initialise schema:', err.message);
});

module.exports = db;