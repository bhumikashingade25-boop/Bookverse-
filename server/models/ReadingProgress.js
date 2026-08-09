const mongoose = require('mongoose');

const readingProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  coverUrl: { type: String, default: '' },
  pagesRead: { type: Number, default: 0 },
  totalPages: { type: Number, default: 300 },
  percentage: { type: Number, default: 0 },
  status: { type: String, enum: ['WANT_TO_READ', 'CURRENTLY_READING', 'COMPLETED'], default: 'CURRENTLY_READING' },
  targetCompletionDate: { type: String, default: '2026-09-01' }
}, { timestamps: true });

readingProgressSchema.index({ user: 1, book: 1 }, { unique: true });

module.exports = mongoose.model('ReadingProgress', readingProgressSchema);
