const express = require('express');
const router = express.Router();
const { 
  getUserProfile, 
  updateUserProfile, 
  followUser, 
  unfollowUser, 
  getAllUsers,
  sendConnectionRequest,
  acceptConnectionRequest,
  declineConnectionRequest,
  getConnectionNetwork
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/', getAllUsers);
router.get('/network/status', protect, getConnectionNetwork);
router.post('/requests/:requestId/accept', protect, acceptConnectionRequest);
router.post('/requests/:requestId/decline', protect, declineConnectionRequest);
router.post('/:id/connect', protect, sendConnectionRequest);
router.get('/:id', getUserProfile);
router.put('/:id', protect, updateUserProfile);
router.post('/:id/follow', protect, followUser);
router.delete('/:id/follow', protect, unfollowUser);

module.exports = router;
