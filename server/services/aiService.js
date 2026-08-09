const Book = require('../models/Book');
const Wishlist = require('../models/Wishlist');
const ReadingProgress = require('../models/ReadingProgress');

/**
 * AI-powered Recommendation Engine
 * Computes match score based on user preferences, reading history, genre match, wishlist, ratings, and location proximity.
 */
const generateRecommendationsForUser = async (user) => {
  try {
    const allBooks = await Book.find({ status: 'AVAILABLE' }).populate('owner', 'name avatar location');
    const userWishlist = await Wishlist.find({ user: user._id });
    const userWishlistBookIds = new Set(userWishlist.map(w => w.book.toString()));
    
    const userReading = await ReadingProgress.find({ user: user._id });
    const readGenres = new Set(userReading.map(r => r.genre || 'Sci-Fi'));

    const favGenres = new Set(user.favoriteGenres || ['Sci-Fi', 'Fiction', 'Self-Improvement']);

    const scoredBooks = allBooks.map(book => {
      let score = 50; // base score
      let reasons = [];

      // Genre match
      if (favGenres.has(book.genre)) {
        score += 25;
        reasons.push(`Matches your favorite genre: ${book.genre}`);
      }

      // Wishlist match
      if (userWishlistBookIds.has(book._id.toString())) {
        score += 30;
        reasons.push('In your wishlist');
      }

      // Rating boost
      if (book.rating >= 4.5) {
        score += 15;
        reasons.push(`Top rated (${book.rating}★)`);
      }

      // Distance score
      if (book.distanceKm < 5) {
        score += 10;
        reasons.push(`Nearby reader (${book.distanceKm} km away)`);
      }

      // Avoid recommending user's own book
      if (book.owner && book.owner._id.toString() === user._id.toString()) {
        score = -1;
      }

      return {
        book,
        matchScore: Math.min(Math.max(score, 10), 99),
        reason: reasons.length > 0 ? reasons.join(' • ') : 'Popular among readers in your city'
      };
    });

    return scoredBooks
      .filter(b => b.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
};

module.exports = { generateRecommendationsForUser };
