const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', default: null },
  bookTitle: { type: String, default: '' },
  bookAuthor: { type: String, default: '' },
  bookCover: { type: String, default: '' },
  type: {
    type: String,
    enum: [
      'Finished Reading',
      'Currently Reading',
      'Available for Exchange',
      'Book Recommendation',
      'Reading Achievement',
      'Reading Goal',
      'New Book Added'
    ],
    default: 'Finished Reading'
  },
  content: { type: String, required: true },
  rating: { type: Number, default: 5 },
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
