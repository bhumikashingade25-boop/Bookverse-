const express = require('express');
const router = express.Router();
const { getMessages, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/:exchangeId', protect, getMessages);
router.post('/', protect, sendMessage);

module.exports = router;
