import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Repeat, Bookmark, User, ShieldCheck, ArrowLeft, MessageSquare, Heart, CheckCircle2 } from 'lucide-react';
import Modal from '../components/Modal';
import RecommendationCarousel from '../components/RecommendationCarousel';
import { getBookByIdApi, getRecommendationsApi, addToWishlistApi, createExchangeApi, getBooksApi, expressInterestApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const BookDetailPage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [interestSent, setInterestSent] = useState(false);

  // Exchange Modal State
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [myBooks, setMyBooks] = useState([]);
  const [offeredBookId, setOfferedBookId] = useState('');

  const fetchBookDetail = async () => {
    try {
      setLoading(true);
      const res = await getBookByIdApi(id);
      if (res.data.success) {
        setBook(res.data.book);
      }

      const recRes = await getRecommendationsApi().catch(() => ({ data: { success: false } }));
      if (recRes.data?.success) setRecommendations(recRes.data.recommendations);

      if (currentUser) {
        const userBooksRes = await getBooksApi({ availability: 'AVAILABLE' });
        if (userBooksRes.data.success) {
          setMyBooks(userBooksRes.data.books.filter(b => (b.owner?._id || b.owner) === currentUser._id));
        }
      }
    } catch (err) {
      console.log('Book detail fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookDetail();
  }, [id, currentUser]);

  const handleWishlist = async () => {
    try {
      await addToWishlistApi(book._id);
      showToast('Added to Wishlist!');
    } catch (err) {
      showToast('Already in wishlist or error', 'info');
    }
  };

  const handleInterest = async () => {
    if (!currentUser) {
      showToast('Please login to express interest in this book', 'info');
      return;
    }
    if (isMyBook) {
      showToast('This is your listed book', 'info');
      return;
    }

    try {
      const res = await expressInterestApi(book._id);
      if (res.data.success) {
        setInterestSent(true);
        showToast(`🤝 Interest sent to ${book.owner?.name || 'the owner'}! They will be notified.`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error sending interest', 'error');
    }
  };

  const handleSendExchangeRequest = async (e) => {
    e.preventDefault();
    if (!offeredBookId) {
      showToast('Select a book to offer', 'error');
      return;
    }

    try {
      const res = await createExchangeApi({
        requestedBookId: book._id,
        offeredBookId
      });

      if (res.data.success) {
        showToast('Exchange request sent to owner! 🔄');
        setExchangeModalOpen(false);
        navigate('/exchanges');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error sending request', 'error');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-400">Loading book details...</div>;
  }

  if (!book) {
    return <div className="p-12 text-center text-rose-400">Book not found</div>;
  }

  const ownerId = book.owner?._id || book.owner;
  const isMyBook = currentUser?._id && ownerId && currentUser._id.toString() === ownerId.toString();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs text-gray-400 hover:text-gold-400 font-semibold transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Discover</span>
      </button>

      {/* Main Detail Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 glass-panel p-6 lg:p-8 rounded-3xl border border-white/10 shadow-2xl">
        
        {/* Cover Image */}
        <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-gold-500/40 relative bg-black/40">
          <img src={book.coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80'} alt={book.title} className="w-full h-full object-cover" />
          <span className="absolute top-3 left-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase backdrop-blur-md">
            {isMyBook ? 'Your Listed Book' : book.status}
          </span>
        </div>

        {/* Info Column */}
        <div className="md:col-span-2 space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <span className="text-xs font-bold text-gold-400 uppercase tracking-widest">{book.genre}</span>
              <h1 className="font-serif font-bold text-3xl sm:text-4xl text-white mt-1">{book.title}</h1>
              <p className="text-sm text-gray-400 font-medium">by <strong className="text-gray-200">{book.author}</strong></p>
            </div>

            {/* Rating & Distance Badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1 text-gold-400 font-extrabold bg-gold-500/10 px-3 py-1 rounded-xl border border-gold-500/30">
                <Star className="w-4 h-4 fill-gold-400" />
                <span>{book.rating || 4.9}</span>
                <span className="text-gray-400 font-normal">({book.reviewCount || 24} reviews)</span>
              </div>

              <div className="flex items-center gap-1.5 text-gray-300 bg-[#1F2430] px-3 py-1 rounded-xl border border-white/10">
                <MapPin className="w-4 h-4 text-gold-400" />
                <span>{book.location?.city || 'Mumbai'} • {book.distanceKm || 2.5} km away</span>
              </div>

              <div className="bg-[#1F2430] px-3 py-1 rounded-xl text-gray-300 border border-white/10">
                Condition: <strong className="text-gold-400">{book.condition || 'Like New'}</strong>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider">Book Overview</h4>
              <p className="text-sm text-gray-300 leading-relaxed font-light">{book.description}</p>
            </div>

            {/* Preferred Exchange Genre */}
            <div className="p-3 bg-[#1F2430]/60 border border-gold-500/20 rounded-xl text-xs flex items-center justify-between">
              <span className="text-gray-400">Owner's Preferred Exchange Genre:</span>
              <span className="font-bold text-gold-300 uppercase">{book.preferredExchangeGenre || 'Any'}</span>
            </div>
          </div>

          {/* Owner Info & Action Buttons */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <Link to={`/profile/${ownerId}`} className="flex items-center gap-3 group">
                <img src={book.owner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'} alt="" className="w-10 h-10 rounded-full object-cover border border-gold-500/40" />
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-gold-400 transition">
                    Posted by {book.owner?.name || 'Local Reader'}
                  </h4>
                  <p className="text-xs text-gray-400">{book.owner?.location?.city || 'Mumbai'}, Verified Member</p>
                </div>
              </Link>

              <button
                onClick={handleWishlist}
                className="flex items-center gap-1.5 text-xs text-gold-400 hover:text-white bg-gold-500/10 hover:bg-gold-500/20 px-3 py-2 rounded-xl border border-gold-500/30 transition"
              >
                <Bookmark className="w-4 h-4" />
                <span>Wishlist</span>
              </button>
            </div>

            {/* Actions: I'm Interested & Request Exchange */}
            {book.status === 'AVAILABLE' && !isMyBook && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleInterest}
                  disabled={interestSent}
                  className={`py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                    interestSent
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-[#1F2430] hover:bg-[#2A303C] text-gold-300 border-gold-500/30'
                  }`}
                >
                  {interestSent ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Interest Sent to {book.owner?.name} ✓</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 text-rose-400 fill-rose-500/20" />
                      <span>I'm Interested in this Book</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setExchangeModalOpen(true)}
                  className="gold-gradient-bg hover:opacity-95 text-black font-extrabold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl shadow-gold-500/20 transition active:scale-95"
                >
                  <Repeat className="w-4 h-4" />
                  <span>Propose Book Swap 🔄</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations Carousel */}
      {recommendations.length > 0 && (
        <RecommendationCarousel
          recommendations={recommendations}
          onRequestExchange={() => setExchangeModalOpen(true)}
        />
      )}

      {/* Exchange Request Modal */}
      <Modal isOpen={exchangeModalOpen} onClose={() => setExchangeModalOpen(false)} title="Request Exchange">
        <form onSubmit={handleSendExchangeRequest} className="space-y-4 text-xs">
          <div className="p-3 bg-[#1F2430] rounded-xl flex items-center gap-3">
            <img src={book.coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80'} alt="" className="w-12 h-16 object-cover rounded-lg" />
            <div>
              <span className="text-[10px] text-gold-400 uppercase font-bold">You want to borrow</span>
              <p className="font-bold text-sm text-white">{book.title}</p>
              <p className="text-xs text-gray-400">from {book.owner?.name}</p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">Select a Book from Your Library to Offer in Return</label>
            <select
              value={offeredBookId}
              onChange={(e) => setOfferedBookId(e.target.value)}
              required
              className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none"
            >
              <option value="">-- Choose Book to Offer --</option>
              {myBooks.map(b => (
                <option key={b._id} value={b._id}>
                  {b.title} ({b.genre})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setExchangeModalOpen(false)}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button type="submit" className="gold-gradient-bg text-black font-extrabold px-5 py-2.5 rounded-xl shadow-md">
              Send Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BookDetailPage;
