const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  code: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  unlocked: { type: Boolean, default: false },
  unlockedAt: { type: Date, default: null },
  progress: { type: Number, default: 0 },
  maxProgress: { type: Number, default: 1 }
}, { timestamps: true });

achievementSchema.index({ user: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', achievementSchema);
