import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2, Repeat } from 'lucide-react';
import BookGrid from '../components/BookGrid';
import Modal from '../components/Modal';
import { getWishlistApi, removeFromWishlistApi, createExchangeApi, getBooksApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const WishlistPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Exchange Modal State
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [selectedBookToRequest, setSelectedBookToRequest] = useState(null);
  const [myBooks, setMyBooks] = useState([]);
  const [offeredBookId, setOfferedBookId] = useState('');

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await getWishlistApi();
      if (res.data.success) {
        setWishlistItems(res.data.wishlist);
      }

      if (user) {
        const userBooksRes = await getBooksApi({ availability: 'AVAILABLE' });
        if (userBooksRes.data.success) {
          setMyBooks(userBooksRes.data.books.filter(b => b.owner?._id === user._id || b.owner === user._id));
        }
      }
    } catch (err) {
      console.log('Error fetching wishlist:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const handleRemove = async (bookId) => {
    try {
      await removeFromWishlistApi(bookId);
      setWishlistItems(prev => prev.filter(w => w.book._id !== bookId));
      showToast('Removed from wishlist');
    } catch (err) {
      showToast('Error removing item', 'error');
    }
  };

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

  const booksList = wishlistItems.map(w => w.book).filter(Boolean);

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-gold-400">
            <Bookmark className="w-5 h-5" />
            <h2 className="font-serif font-bold text-2xl text-white">My Saved Wishlist</h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Track books you want to read. Receive instant alerts when a nearby reader lists them!</p>
        </div>
      </div>

      <BookGrid
        books={booksList}
        loading={loading}
        onWishlist={handleRemove}
        onExchangeRequest={openExchangeModal}
      />

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

export default WishlistPage;
