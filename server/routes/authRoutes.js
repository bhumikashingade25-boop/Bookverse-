const express = require('express');
const router = express.Router();
const { register, login, getMe, getDemoUsers } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/demo-users', getDemoUsers);
router.get('/me', protect, getMe);

module.exports = router;

