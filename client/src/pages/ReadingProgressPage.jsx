import React, { useState } from 'react';
import { BarChart2, BookOpen, Target, Flame, PlusCircle, CheckCircle2 } from 'lucide-react';
import ReadingProgressCard from '../components/ReadingProgressCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

const ReadingProgressPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [readingList, setReadingList] = useState([]); // Clean empty reading tracker
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newTotalPages, setNewTotalPages] = useState('');
  const [newPagesRead, setNewPagesRead] = useState('');
  const [newCover, setNewCover] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80');

  const totalPagesRead = readingList.reduce((acc, curr) => acc + (Number(curr.pagesRead) || 0), 0);
  const completedBooks = readingList.filter(r => Number(r.pagesRead) >= Number(r.totalPages)).length;

  const handleAddReadingBook = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTotalPages) {
      showToast('Please enter book title and total pages', 'error');
      return;
    }

    const newItem = {
      _id: 'prog-' + Date.now(),
      title: newTitle,
      author: newAuthor || 'Unknown Author',
      coverUrl: newCover,
      pagesRead: Number(newPagesRead) || 0,
      totalPages: Number(newTotalPages),
      status: Number(newPagesRead) >= Number(newTotalPages) ? 'COMPLETED' : 'CURRENTLY_READING'
    };

    setReadingList([newItem, ...readingList]);
    showToast(`📖 "${newTitle}" added to your active reading tracker!`);
    setAddModalOpen(false);
    setNewTitle('');
    setNewAuthor('');
    setNewTotalPages('');
    setNewPagesRead('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-gold-400">
            <BarChart2 className="w-5 h-5" />
            <h2 className="font-serif font-bold text-2xl text-white">Reading Tracker & Progress</h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Log pages read daily, track annual reading goals, and build your reading streak.</p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="gold-gradient-bg hover:opacity-95 text-black font-extrabold px-5 py-2.5 rounded-2xl text-xs shadow-lg flex items-center gap-2 transition transform active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Log New Book</span>
        </button>
      </div>

      {/* Goal Overview Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-gold-500/30 shadow-2xl grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        <div className="space-y-1">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Books Completed</p>
          <p className="font-serif font-extrabold text-3xl text-gold-400">{completedBooks}</p>
          <p className="text-[11px] text-emerald-400 font-medium">{readingList.length} Active in Tracker</p>
        </div>

        <div className="space-y-1 border-x border-white/10 px-4">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Pages Read</p>
          <p className="font-serif font-extrabold text-3xl text-white">{totalPagesRead}</p>
          <p className="text-[11px] text-amber-400 font-medium">Daily habit active</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Reading Streak</p>
          <div className="flex items-center justify-center gap-1 text-rose-400 font-serif font-extrabold text-3xl">
            <Flame className="w-7 h-7 fill-rose-500" />
            <span>{user?.streakDays || 1}d</span>
          </div>
          <p className="text-[11px] text-gray-400 font-medium">Consistency builds habits</p>
        </div>
      </div>

      {/* Active Reading Books List */}
      <div className="space-y-4">
        <h3 className="font-serif font-bold text-lg text-white">Your Reading Bookshelf ({readingList.length})</h3>
        
        {readingList.length > 0 ? (
          <div className="space-y-3">
            {readingList.map((item) => (
              <ReadingProgressCard key={item._id} progress={item} />
            ))}
          </div>
        ) : (
          <div className="p-8 bg-[#15171E] border border-white/10 rounded-3xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gold-500/10 text-gold-400 mx-auto flex items-center justify-center font-bold text-xl">
              📊
            </div>
            <h4 className="font-bold text-sm text-white">No Active Reading Goals Logged Yet</h4>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Start tracking a new book to log page milestones, view completion percentages, and earn reading badges!
            </p>
            <button
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-2 gold-gradient-bg text-black font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md mt-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Log Your First Book</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Reading Goal Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Log a Book for Reading Progress">
        <form onSubmit={handleAddReadingBook} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">Book Title</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Sapiens, Atomic Habits"
              className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">Author</label>
            <input
              type="text"
              value={newAuthor}
              onChange={(e) => setNewAuthor(e.target.value)}
              placeholder="e.g. James Clear"
              className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-gray-300 font-semibold">Total Pages</label>
              <input
                type="number"
                required
                value={newTotalPages}
                onChange={(e) => setNewTotalPages(e.target.value)}
                placeholder="e.g. 320"
                className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-300 font-semibold">Pages Already Read</label>
              <input
                type="number"
                value={newPagesRead}
                onChange={(e) => setNewPagesRead(e.target.value)}
                placeholder="e.g. 45"
                className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button type="submit" className="gold-gradient-bg text-black font-extrabold px-5 py-2.5 rounded-xl shadow-md">
              Add to Tracker
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default ReadingProgressPage;
