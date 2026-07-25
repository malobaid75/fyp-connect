// Test helper: clear main tables and reset SQLite autoincrement counters
// so each test run starts from a clean and predictable state.
function resetDatabase(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('DELETE FROM project_ideas');
      db.run('DELETE FROM areas_of_interest');
      db.run('DELETE FROM users');
      db.run(
        "DELETE FROM sqlite_sequence WHERE name IN ('users','areas_of_interest','project_ideas')",
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  });
}

module.exports = { resetDatabase };