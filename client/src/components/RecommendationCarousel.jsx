import React from 'react';
import { Sparkles, Star, Repeat, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecommendationCarousel = ({ recommendations = [], onRequestExchange }) => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gold-gradient-bg text-black flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-white">Recommended For You</h3>
            <p className="text-xs text-gray-400">AI-curated based on your favorite genres & wishlist</p>
          </div>
        </div>

        <Link to="/recommendations" className="text-xs font-bold text-gold-400 hover:underline flex items-center gap-1">
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin">
        {recommendations.map(({ book, matchScore, reason }) => (
          <div
            key={book._id}
            className="snap-start shrink-0 w-64 bg-[#15171E] border border-gold-500/30 hover:border-gold-500/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-xl transition"
          >
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-black/40">
              <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-gold-500/40 text-gold-300 font-extrabold text-[11px]">
                {matchScore}% Match
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gold-400 uppercase tracking-wider">{book.genre}</span>
              <h4 className="font-bold text-sm text-white truncate">{book.title}</h4>
              <p className="text-xs text-gray-400">by {book.author}</p>
              <p className="text-[11px] text-gold-300 font-medium mt-1 italic line-clamp-1">💡 {reason}</p>
            </div>


            <button
              onClick={() => onRequestExchange(book)}
              className="w-full flex items-center justify-center gap-1.5 bg-gold-500 hover:bg-gold-400 text-black text-xs font-bold py-2 rounded-xl transition"
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Request Exchange</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationCarousel;
