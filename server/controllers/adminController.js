const User = require('../models/User');
const Book = require('../models/Book');
const ExchangeRequest = require('../models/ExchangeRequest');
const ExchangeTransaction = require('../models/ExchangeTransaction');
const Club = require('../models/Club');
const Post = require('../models/Post');

exports.getAdminDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBooks = await Book.countDocuments();
    const activeListings = await Book.countDocuments({ status: 'AVAILABLE' });
    const totalExchanges = await ExchangeRequest.countDocuments();
    const completedExchanges = await ExchangeTransaction.countDocuments();
    const totalClubs = await Club.countDocuments();
    const totalPosts = await Post.countDocuments();

    const recentUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(5);
    const recentBooks = await Book.find().populate('owner', 'name').sort({ createdAt: -1 }).limit(5);
    const recentExchanges = await ExchangeRequest.find()
      .populate('requester', 'name')
      .populate('recipient', 'name')
      .populate('requestedBook', 'title')
      .populate('offeredBook', 'title')
      .sort({ updatedAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalBooks,
        activeListings,
        totalExchanges,
        completedExchanges,
        booksReused: completedExchanges * 2,
        totalClubs,
        totalPosts
      },
      recentUsers,
      recentBooks,
      recentExchanges
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
