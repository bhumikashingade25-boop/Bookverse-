import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Compass, SlidersHorizontal, Plus } from 'lucide-react';
import BookGrid from '../components/BookGrid';
import Modal from '../components/Modal';
import { getBooksApi, addToWishlistApi, createExchangeApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const DiscoverPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [genre, setGenre] = useState('All');
  const [condition, setCondition] = useState('All');
  const [sort, setSort] = useState('Recently Added');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Exchange Request Modal State
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [selectedBookToRequest, setSelectedBookToRequest] = useState(null);
  const [myBooks, setMyBooks] = useState([]);
  const [offeredBookId, setOfferedBookId] = useState('');

  const genres = ['All', 'Sci-Fi', 'Fiction', 'Self-Improvement', 'Thriller', 'Fantasy', 'History', 'Classics'];

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await getBooksApi({
        query: query.trim(),
        genre,
        condition,
        sort
      });

      if (res.data.success) {
        setBooks(res.data.books);
      }

      if (user) {
        const userBooksRes = await getBooksApi({ availability: 'AVAILABLE' });
        if (userBooksRes.data.success) {
          setMyBooks(userBooksRes.data.books.filter(b => b.owner?._id === user._id || b.owner === user._id));
        }
      }
    } catch (err) {
      console.log('Discover books fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [genre, condition, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: query });
    fetchBooks();
  };

  const handleWishlist = async (bookId) => {
    try {
      await addToWishlistApi(bookId);
      showToast('Added to Wishlist!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not add to wishlist', 'info');
    }
  };

  const openExchangeModal = (book) => {
    setSelectedBookToRequest(book);
    setExchangeModalOpen(true);
  };

  const handleSendExchangeRequest = async (e) => {
    e.preventDefault();
    if (!offeredBookId) {
      showToast('Please select a book to offer', 'error');
      return;
    }

    try {
      const res = await createExchangeApi({
        requestedBookId: selectedBookToRequest._id,
        offeredBookId: offeredBookId
      });

      if (res.data.success) {
        showToast('Exchange request sent! 🔄');
        setExchangeModalOpen(false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating request', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-gold-400">
            <Compass className="w-5 h-5" />
            <h2 className="font-serif font-bold text-2xl text-white">Discover Books for Exchange</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">Search thousands of second-hand books owned by nearby readers in your city.</p>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 bg-[#15171E] border border-white/10 px-3 py-2 rounded-xl text-xs">
          <SlidersHorizontal className="w-4 h-4 text-gold-400" />
          <span className="text-gray-400">Sort By:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-transparent text-white font-bold outline-none cursor-pointer"
          >
            <option value="Recently Added" className="bg-[#15171E]">Recently Added</option>
            <option value="Most Popular" className="bg-[#15171E]">Most Popular</option>
            <option value="Highest Rated" className="bg-[#15171E]">Highest Rated</option>
            <option value="Nearest" className="bg-[#15171E]">Nearest Distance</option>
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          placeholder="Search title, author, ISBN or genre keyword..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-[#15171E] border border-white/10 focus:border-gold-500 rounded-2xl py-3.5 pl-11 pr-24 text-sm text-white placeholder-gray-500 outline-none shadow-xl transition"
        />
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
        <button
          type="submit"
          className="absolute right-2 top-2 bottom-2 gold-gradient-bg text-black font-extrabold px-5 rounded-xl text-xs hover:opacity-95 transition"
        >
          Search
        </button>
      </form>

      {/* Genre Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {genres.map(g => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
              genre === g
                ? 'gold-gradient-bg text-black border-gold-500 shadow-md'
                : 'bg-[#15171E] text-gray-400 border-white/10 hover:border-white/30'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Book Grid */}
      <BookGrid
        books={books}
        loading={loading}
        onWishlist={handleWishlist}
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
                Send Exchange Request
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default DiscoverPage;
