import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, Compass, BookMarked, Repeat, Menu, MapPin, 
  Sparkles, Users, Trophy, BarChart2, Bookmark, Settings, Shield, PlusCircle, X, UserCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  if (!user) return null;

  const moreLinks = [
    { label: 'Find People & Connect', path: '/network', icon: UserCheck, desc: 'Search readers & connect like LinkedIn' },
    { label: 'Nearby Map', path: '/map', icon: MapPin, desc: 'Find physical books & couriers near you' },
    { label: 'Reading Clubs', path: '/clubs', icon: Users, desc: 'Join book communities & discussions' },
    { label: 'AI Recommendations', path: '/recommendations', icon: Sparkles, desc: 'Personalized book suggestions' },
    { label: 'Reading Progress', path: '/progress', icon: BarChart2, desc: 'Track reading streaks & goals' },
    { label: 'Achievements', path: '/achievements', icon: Trophy, desc: 'Gamified reading badges' },
    { label: 'Wishlist', path: '/wishlist', icon: Bookmark, desc: 'Saved books to exchange' },
    { label: 'Settings', path: '/settings', icon: Settings, desc: 'Profile & preferences' }
  ];

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0C10]/95 backdrop-blur-lg border-t border-white/10 px-3 py-2 flex items-center justify-around">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition ${
              isActive ? 'text-gold-400 font-bold' : 'text-gray-400 hover:text-gray-200'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/discover"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition ${
              isActive ? 'text-gold-400 font-bold' : 'text-gray-400 hover:text-gray-200'
            }`
          }
        >
          <Compass className="w-5 h-5" />
          <span>Discover</span>
        </NavLink>

        <NavLink
          to="/network"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition ${
              isActive ? 'text-gold-400 font-bold' : 'text-gray-400 hover:text-gray-200'
            }`
          }
        >
          <UserCheck className="w-5 h-5" />
          <span>Network</span>
        </NavLink>

        <NavLink
          to="/library"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition ${
              isActive ? 'text-gold-400 font-bold' : 'text-gray-400 hover:text-gray-200'
            }`
          }
        >
          <BookMarked className="w-5 h-5" />
          <span>Library</span>
        </NavLink>

        <button
          onClick={() => setMoreMenuOpen(true)}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition ${
            moreMenuOpen ? 'text-gold-400 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span>More</span>
        </button>
      </nav>

      {/* Full Mobile "More" Drawer for All Pages */}
      {moreMenuOpen && (
        <div
          onClick={() => setMoreMenuOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end justify-center p-3 lg:hidden animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#15171E] border border-gold-500/30 rounded-3xl p-5 space-y-4 mb-16 shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-white">BookVerse Explorer</h3>
                <p className="text-[11px] text-gray-400">All features & sections at your fingertips</p>
              </div>
              <button
                onClick={() => setMoreMenuOpen(false)}
                className="p-1.5 rounded-lg bg-[#1F2430] text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid of All Mobile Pages */}
            <div className="grid grid-cols-1 gap-2">
              {moreLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      setMoreMenuOpen(false);
                      navigate(item.path);
                    }}
                    className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#1F2430] hover:bg-gold-500 hover:text-black text-left transition group border border-white/5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#15171E] group-hover:bg-black/20 text-gold-400 group-hover:text-black flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-white group-hover:text-black">{item.label}</p>
                      <p className="text-[10px] text-gray-400 group-hover:text-black/80">{item.desc}</p>
                    </div>
                  </button>
                );
              })}

              {user?.isAdmin && (
                <button
                  onClick={() => {
                    setMoreMenuOpen(false);
                    navigate('/admin');
                  }}
                  className="flex items-center gap-3.5 p-3 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-left hover:bg-gold-500 hover:text-black transition group"
                >
                  <div className="w-9 h-9 rounded-xl bg-gold-500/20 text-gold-400 group-hover:text-black flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-gold-300 group-hover:text-black">Admin Moderation Panel</p>
                    <p className="text-[10px] text-gray-400 group-hover:text-black/80">Platform stats & moderation</p>
                  </div>
                </button>
              )}
            </div>

            {/* List New Book Button */}
            <button
              onClick={() => {
                setMoreMenuOpen(false);
                navigate('/upload');
              }}
              className="w-full gold-gradient-bg text-black font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List a Book for Physical Swap</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BottomNav;
