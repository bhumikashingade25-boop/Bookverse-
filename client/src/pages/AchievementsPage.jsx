import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Sparkles } from 'lucide-react';
import AchievementBadge from '../components/AchievementBadge';
import { getUserProfileApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AchievementsPage = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getUserProfileApi(user._id).then(res => {
        if (res.data.success) {
          setAchievements(res.data.achievements || []);
        }
      }).finally(() => setLoading(false));
    }
  }, [user]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gold-500/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-gold-400">
            <Trophy className="w-6 h-6" />
            <h2 className="font-serif font-bold text-2xl text-white">Gamified Reading Badges</h2>
          </div>
          <p className="text-xs text-gray-400">Earn badges for reading, listing books, maintaining reading streaks, and completing local exchanges.</p>
        </div>

        <div className="flex items-center gap-4 bg-[#1F2430] p-4 rounded-2xl border border-white/10 text-center shrink-0">
          <div>
            <p className="font-serif font-extrabold text-2xl text-gold-400">{unlockedCount} / {achievements.length || 5}</p>
            <p className="text-[10px] text-gray-400 uppercase font-bold">Badges Unlocked</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <p className="font-serif font-extrabold text-2xl text-amber-400 flex items-center justify-center gap-1">
              <Flame className="w-5 h-5 fill-amber-400" />
              <span>{user?.streakDays || 12}d</span>
            </p>
            <p className="text-[10px] text-gray-400 uppercase font-bold">Active Streak</p>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {loading ? (
          <div className="p-8 text-center text-gray-400 col-span-full">Loading achievements...</div>
        ) : (
          achievements.map(a => (
            <AchievementBadge key={a._id} achievement={a} />
          ))
        )}
      </div>
    </div>
  );
};

export default AchievementsPage;
