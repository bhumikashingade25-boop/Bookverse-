import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, BookOpen, Repeat, Recycle, CheckCircle, Activity } from 'lucide-react';
import { getAdminStatsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminPanelPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStatsApi().then(res => {
      if (res.data.success) {
        setData(res.data);
      }
    }).catch(err => console.log('Admin stats fetch error:', err.message))
      .finally(() => setLoading(false));
  }, []);

  if (!user?.isAdmin) {
    return (
      <div className="p-12 text-center text-rose-400 font-bold glass-panel rounded-3xl max-w-md mx-auto my-12">
        🚫 Access Denied: Admin authorization required.
      </div>
    );
  }

  if (loading || !data) {
    return <div className="p-12 text-center text-gray-400">Loading admin dashboard statistics...</div>;
  }

  const { stats, recentUsers, recentBooks, recentExchanges } = data;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2 text-gold-400">
          <ShieldAlert className="w-6 h-6" />
          <h2 className="font-serif font-bold text-2xl text-white">BookVerse Admin & Moderation Panel</h2>
        </div>
        <span className="bg-gold-500/20 text-gold-300 font-extrabold text-xs px-3 py-1 rounded-full border border-gold-500/40">
          System Admin: {user.name}
        </span>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-indigo-400' },
          { label: 'Total Books', value: stats.totalBooks, icon: BookOpen, color: 'text-gold-400' },
          { label: 'Active Listings', value: stats.activeListings, icon: Activity, color: 'text-amber-400' },
          { label: 'Exchanges Requested', value: stats.totalExchanges, icon: Repeat, color: 'text-gold-300' },
          { label: 'Exchanges Completed', value: stats.completedExchanges, icon: CheckCircle, color: 'text-purple-400' },
          { label: 'Books Saved (Reuse)', value: stats.booksReused, icon: Recycle, color: 'text-amber-300' }
        ].map((m, i) => {

          const Icon = m.icon;
          return (
            <div key={i} className="bg-[#15171E] border border-white/10 p-4 rounded-2xl space-y-2 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{m.label}</span>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <p className={`font-serif font-extrabold text-2xl text-white`}>{m.value}</p>
            </div>
          );
        })}
      </div>

      {/* Analytics Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Registered Users */}
        <div className="bg-[#15171E] border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl">
          <h3 className="font-serif font-bold text-lg text-white border-b border-white/10 pb-2">Recent Registered Users</h3>
          <div className="space-y-3">
            {recentUsers.map(u => (
              <div key={u._id} className="flex items-center justify-between p-2.5 bg-[#1F2430]/60 rounded-xl text-xs">
                <div className="flex items-center gap-2.5">
                  <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-gold-500/40" />
                  <div>
                    <p className="font-bold text-white">{u.name}</p>
                    <p className="text-gray-400 text-[10px]">{u.email}</p>
                  </div>
                </div>
                <span className="text-gray-400 text-[10px]">{u.location?.city || 'Mumbai'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Book Listings */}
        <div className="bg-[#15171E] border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl">
          <h3 className="font-serif font-bold text-lg text-white border-b border-white/10 pb-2">Recent Book Listings</h3>
          <div className="space-y-3">
            {recentBooks.map(b => (
              <div key={b._id} className="flex items-center justify-between p-2.5 bg-[#1F2430]/60 rounded-xl text-xs">
                <div className="flex items-center gap-2.5">
                  <img src={b.coverUrl} alt="" className="w-7 h-10 object-cover rounded shadow" />
                  <div>
                    <p className="font-bold text-white">{b.title}</p>
                    <p className="text-gray-400 text-[10px]">by {b.author}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gold-500/20 text-gold-300 border border-gold-500/30">
                  {b.genre}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanelPage;
