const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  isbn: { type: String, default: '' },
  genre: { type: String, required: true, index: true },
  condition: { 
    type: String, 
    enum: ['New', 'Good', 'Fair'], 
    default: 'Good' 
  },
  description: { type: String, required: true },
  coverUrl: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  preferredExchangeGenre: { type: String, default: 'Any' },
  location: {
    city: { type: String, default: 'Mumbai' },
    coordinates: { type: [Number], default: [72.8777, 19.0760] }
  },
  distanceKm: { type: Number, default: 3.2 },
  status: {
    type: String,
    enum: ['AVAILABLE', 'PENDING_EXCHANGE', 'EXCHANGED'],
    default: 'AVAILABLE',
    index: true
  },
  rating: { type: Number, default: 4.5 },
  reviewCount: { type: Number, default: 12 },
  exchangeCount: { type: Number, default: 2 },
  tags: [{ type: String }]
}, { timestamps: true });

bookSchema.index({ title: 'text', author: 'text', genre: 'text', description: 'text' });
bookSchema.index({ owner: 1, status: 1 });

module.exports = mongoose.model('Book', bookSchema);
