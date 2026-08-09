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
  const [photoBook, setPhotoBook] = useState([]);
  const [preferredExchangeGenre, setPreferredExchangeGenre] = useState('Sci-Fi');
  const [loading, setLoading] = useState(false);

  const handlePhotoBookChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBook(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (index) => {
    setPhotoBook(prev => prev.filter((_, i) => i !== index));
  };

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
        photoBook,
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

          <div className="space-y-4 border-t border-white/10 py-6 mt-4 flex flex-col items-center bg-[#15171E] rounded-2xl border p-4 shadow-inner">
            <label className="text-gray-300 font-semibold flex items-center gap-2 w-full">
              <Image className="w-5 h-5 text-gold-400" />
              Book Cover Photo *
            </label>
            <div className="flex flex-col items-center gap-4 w-full">
              <img src={coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80'} alt="Cover Preview" className="w-40 h-56 sm:w-48 sm:h-64 rounded-xl object-cover border-4 border-gold-500 shadow-2xl shrink-0" />
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="w-full text-center text-gray-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-gold-500 file:text-black hover:file:opacity-90 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2 border-t border-b border-white/10 py-4 my-4">
            <label className="text-gray-300 font-semibold flex items-center gap-2">
              <Image className="w-4 h-4 text-gold-400" />
              Photo Book (Exchange Verification)
            </label>
            <p className="text-gray-400 text-[10px]">Upload multiple photos (front, back, spine, pages) to verify the book's condition for exchange.</p>
            
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoBookChange}
              className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gold-500/10 file:text-gold-400 hover:file:bg-gold-500/20 cursor-pointer"
            />

            {photoBook.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-4">
                {photoBook.map((photoUrl, idx) => (
                  <div key={idx} className="relative group">
                    <img src={photoUrl} alt={`Photo ${idx+1}`} className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover border-2 border-white/20 shadow-md" />
                    <button type="button" onClick={() => handleRemovePhoto(idx)} className="absolute -top-3 -right-3 bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs shadow-xl opacity-0 group-hover:opacity-100 transition hover:bg-rose-600 hover:scale-110">✕</button>
                  </div>
                ))}
              </div>
            )}
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
