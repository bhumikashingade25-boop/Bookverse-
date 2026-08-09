const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  bio: { type: String, default: 'Passionate reader & book enthusiast.' },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
  location: {
    city: { type: String, default: 'Mumbai' },
    state: { type: String, default: 'Maharashtra' },
    country: { type: String, default: 'India' },
    coordinates: { type: [Number], default: [72.8777, 19.0760] } // [longitude, latitude]
  },
  preferredRadiusKm: { type: Number, default: 15 },
  favoriteGenres: [{ type: String }],
  favoriteAuthors: [{ type: String }],
  readingGoal: {
    yearlyTarget: { type: Number, default: 24 },
    completedThisYear: { type: Number, default: 8 }
  },
  streakDays: { type: Number, default: 12 },
  totalBooksRead: { type: Number, default: 15 },
  totalExchanges: { type: Number, default: 6 },
  followersCount: { type: Number, default: 42 },
  followingCount: { type: Number, default: 35 },
  isAdmin: { type: Boolean, default: false },
  firebaseUid: { type: String, default: null }
}, { timestamps: true });

userSchema.index({ 'location.city': 1 });

module.exports = mongoose.model('User', userSchema);
