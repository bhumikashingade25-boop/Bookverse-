const express = require('express');
const router = express.Router();
const { getClubs, createClub, toggleJoinClub } = require('../controllers/clubController');
const { protect } = require('../middleware/auth');

router.get('/', getClubs);
router.post('/', protect, createClub);
router.post('/:id/join', protect, toggleJoinClub);

module.exports = router;
