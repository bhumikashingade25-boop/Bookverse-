const mongoose = require('mongoose');

const clubMemberSchema = new mongoose.Schema({
  club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

clubMemberSchema.index({ club: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('ClubMember', clubMemberSchema);
