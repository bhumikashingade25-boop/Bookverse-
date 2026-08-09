const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'DECLINED'],
    default: 'PENDING'
  }
}, { timestamps: true });

connectionRequestSchema.index({ sender: 1, recipient: 1 });

module.exports = mongoose.model('ConnectionRequest', connectionRequestSchema);
