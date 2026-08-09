const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  bannerUrl: { type: String, required: true },
  memberCount: { type: Number, default: 1 },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  featuredBookTitle: { type: String, default: 'Dune' },
  featuredBookAuthor: { type: String, default: 'Frank Herbert' },
  featuredBookCover: { type: String, default: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80' }
}, { timestamps: true });

module.exports = mongoose.model('Club', clubSchema);
