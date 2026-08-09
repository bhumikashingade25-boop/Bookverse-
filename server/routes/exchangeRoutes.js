const express = require('express');
const router = express.Router();
const {
  getExchanges,
  createExchangeRequest,
  expressInterest,
  acceptExchangeRequest,
  rejectExchangeRequest,
  completeExchangeRequest
} = require('../controllers/exchangeController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getExchanges);
router.post('/', protect, createExchangeRequest);
router.post('/interest/:bookId', protect, expressInterest);
router.put('/:id/accept', protect, acceptExchangeRequest);
router.put('/:id/reject', protect, rejectExchangeRequest);
router.put('/:id/complete', protect, completeExchangeRequest);

module.exports = router;
