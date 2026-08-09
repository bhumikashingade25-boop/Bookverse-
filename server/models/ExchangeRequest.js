const mongoose = require('mongoose');

const exchangeRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  requestedBook: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  offeredBook: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  exchangeMethod: {
    type: String,
    enum: ['PHYSICAL_MEET', 'ONLINE_DELIVERY'],
    default: 'PHYSICAL_MEET'
  },
  status: {
    type: String,
    enum: [
      'REQUESTED',
      'ACCEPTED',
      'REJECTED',
      'CHAT_ENABLED',
      'ADDRESS_SHARED',
      'IN_TRANSIT',
      'DELIVERED',
      'COMPLETED',
      'CANCELLED'
    ],
    default: 'REQUESTED',
    index: true
  },
  requesterAddress: { type: String, default: '' },
  recipientAddress: { type: String, default: '' },
  requesterConfirmed: { type: Boolean, default: false },
  recipientConfirmed: { type: Boolean, default: false },
  notes: { type: String, default: '' }
}, { timestamps: true });

exchangeRequestSchema.index({ requester: 1, recipient: 1 });

module.exports = mongoose.model('ExchangeRequest', exchangeRequestSchema);
