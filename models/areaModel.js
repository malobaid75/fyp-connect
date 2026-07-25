const db = require('../db/database');

// Get all areas of interest for a staff member.
function findByStaff(staffId) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM areas_of_interest WHERE staff_id = ?`, [staffId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

// Get a single area by id.
function findById(id) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM areas_of_interest WHERE id = ?`, [id], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

// Create a new area and return its id.
function create(staffId, name, description) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO areas_of_interest (staff_id, name, description) VALUES (?, ?, ?)`;
    db.run(sql, [staffId, name, description], function (err) {
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
}

// Update an existing area record.
function update(id, name, description) {
  return new Promise((resolve, reject) => {
    db.run(`UPDATE areas_of_interest SET name = ?, description = ? WHERE id = ?`, [name, description, id], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// Remove an area.
function remove(id) {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM areas_of_interest WHERE id = ?`, [id], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = { findByStaff, findById, create, update, remove };