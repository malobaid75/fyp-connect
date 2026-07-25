const userModel = require('../models/userModel');
const areaModel = require('../models/areaModel');
const projectModel = require('../models/projectModel');

// List all staff for students to browse. Renders the directory view.
exports.directory = async (req, res) => {
  const staff = await userModel.getAllStaff();
  res.render('student/directory', { staff, keyword: '' });
};

// Search staff by keyword (name, area, etc.). Falls back to full list
// when no keyword is provided.
exports.search = async (req, res) => {
  const { keyword } = req.query;
  const staff = keyword ? await userModel.searchStaff(keyword) : await userModel.getAllStaff();
  res.render('student/directory', { staff, keyword: keyword || '' });
};

// View a staff member's profile including their areas of interest and
// project ideas. Returns 404 if the requested user is not a staff member.
exports.viewProfile = async (req, res) => {
  const staffId = req.params.id;
  const staff = await userModel.findById(staffId);
  if (!staff || staff.role !== 'staff') return res.status(404).send('Profile not found.');

  const areas = await areaModel.findByStaff(staffId);
  const projects = await projectModel.findByStaff(staffId);
  res.render('student/profile', { staff, areas, projects });
};