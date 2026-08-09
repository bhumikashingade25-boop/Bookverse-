import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookMarked, Plus, BookOpen, BarChart2, CheckCircle2, Flame, ArrowRight, Share2, PlusCircle } from 'lucide-react';
import BookGrid from '../components/BookGrid';
import ReadingProgressCard from '../components/ReadingProgressCard';
import { getBooksApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const MyLibraryPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [exchangeBooks, setExchangeBooks] = useState([]);
  const [readingShelf, setReadingShelf] = useState([]); // Clean empty shelf
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchMyLibrary = async () => {
    try {
      setLoading(true);
      const res = await getBooksApi({});
      if (res.data.success && user) {
        const userBooks = res.data.books.filter(b => b.owner?._id === user._id || b.owner === user._id);
        setExchangeBooks(userBooks);
      }
    } catch (err) {
      console.log('Error loading library:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLibrary();
  }, [user]);

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-[#15171E] border border-gold-500/30 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gold-400 text-xs font-bold uppercase tracking-wider">
            <BookMarked className="w-4 h-4" />
            <span>Personal Reading Haven</span>
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white">My Library & Bookshelf</h2>
          <p className="text-xs text-gray-300 max-w-xl">
            Manage your listed physical exchange books, track your reading progress, and share your personal bookshelf with the community.
          </p>
        </div>

        <Link
          to="/upload"
          className="gold-gradient-bg hover:opacity-95 text-black font-extrabold px-5 py-3 rounded-2xl text-xs shadow-lg flex items-center gap-2 transition transform active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ List Book for Exchange</span>
        </Link>
      </div>

      {/* Segment Tab Controls */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'ALL'
              ? 'gold-gradient-bg text-black shadow-md'
              : 'bg-[#15171E] text-gray-400 hover:text-white border border-white/5'
          }`}
        >
          All Items ({exchangeBooks.length + readingShelf.length})
        </button>

        <button
          onClick={() => setActiveTab('EXCHANGES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'EXCHANGES'
              ? 'gold-gradient-bg text-black shadow-md'
              : 'bg-[#15171E] text-gray-400 hover:text-white border border-white/5'
          }`}
        >
          Listed for Exchange ({exchangeBooks.length})
        </button>

        <button
          onClick={() => setActiveTab('READING_TRACKER')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'READING_TRACKER'
              ? 'gold-gradient-bg text-black shadow-md'
              : 'bg-[#15171E] text-gray-400 hover:text-white border border-white/5'
          }`}
        >
          Active Reading Shelf ({readingShelf.length})
        </button>
      </div>

      {/* SECTION 1: Physical Exchange Books */}
      {(activeTab === 'ALL' || activeTab === 'EXCHANGES') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-gold-400" />
              <span>Books Listed for Physical Exchange ({exchangeBooks.length})</span>
            </h3>
          </div>

          {exchangeBooks.length > 0 ? (
            <BookGrid books={exchangeBooks} loading={loading} />
          ) : (
            <div className="p-8 bg-[#15171E] border border-white/10 rounded-3xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gold-500/10 text-gold-400 mx-auto flex items-center justify-center font-bold text-xl">
                📚
              </div>
              <h4 className="font-bold text-sm text-white">No Books Listed for Exchange Yet</h4>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Got physical books sitting on your shelf? List them for exchange to swap with nearby readers in your city!
              </p>
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 gold-gradient-bg text-black font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md mt-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>List Your First Book</span>
              </Link>
            </div>
          )}
        </section>
      )}

      {/* SECTION 2: Reading Progress Shelf */}
      {(activeTab === 'ALL' || activeTab === 'READING_TRACKER') && (
        <section className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-amber-400" />
              <span>Active Reading Progress Shelf ({readingShelf.length})</span>
            </h3>

            <Link
              to="/progress"
              className="text-xs text-gold-400 hover:underline flex items-center gap-1 font-bold"
            >
              <span>Manage Goals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {readingShelf.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {readingShelf.map((item) => (
                <div key={item._id} className="p-4 bg-[#15171E] border border-gold-500/20 rounded-2xl space-y-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <img src={item.coverUrl} alt={item.title} className="w-12 h-16 object-cover rounded-lg shadow" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-gold-400 font-bold uppercase">{item.genre}</span>
                      <h4 className="font-bold text-xs text-white truncate">{item.title}</h4>
                      <p className="text-[11px] text-gray-400 truncate">{item.author}</p>
                      <p className="text-[10px] text-emerald-400 font-semibold mt-1">
                        {item.pagesRead} / {item.totalPages} pages ({Math.round((item.pagesRead / item.totalPages) * 100)}%)
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-[#15171E] border border-white/10 rounded-3xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center font-bold text-xl">
                📖
              </div>
              <h4 className="font-bold text-sm text-white">Your Reading Shelf is Clean</h4>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Log books you are currently reading to track daily page streaks, completion goals, and reading badges.
              </p>
              <Link
                to="/progress"
                className="inline-flex items-center gap-2 bg-[#1F2430] hover:bg-gold-500 hover:text-black border border-gold-500/40 text-gold-300 font-bold px-5 py-2.5 rounded-xl text-xs transition mt-2"
              >
                <BarChart2 className="w-4 h-4" />
                <span>Go to Reading Progress Tracker</span>
              </Link>
            </div>
          )}
        </section>
      )}

    </div>
  );
};

export default MyLibraryPage;
