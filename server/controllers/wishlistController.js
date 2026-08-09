const Wishlist = require('../models/Wishlist');
const Book = require('../models/Book');

exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user._id })
      .populate({
        path: 'book',
        populate: { path: 'owner', select: 'name avatar location' }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { bookId } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const existing = await Wishlist.findOne({ user: req.user._id, book: bookId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Book is already in your wishlist' });
    }

    const wishlistEntry = await Wishlist.create({
      user: req.user._id,
      book: bookId
    });

    res.status(201).json({ success: true, wishlistEntry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;
    await Wishlist.findOneAndDelete({ user: req.user._id, book: bookId });
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
