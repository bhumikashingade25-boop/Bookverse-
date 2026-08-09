const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  exchangeRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'ExchangeRequest', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  isSystemMessage: { type: Boolean, default: false },
  sharedAddress: { type: String, default: '' },
  read: { type: Boolean, default: false }
}, { timestamps: true });

messageSchema.index({ exchangeRequest: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
