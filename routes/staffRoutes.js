const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { requireLogin, requireRole } = require('../middleware/auth');

router.use(requireLogin, requireRole('staff'));

router.get('/dashboard', staffController.dashboard);

router.post('/areas', staffController.addArea);
router.put('/areas/:id', staffController.updateArea);
router.delete('/areas/:id', staffController.deleteArea);

router.post('/projects', staffController.addProject);
router.put('/projects/:id', staffController.updateProject);
router.delete('/projects/:id', staffController.deleteProject);

router.post('/capacity', staffController.setCapacity);

module.exports = router;