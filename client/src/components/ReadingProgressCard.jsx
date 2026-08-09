import React, { useState } from 'react';
import { BookOpen, Plus, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ReadingProgressCard = ({ item, onUpdate }) => {
  const { showToast } = useToast();
  const [pagesRead, setPagesRead] = useState(item.pagesRead || 0);

  const percentage = Math.min(100, Math.round((pagesRead / (item.totalPages || 300)) * 100));

  const handleIncrement = (amount) => {
    const newPages = Math.min(item.totalPages || 300, pagesRead + amount);
    setPagesRead(newPages);
    showToast(`Progress updated: ${newPages} / ${item.totalPages} pages!`);
  };

  return (
    <div className="bg-[#15171E] border border-white/10 rounded-2xl p-4 flex gap-4 items-center shadow-xl">
      <img
        src={item.coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=300&q=80'}
        alt={item.title}
        className="w-16 h-24 object-cover rounded-xl shadow-md shrink-0"
      />

      <div className="flex-1 min-w-0 space-y-2">
        <div>
          <h4 className="font-bold text-sm text-white truncate">{item.title}</h4>
          <p className="text-xs text-gray-400">by {item.author}</p>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-bold text-gray-300">
            <span>Progress ({percentage}%)</span>
            <span className="text-gold-400">{pagesRead} / {item.totalPages} pgs</span>
          </div>
          <div className="w-full bg-[#1F2430] h-2 rounded-full overflow-hidden">
            <div className="gold-gradient-bg h-full transition-all duration-300" style={{ width: `${percentage}%` }} />
          </div>
        </div>

        {/* Quick Log Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => handleIncrement(10)}
            className="flex items-center gap-1 bg-[#1F2430] hover:bg-gold-500 hover:text-black text-gray-300 text-xs font-semibold px-2.5 py-1 rounded-lg transition"
          >
            <Plus className="w-3 h-3" />
            <span>+10 pgs</span>
          </button>

          <button
            onClick={() => handleIncrement(25)}
            className="flex items-center gap-1 bg-[#1F2430] hover:bg-gold-500 hover:text-black text-gray-300 text-xs font-semibold px-2.5 py-1 rounded-lg transition"
          >
            <Plus className="w-3 h-3" />
            <span>+25 pgs</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadingProgressCard;
