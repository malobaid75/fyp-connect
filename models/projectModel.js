const db = require('../db/database');

// Get all project ideas published by a staff member. Includes area name
// via a LEFT JOIN to provide context without requiring a separate query.
function findByStaff(staffId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT p.*, a.name AS area_name
      FROM project_ideas p
      LEFT JOIN areas_of_interest a ON a.id = p.area_id
      WHERE p.staff_id = ?
    `;
    db.all(sql, [staffId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

// Get a single project idea by id.
function findById(id) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM project_ideas WHERE id = ?`, [id], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

// Insert a new project idea and return its id.
function create(staffId, areaId, title, description) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO project_ideas (staff_id, area_id, title, description) VALUES (?, ?, ?, ?)`;
    db.run(sql, [staffId, areaId, title, description], function (err) {
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
}

// Update a project idea's title/description/area.
function update(id, title, description, areaId) {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE project_ideas SET title = ?, description = ?, area_id = ? WHERE id = ?`;
    db.run(sql, [title, description, areaId, id], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// Remove a project idea by id.
function remove(id) {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM project_ideas WHERE id = ?`, [id], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// Search for project ideas optionally filtering by keyword and/or area.
// Returns project rows joined with area and staff metadata to simplify
// rendering in the UI.
function search(keyword, areaId) {
  let sql = `
    SELECT p.*, a.name AS area_name, u.name AS staff_name, u.id AS staff_id
    FROM project_ideas p
    LEFT JOIN areas_of_interest a ON a.id = p.area_id
    LEFT JOIN users u ON u.id = p.staff_id
    WHERE 1=1
  `;
  const params = [];
  if (keyword) {
    sql += ` AND (p.title LIKE ? OR p.description LIKE ?)`;
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  if (areaId) {
    sql += ` AND p.area_id = ?`;
    params.push(areaId);
  }
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = { findByStaff, findById, create, update, remove, search };