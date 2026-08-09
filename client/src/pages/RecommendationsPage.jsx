import React, { useState, useEffect } from 'react';
import { Sparkles, Star, Repeat, ArrowRight, BookOpen } from 'lucide-react';
import Modal from '../components/Modal';
import { getRecommendationsApi, getBooksApi, createExchangeApi, addToWishlistApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const RecommendationsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Exchange Modal State
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [selectedBookToRequest, setSelectedBookToRequest] = useState(null);
  const [myBooks, setMyBooks] = useState([]);
  const [offeredBookId, setOfferedBookId] = useState('');

  const fetchRecs = async () => {
    try {
      setLoading(true);
      const res = await getRecommendationsApi();
      if (res.data.success) {
        setRecommendations(res.data.recommendations);
      }

      if (user) {
        const booksRes = await getBooksApi({ availability: 'AVAILABLE' });
        if (booksRes.data.success) {
          setMyBooks(booksRes.data.books.filter(b => b.owner?._id === user._id || b.owner === user._id));
        }
      }
    } catch (err) {
      console.log('Fetch recommendations error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, [user]);

  const openExchangeModal = (book) => {
    setSelectedBookToRequest(book);
    setExchangeModalOpen(true);
  };

  const handleSendExchangeRequest = async (e) => {
    e.preventDefault();
    if (!offeredBookId) {
      showToast('Select a book to offer', 'error');
      return;
    }

    try {
      const res = await createExchangeApi({
        requestedBookId: selectedBookToRequest._id,
        offeredBookId
      });

      if (res.data.success) {
        showToast('Exchange request sent! 🔄');
        setExchangeModalOpen(false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error sending request', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-gold-400">
            <Sparkles className="w-5 h-5" />
            <h2 className="font-serif font-bold text-2xl text-white">AI Book Recommendations</h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Custom algorithm analyzing your reading history, wishlist, top ratings & local reader proximity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="p-8 text-center text-gray-400 col-span-full">Generating personalized recommendations...</div>
        ) : (
          recommendations.map(({ book, matchScore, reason }) => (
            <div
              key={book._id}
              className="bg-[#15171E] border border-gold-500/30 hover:border-gold-500/80 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xl transition"
            >
              <div className="flex gap-4">
                <img src={book.coverUrl} alt={book.title} className="w-20 h-28 object-cover rounded-xl shadow-md shrink-0" />
                
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gold-400 uppercase tracking-wider">{book.genre}</span>
                    <span className="bg-gold-500/20 text-gold-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-gold-500/40">
                      {matchScore}% Match
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-white truncate">{book.title}</h3>
                  <p className="text-xs text-gray-400">by {book.author}</p>
                  
                  <div className="flex items-center gap-1 text-gold-400 text-xs font-bold pt-1">
                    <Star className="w-3.5 h-3.5 fill-gold-400" />
                    <span>{book.rating || 4.8}</span>
                    <span className="text-gray-400 font-normal">({book.distanceKm || 2.1} km away)</span>
                  </div>
                </div>
              </div>

              {/* Recommendation Reason */}
              <div className="p-3 bg-[#1F2430]/60 rounded-xl border border-gold-500/20 text-xs text-gold-300 font-medium italic">
                💡 {reason}
              </div>


              <button
                onClick={() => openExchangeModal(book)}
                className="w-full flex items-center justify-center gap-1.5 gold-gradient-bg text-black font-bold text-xs py-2.5 rounded-xl hover:opacity-95 transition"
              >
                <Repeat className="w-4 h-4" />
                <span>Request Exchange</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Exchange Modal */}
      <Modal isOpen={exchangeModalOpen} onClose={() => setExchangeModalOpen(false)} title="Request Book Exchange">
        {selectedBookToRequest && (
          <form onSubmit={handleSendExchangeRequest} className="space-y-4 text-xs">
            <div className="p-3 bg-[#1F2430] rounded-xl flex items-center gap-3">
              <img src={selectedBookToRequest.coverUrl} alt="" className="w-12 h-16 object-cover rounded-lg" />
              <div>
                <span className="text-[10px] text-gold-400 uppercase font-bold">You want</span>
                <p className="font-bold text-sm text-white">{selectedBookToRequest.title}</p>
                <p className="text-xs text-gray-400">Owner: {selectedBookToRequest.owner?.name}</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-300 font-semibold">Select a Book from Your Library to Offer</label>
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
              <button type="submit" className="bg-gold-500 text-black font-bold px-5 py-2 rounded-xl">
                Send Request
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default RecommendationsPage;
