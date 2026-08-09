const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  type: {
    type: String,
    enum: [
      'CONNECTION_REQUEST',
      'CONNECTION_ACCEPTED',
      'EXCHANGE_REQUEST',
      'EXCHANGE_ACCEPTED',
      'EXCHANGE_REJECTED',
      'NEW_MESSAGE',
      'WISHLIST_AVAILABLE',
      'NEW_FOLLOWER',
      'COMMENT',
      'LIKE',
      'ACHIEVEMENT_UNLOCKED',
      'EXCHANGE_COMPLETED',
      'READING_GOAL_REACHED'
    ],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String, default: '' },
  connectionRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ConnectionRequest', default: null },
  read: { type: Boolean, default: false }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
