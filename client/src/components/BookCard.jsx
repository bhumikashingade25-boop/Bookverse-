import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Repeat, Bookmark, Sparkles, Heart, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { expressInterestApi } from '../services/api';

const BookCard = ({ book, onWishlist, onExchangeRequest }) => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [interestSent, setInterestSent] = useState(false);
  const [interestLoading, setInterestLoading] = useState(false);

  const isAvailable = book.status === 'AVAILABLE';
  const ownerId = book.owner?._id || book.owner;
  const isMyBook = currentUser?._id && ownerId && currentUser._id.toString() === ownerId.toString();

  const handleInterest = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Please login to express interest in this book', 'info');
      return;
    }
    if (isMyBook) {
      showToast('This is your listed book', 'info');
      return;
    }

    try {
      setInterestLoading(true);
      const res = await expressInterestApi(book._id);
      if (res.data.success) {
        setInterestSent(true);
        showToast(res.data.message || `Interest sent to ${book.owner?.name || 'the owner'}!`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error sending interest', 'error');
    } finally {
      setInterestLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group relative bg-[#15171E] border border-white/10 hover:border-gold-500/50 p-5 rounded-3xl shadow-xl flex flex-col justify-between transition-all duration-300 space-y-4"
    >
      {/* Top Media & Badge Container */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-black/40 border border-white/5">
        <img
          src={book.coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80'}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide shadow-xl uppercase backdrop-blur-xl border ${
            isMyBook
              ? 'bg-purple-900/80 text-purple-100 border-purple-500/50'
              : isAvailable 
              ? 'bg-black/70 text-gold-400 border-gold-500/50' 
              : 'bg-amber-900/80 text-amber-100 border-amber-500/50'
          }`}>
            {isMyBook ? 'Your Listed Book' : isAvailable ? 'Available to Swap' : 'Pending Exchange'}
          </span>
        </div>

        {/* Wishlist Button */}
        {onWishlist && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onWishlist(book._id);
            }}
            className="absolute top-3 right-3 p-2.5 rounded-full bg-black/60 hover:bg-gold-500 hover:text-black text-white backdrop-blur-md transition shadow-md"
            title="Save to Wishlist"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        )}

        {/* Condition Tag */}
        <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-lg text-xs text-gray-200 border border-white/10 flex items-center gap-1.5">
          <span className="text-gray-400">Condition:</span>
          <span className="text-gold-400 font-bold">{book.condition || 'Like New'}</span>
        </div>

        {/* Distance Badge */}
        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs text-gray-300 border border-white/10 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-gold-400" />
          <span>{book.location?.city || 'Mumbai'} • {book.distanceKm || 2.5} km</span>
        </div>
      </div>

      {/* Book Metadata & Title */}
      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gold-400 uppercase tracking-wider bg-gold-500/10 px-2.5 py-0.5 rounded-md border border-gold-500/20">
            {book.genre || 'General'}
          </span>
          <div className="flex items-center gap-1 text-gold-400 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-gold-400" />
            <span>{book.rating || 4.9}</span>
            <span className="text-gray-500 font-normal">({book.reviewCount || 18})</span>
          </div>
        </div>

        <Link to={`/books/${book._id}`} className="block group-hover:text-gold-300 transition">
          <h3 className="font-serif font-bold text-xl text-white line-clamp-1 mt-1">
            {book.title}
          </h3>
        </Link>
        <p className="text-xs text-gray-400">by <span className="text-gray-300 font-medium">{book.author}</span></p>

        {book.description && (
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed pt-1">
            {book.description}
          </p>
        )}
      </div>

      {/* Owner Info & Action Row */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
        <Link to={`/profile/${ownerId}`} className="flex items-center gap-2 truncate group/owner">
          {book.owner?.avatar ? (
            <img src={book.owner.avatar} alt="" className="w-7 h-7 rounded-full object-cover border border-gold-500/30 shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#1F2430] border border-white/10 flex items-center justify-center text-[10px] text-gold-400 font-bold shrink-0">
              {book.owner?.name?.[0] || 'R'}
            </div>
          )}
          <div className="truncate">
            <p className="text-xs font-semibold text-gray-200 group-hover/owner:text-gold-300 truncate transition">
              Posted by <span className="text-white font-bold">{book.owner?.name || 'Local Reader'}</span>
            </p>
            <p className="text-[10px] text-gray-500">{book.owner?.location?.city || 'Mumbai'}</p>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 shrink-0">
          {!isMyBook && isAvailable && (
            <button
              onClick={handleInterest}
              disabled={interestLoading || interestSent}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                interestSent 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-[#1F2430] text-gold-300 hover:bg-gold-500 hover:text-black border-gold-500/30'
              }`}
              title="Express interest and notify owner"
            >
              {interestSent ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Interested ✓</span>
                </>
              ) : (
                <>
                  <Heart className="w-3.5 h-3.5" />
                  <span>I'm Interested</span>
                </>
              )}
            </button>
          )}

          {onExchangeRequest && isAvailable && !isMyBook ? (
            <button
              onClick={() => onExchangeRequest(book)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-black font-extrabold px-3 py-1.5 rounded-xl text-xs transition shadow-lg active:scale-95 shrink-0"
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Swap</span>
            </button>
          ) : (
            <Link
              to={`/books/${book._id}`}
              className="text-xs font-bold text-gold-400 hover:text-gold-300 px-3 py-1.5 rounded-xl bg-[#1F2430] border border-white/10 hover:border-gold-500/30 transition shrink-0"
            >
              View
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BookCard;
