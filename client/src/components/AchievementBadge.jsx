import React from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';

const AchievementBadge = ({ achievement }) => {
  const isUnlocked = achievement.unlocked;

  return (
    <div className={`relative p-4 rounded-2xl border transition-all flex items-center gap-4 ${
      isUnlocked
        ? 'bg-[#15171E] border-gold-500/40 shadow-lg shadow-gold-500/10'
        : 'bg-[#15171E]/50 border-white/5 opacity-60'
    }`}>
      {/* Icon Badge */}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner ${
        isUnlocked ? 'gold-gradient-bg text-black' : 'bg-[#1F2430] text-gray-500'
      }`}>
        {achievement.icon || '🏆'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-white truncate">{achievement.title}</h4>
          {isUnlocked ? (
            <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
          ) : (
            <Lock className="w-4 h-4 text-gray-500 shrink-0" />
          )}

        </div>
        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{achievement.description}</p>
        
        {/* Progress Bar */}
        {!isUnlocked && (
          <div className="w-full bg-[#1F2430] rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-gold-500 h-full transition-all"
              style={{ width: `${(achievement.progress / (achievement.maxProgress || 1)) * 100}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementBadge;
