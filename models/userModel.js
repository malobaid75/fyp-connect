const db = require('../db/database');

function create({ name, email, password, role }) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;
    db.run(sql, [name, email, password, role], function (err) {
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
}

function findByEmail(email) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function findById(id) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function setCapacity(staffId, capacity) {
  return new Promise((resolve, reject) => {
    db.run(`UPDATE users SET capacity = ? WHERE id = ? AND role = 'staff'`, [capacity, staffId], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function getAllStaff() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT id, name, email, capacity FROM users WHERE role = 'staff'`, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function searchStaff(keyword) {
  const like = `%${keyword}%`;
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT DISTINCT u.id, u.name, u.email, u.capacity
      FROM users u
      LEFT JOIN areas_of_interest a ON a.staff_id = u.id
      LEFT JOIN project_ideas p ON p.staff_id = u.id
      WHERE u.role = 'staff'
        AND (u.name LIKE ? OR a.name LIKE ? OR p.title LIKE ?)
    `;
    db.all(sql, [like, like, like], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = { create, findByEmail, findById, setCapacity, getAllStaff, searchStaff };