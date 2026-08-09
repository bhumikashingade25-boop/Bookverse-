import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookPlus, Image, Sparkles } from 'lucide-react';
import { createBookApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const UploadBookPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [genre, setGenre] = useState('Fiction');
  const [condition, setCondition] = useState('Good');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80');
  const [preferredExchangeGenre, setPreferredExchangeGenre] = useState('Sci-Fi');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !author || !description) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await createBookApi({
        title,
        author,
        isbn,
        genre,
        condition,
        description,
        coverUrl,
        preferredExchangeGenre
      });

      if (res.data.success) {
        showToast('Book successfully listed for exchange! 📚🎉');
        navigate('/library');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error listing book', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-10 h-10 rounded-xl gold-gradient-bg text-black flex items-center justify-center font-bold">
            <BookPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-2xl text-white">List a Book for Exchange</h2>
            <p className="text-xs text-gray-400">Share your physical copy with fellow readers nearby</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-gray-300 font-semibold">Book Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dune"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gold-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-300 font-semibold">Author Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Frank Herbert"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-gray-300 font-semibold">Genre *</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none"
              >
                <option value="Fiction">Fiction</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Self-Improvement">Self-Improvement</option>
                <option value="Thriller">Thriller</option>
                <option value="Mystery">Mystery</option>
                <option value="Fantasy">Fantasy</option>
                <option value="History">History</option>
                <option value="Classics">Classics</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-gray-300 font-semibold">Condition *</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none"
              >
                <option value="New">New (Like New)</option>
                <option value="Good">Good (Minor wear)</option>
                <option value="Fair">Fair (Readable)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-gray-300 font-semibold">ISBN (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 9780441172719"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">Cover Image URL *</label>
            <input
              type="text"
              required
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">Book Description / Synopsis *</label>
            <textarea
              rows="4"
              required
              placeholder="Provide a brief overview of the plot, condition notes, or why you loved reading it..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">Preferred Exchange Genre</label>
            <input
              type="text"
              placeholder="e.g. Open for Sci-Fi or Philosophy"
              value={preferredExchangeGenre}
              onChange={(e) => setPreferredExchangeGenre(e.target.value)}
              className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gold-gradient-bg text-black font-extrabold py-3.5 rounded-2xl text-sm hover:opacity-95 transition shadow-xl mt-4"
          >
            {loading ? 'Listing Book...' : 'Submit & List Book for Exchange'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadBookPage;
