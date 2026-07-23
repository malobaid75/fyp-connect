const db = require('../db/database');

function findByStaff(staffId) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM areas_of_interest WHERE staff_id = ?`, [staffId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function findById(id) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM areas_of_interest WHERE id = ?`, [id], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function create(staffId, name, description) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO areas_of_interest (staff_id, name, description) VALUES (?, ?, ?)`;
    db.run(sql, [staffId, name, description], function (err) {
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
}

function update(id, name, description) {
  return new Promise((resolve, reject) => {
    db.run(`UPDATE areas_of_interest SET name = ?, description = ? WHERE id = ?`, [name, description, id], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function remove(id) {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM areas_of_interest WHERE id = ?`, [id], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = { findByStaff, findById, create, update, remove };