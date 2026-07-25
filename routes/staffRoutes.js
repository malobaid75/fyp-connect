const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { requireLogin, requireRole } = require('../middleware/auth');

// All staff routes require the user to be logged in and have the 'staff' role.
router.use(requireLogin, requireRole('staff'));

// Dashboard and CRUD endpoints for areas of interest and project ideas.
router.get('/dashboard', staffController.dashboard);

router.post('/areas', staffController.addArea);
router.put('/areas/:id', staffController.updateArea);
router.delete('/areas/:id', staffController.deleteArea);

router.post('/projects', staffController.addProject);
router.put('/projects/:id', staffController.updateProject);
router.delete('/projects/:id', staffController.deleteProject);

// Set supervision capacity for the logged-in staff member.
router.post('/capacity', staffController.setCapacity);

module.exports = router;