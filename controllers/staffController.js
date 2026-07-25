const userModel = require('../models/userModel');
const areaModel = require('../models/areaModel');
const projectModel = require('../models/projectModel');

// Dashboard: gather the current staff user's areas, projects and profile
// and render the staff dashboard view.
exports.dashboard = async (req, res) => {
  const staffId = req.session.user.id;
  const areas = await areaModel.findByStaff(staffId);
  const projects = await projectModel.findByStaff(staffId);
  const user = await userModel.findById(staffId);
  res.render('staff/dashboard', { areas, projects, user, error: null });
};

// Create a new area of interest for the logged-in staff member.
exports.addArea = async (req, res) => {
  const { name, description } = req.body;
  if (!name || !name.trim()) return res.redirect('/staff/dashboard');
  await areaModel.create(req.session.user.id, name.trim(), description || '');
  res.redirect('/staff/dashboard');
};

// Update an existing area. Authorization: only the owner (staff_id)
// update their own area records.
exports.updateArea = async (req, res) => {
  const area = await areaModel.findById(req.params.id);
  if (!area || area.staff_id !== req.session.user.id) {
    return res.status(403).send('You can only edit your own areas of interest.');
  }
  const { name, description } = req.body;
  await areaModel.update(area.id, name.trim(), description || '');
  res.redirect('/staff/dashboard');
};

// Delete an area. Authorization enforced similarly to update.
exports.deleteArea = async (req, res) => {
  const area = await areaModel.findById(req.params.id);
  if (!area || area.staff_id !== req.session.user.id) {
    return res.status(403).send('You can only delete your own areas of interest.');
  }
  await areaModel.remove(area.id);
  res.redirect('/staff/dashboard');
};


// Create a new project idea associated with the staff user and optionally
// an area of interest.
exports.addProject = async (req, res) => {
  const { title, description, area_id } = req.body;
  if (!title || !title.trim()) return res.redirect('/staff/dashboard');
  await projectModel.create(req.session.user.id, area_id || null, title.trim(), description || '');
  res.redirect('/staff/dashboard');
};

// Update project idea with authorization check to ensure staff owns it.
exports.updateProject = async (req, res) => {
  const project = await projectModel.findById(req.params.id);
  if (!project || project.staff_id !== req.session.user.id) {
    return res.status(403).send('You can only edit your own project ideas.');
  }
  const { title, description, area_id } = req.body;
  await projectModel.update(project.id, title.trim(), description || '', area_id || null);
  res.redirect('/staff/dashboard');
};

// Delete project idea with ownership check.
exports.deleteProject = async (req, res) => {
  const project = await projectModel.findById(req.params.id);
  if (!project || project.staff_id !== req.session.user.id) {
    return res.status(403).send('You can only delete your own project ideas.');
  }
  await projectModel.remove(project.id);
  res.redirect('/staff/dashboard');
};


// Set supervision capacity for the staff user. Basic validation is applied.
exports.setCapacity = async (req, res) => {
  const capacity = parseInt(req.body.capacity, 10);
  if (isNaN(capacity) || capacity < 0) {
    return res.redirect('/staff/dashboard');
  }
  await userModel.setCapacity(req.session.user.id, capacity);
  res.redirect('/staff/dashboard');
};