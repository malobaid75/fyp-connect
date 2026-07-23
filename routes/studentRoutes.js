const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { requireLogin, requireRole } = require('../middleware/auth');

router.use(requireLogin, requireRole('student'));

router.get('/directory', studentController.directory);
router.get('/search', studentController.search);
router.get('/profile/:id', studentController.viewProfile);

module.exports = router;