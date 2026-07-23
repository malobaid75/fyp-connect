const userModel = require('../models/userModel');
const areaModel = require('../models/areaModel');
const projectModel = require('../models/projectModel');

exports.directory = async (req, res) => {
  const staff = await userModel.getAllStaff();
  res.render('student/directory', { staff, keyword: '' });
};

exports.search = async (req, res) => {
  const { keyword } = req.query;
  const staff = keyword ? await userModel.searchStaff(keyword) : await userModel.getAllStaff();
  res.render('student/directory', { staff, keyword: keyword || '' });
};

exports.viewProfile = async (req, res) => {
  const staffId = req.params.id;
  const staff = await userModel.findById(staffId);
  if (!staff || staff.role !== 'staff') return res.status(404).send('Profile not found.');

  const areas = await areaModel.findByStaff(staffId);
  const projects = await projectModel.findByStaff(staffId);
  res.render('student/profile', { staff, areas, projects });
};