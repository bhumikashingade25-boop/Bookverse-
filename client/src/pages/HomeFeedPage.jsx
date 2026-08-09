import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Flame, BookOpen, Trophy, Repeat, Filter } from 'lucide-react';
import PostCard from '../components/PostCard';
import RecommendationCarousel from '../components/RecommendationCarousel';
import Modal from '../components/Modal';
import { getPostsApi, createPostApi, getRecommendationsApi, getBooksApi, addToWishlistApi, createExchangeApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const HomeFeedPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Post Modal State
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postType, setPostType] = useState('Finished Reading');
  const [content, setContent] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [rating, setRating] = useState(5);

  // Exchange Request Modal State
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [selectedBookToRequest, setSelectedBookToRequest] = useState(null);
  const [myBooks, setMyBooks] = useState([]);
  const [offeredBookId, setOfferedBookId] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [postsRes, recRes, booksRes] = await Promise.all([
        getPostsApi(),
        getRecommendationsApi().catch(() => ({ data: { success: false } })),
        getBooksApi({ availability: 'AVAILABLE' })
      ]);

      if (postsRes.data.success) setPosts(postsRes.data.posts);
      if (recRes.data?.success) setRecommendations(recRes.data.recommendations);
      if (booksRes.data.success && user) {
        setMyBooks(booksRes.data.books.filter(b => b.owner?._id === user._id || b.owner === user._id));
      }
    } catch (err) {
      console.log('Home feed fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const res = await createPostApi({
        type: postType,
        content,
        bookTitle,
        bookAuthor,
        rating
      });

      if (res.data.success) {
        setPosts(prev => [res.data.post, ...prev]);
        setIsPostModalOpen(false);
        setContent('');
        setBookTitle('');
        setBookAuthor('');
        showToast('Reading update posted!');
      }
    } catch (err) {
      showToast('Error creating post', 'error');
    }
  };

  const handleWishlist = async (bookId) => {
    try {
      await addToWishlistApi(bookId);
      showToast('Added to your Wishlist! ❤️');
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
      showToast('Please select a book from your library to offer', 'error');
      return;
    }

    try {
      const res = await createExchangeApi({
        requestedBookId: selectedBookToRequest._id,
        offeredBookId: offeredBookId
      });

      if (res.data.success) {
        showToast('Exchange request sent successfully! 🔄');
        setExchangeModalOpen(false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error sending exchange request', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Banner */}
      <div className="glass-panel border border-gold-500/30 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <h2 className="font-serif font-bold text-2xl text-white">Welcome, {user?.name.split(' ')[0]}! 👋</h2>
            <span className="flex items-center text-xs font-bold text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/40">
              <Flame className="w-3.5 h-3.5 mr-1 fill-amber-400" />
              {user?.streakDays || 12} Day Reading Streak
            </span>
          </div>
          <p className="text-xs text-gray-400">
            You've completed {user?.readingGoal?.completedThisYear || 8} of your {user?.readingGoal?.yearlyTarget || 24} target books this year.
          </p>
        </div>

        <button
          onClick={() => setIsPostModalOpen(true)}
          className="gold-gradient-bg text-black font-extrabold px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg hover:opacity-95 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post Reading Update</span>
        </button>
      </div>

      {/* Recommendations Carousel */}
      {recommendations.length > 0 && (
        <RecommendationCarousel
          recommendations={recommendations}
          onRequestExchange={openExchangeModal}
        />
      )}

      {/* Main Feed Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="font-serif font-bold text-xl text-white">Community Feed</h3>
        <span className="text-xs text-gray-400">{posts.length} Posts</span>
      </div>

      {/* Posts Stream */}
      <div className="space-y-4 max-w-3xl">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-[#15171E] rounded-2xl p-6 space-y-3 animate-pulse border border-white/5">
                <div className="h-4 bg-[#1F2430] rounded w-1/4" />
                <div className="h-12 bg-[#1F2430] rounded w-full" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center glass-panel rounded-3xl text-gray-400 text-sm">
            No feed posts yet. Be the first to share what you are reading!
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post._id} post={post} onWishlist={handleWishlist} />
          ))
        )}
      </div>

      {/* Create Post Modal */}
      <Modal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} title="Share Reading Update">
        <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">Post Type</label>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
              className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none"
            >
              <option value="Finished Reading">Finished Reading 📚</option>
              <option value="Currently Reading">Currently Reading 📖</option>
              <option value="Available for Exchange">Available for Exchange 🔄</option>
              <option value="Book Recommendation">Book Recommendation ⭐</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">Book Title (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Dune"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">Book Author (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Frank Herbert"
              value={bookAuthor}
              onChange={(e) => setBookAuthor(e.target.value)}
              className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">Your Review / Thoughts</label>
            <textarea
              rows="4"
              required
              placeholder="What did you think of the plot, characters, or key takeaways?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsPostModalOpen(false)}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button type="submit" className="bg-gold-500 text-black font-bold px-5 py-2.5 rounded-xl">
              Post Update
            </button>
          </div>
        </form>
      </Modal>

      {/* Exchange Request Modal */}
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

export default HomeFeedPage;
