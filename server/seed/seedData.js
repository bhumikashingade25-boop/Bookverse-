const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
const Post = require('../models/Post');
const ExchangeRequest = require('../models/ExchangeRequest');
const Message = require('../models/Message');
const Club = require('../models/Club');
const Achievement = require('../models/Achievement');
const ReadingProgress = require('../models/ReadingProgress');
const Notification = require('../models/Notification');
const Wishlist = require('../models/Wishlist');

const seedData = async () => {
  try {
    console.log('Clearing BookVerse collections to clean slate...');

    // Clear all default collections
    await User.deleteMany({});
    await Book.deleteMany({});
    await Post.deleteMany({});
    await ExchangeRequest.deleteMany({});
    await Message.deleteMany({});
    await Club.deleteMany({});
    await Achievement.deleteMany({});
    await ReadingProgress.deleteMany({});
    await Notification.deleteMany({});
    await Wishlist.deleteMany({});

    console.log('BookVerse clean slate initialized successfully! (0 default books, 0 default users)');
  } catch (err) {
    console.error('Clean slate error:', err);
  }
};

module.exports = seedData;
