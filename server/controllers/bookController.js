const Book = require('../models/Book');
const Post = require('../models/Post');
const Wishlist = require('../models/Wishlist');
const Notification = require('../models/Notification');
const { triggerN8nWorkflow } = require('../services/n8nService');

// Get All Books with Search, Filters & Sorting
exports.getBooks = async (req, res) => {
  try {
    const { query, genre, condition, availability, sort, distance } = req.query;

    let filter = {};

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
        { genre: { $regex: query, $options: 'i' } }
      ];
    }

    if (genre && genre !== 'All') {
      filter.genre = genre;
    }

    if (condition && condition !== 'All') {
      filter.condition = condition;
    }

    if (availability && availability !== 'All') {
      filter.status = availability;
    }

    let sortOptions = { createdAt: -1 }; // default: Recently Added

    if (sort === 'Most Popular') sortOptions = { exchangeCount: -1 };
    if (sort === 'Highest Rated') sortOptions = { rating: -1 };
    if (sort === 'Nearest') sortOptions = { distanceKm: 1 };

    const books = await Book.find(filter)
      .populate('owner', 'name avatar location')
      .sort(sortOptions);

    res.json({ success: true, count: books.length, books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Book by ID
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('owner', 'name avatar location city streakDays rating');
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.json({ success: true, book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create / Upload New Book
exports.createBook = async (req, res) => {
  try {
    const { title, author, isbn, genre, condition, description, coverUrl, photoBook, preferredExchangeGenre, location } = req.body;

    const book = await Book.create({
      title,
      author,
      isbn: isbn || '',
      genre,
      condition,
      description,
      coverUrl,
      photoBook: photoBook || [],
      preferredExchangeGenre: preferredExchangeGenre || 'Any',
      owner: req.user._id,
      location: location || req.user.location,
      distanceKm: (Math.random() * 5 + 0.5).toFixed(1)
    });

    // Auto-create a feed post announcing the new book available for exchange
    await Post.create({
      author: req.user._id,
      book: book._id,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookCover: book.coverUrl,
      type: 'Available for Exchange',
      content: `Just listed "${book.title}" by ${book.author} for exchange! Looking for ${book.preferredExchangeGenre} books.`,
      rating: 5
    });

    // Check if any users have this book in their wishlist and send notifications
    const wishlists = await Wishlist.find({ title: { $regex: title, $options: 'i' } }).populate('user');
    for (const w of wishlists) {
      await Notification.create({
        recipient: w.user._id,
        sender: req.user._id,
        type: 'WISHLIST_AVAILABLE',
        title: 'Wishlist Book Available!',
        message: `"${book.title}" from your wishlist was just listed by ${req.user.name}.`,
        link: `/books/${book._id}`
      });
    }

    // Trigger n8n Automation
    await triggerN8nWorkflow('BOOK_CREATED', { bookId: book._id, title: book.title, owner: req.user.name });

    res.status(201).json({ success: true, book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Book
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (book.owner.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this book' });
    }

    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, book: updatedBook });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Book
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (book.owner.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this book' });
    }

    await Book.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
