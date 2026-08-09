const mongoose = require('mongoose');

const exchangeTransactionSchema = new mongoose.Schema({
  exchangeRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'ExchangeRequest', required: true, unique: true },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookOne: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  bookTwo: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  completedAt: { type: Date, default: Date.now },
  requesterRating: { type: Number, default: 5 },
  recipientRating: { type: Number, default: 5 },
  requesterReviewText: { type: String, default: '' },
  recipientReviewText: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('ExchangeTransaction', exchangeTransactionSchema);
