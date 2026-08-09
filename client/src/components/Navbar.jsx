import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Bell, Search, User, LogOut, ChevronDown, PlusCircle, Shield, Sparkles, 
  Sun, Moon, Menu, X, MapPin, BookMarked, Bookmark, Users, Trophy, 
  BarChart2, Compass, Home, Repeat, Settings, UserCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getNotificationsApi } from '../services/api';
import Logo from './Logo';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      getNotificationsApi().then(res => {
        if (res.data.success) {
          setUnreadCount(res.data.unreadCount || 0);
        }
      }).catch(err => console.log('Notifications count error', err));
    }
  }, [user]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navLinks = [
    { label: 'Home Feed', path: '/home', icon: Home },
    { label: 'Discover Books', path: '/discover', icon: Compass },
    { label: 'Find People & Connect', path: '/network', icon: UserCheck },
    { label: 'My Library', path: '/library', icon: BookMarked },
    { label: 'Reading Progress', path: '/progress', icon: BarChart2 },
    { label: 'AI Recommendations', path: '/recommendations', icon: Sparkles },
    { label: 'Nearby Map', path: '/map', icon: MapPin },
    { label: 'Reading Clubs', path: '/clubs', icon: Users },
    { label: 'Achievements', path: '/achievements', icon: Trophy },
    { label: 'Book Exchanges', path: '/exchanges', icon: Repeat },
    { label: 'Wishlist', path: '/wishlist', icon: Bookmark },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0B0C10]/95 backdrop-blur-md border-b border-white/10 px-3 sm:px-4 lg:px-8 py-2.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Mobile Menu Button + Brand Logo */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#15171E] hover:bg-[#1F2430] border border-white/10 text-gold-400 transition"
              aria-label="Open Navigation Menu"
            >
              {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/" className="flex items-center">
              <Logo className="w-9 h-9 sm:w-11 sm:h-11" showText={true} />
            </Link>
          </div>

          {/* Global Search Bar (Desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search books, authors, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#15171E] border border-white/10 focus:border-gold-500/60 rounded-full py-2 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-500 outline-none transition"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </form>

          {/* Action Controls & User Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {user ? (
              <>
                {/* Find People Quick Icon */}
                <Link
                  to="/network"
                  className="hidden sm:flex items-center gap-1.5 p-2 rounded-xl bg-[#15171E] hover:bg-[#1F2430] border border-white/10 text-gray-300 hover:text-gold-400 transition"
                  title="Find People & Connect"
                >
                  <UserCheck className="w-4 h-4" />
                  <span className="text-xs font-semibold">Network</span>
                </Link>

                {/* Add Book Quick CTA */}
                <Link
                  to="/upload"
                  className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-black font-extrabold px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm shadow-md transition transform active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>List Book</span>
                </Link>

                {/* Notifications Icon */}
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-xl bg-[#15171E] hover:bg-[#1F2430] border border-white/10 text-gray-300 hover:text-gold-400 transition"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-rose-500 text-white font-bold text-[9px] sm:text-[10px] flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Avatar Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-xl bg-[#15171E] hover:bg-[#1F2430] border border-white/10 transition"
                  >
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                      alt={user.name}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-gold-500/40"
                    />
                    <span className="hidden sm:inline font-medium text-sm text-gray-200">{user.name?.split(' ')[0] || 'User'}</span>
                    <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#15171E] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in duration-150">
                      <div className="px-3 py-2 border-b border-white/10 mb-1">
                        <p className="font-semibold text-sm text-white">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>

                      <Link
                        to={`/profile/${user._id}`}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#1F2430] hover:text-gold-400 rounded-xl transition"
                      >
                        <User className="w-4 h-4" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/network"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#1F2430] hover:text-gold-400 rounded-xl transition"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Find People & Network</span>
                      </Link>

                      <Link
                        to="/library"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#1F2430] hover:text-gold-400 rounded-xl transition"
                      >
                        <BookMarked className="w-4 h-4" />
                        <span>My Library</span>
                      </Link>

                      {user.isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gold-400 hover:bg-gold-500/10 rounded-xl transition"
                        >
                          <Shield className="w-4 h-4" />
                          <span>Admin Panel</span>
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          navigate('/auth');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-xl transition mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/auth"
                  className="text-xs sm:text-sm font-semibold text-gray-300 hover:text-gold-400 px-2 sm:px-3 py-1.5 rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=register"
                  className="bg-gold-500 hover:bg-gold-400 text-black font-extrabold px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm transition shadow-md"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              title={isDark ? "Switch to Pastel Light Mode" : "Switch to Luxury Dark Mode"}
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#15171E] hover:bg-[#1F2430] border border-gold-500/40 text-gold-400 hover:text-gold-300 transition-all shadow-md active:scale-95 group ml-0.5"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500 group-hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

          </div>
        </div>
      </header>

      {/* =========================================================================
          FULL-PAGE MOBILE NAVIGATION DRAWER
         ========================================================================= */}
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 lg:hidden flex flex-col justify-start animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-4/5 max-w-xs h-full bg-[#0B0C10] border-r border-gold-500/30 p-5 space-y-5 overflow-y-auto shadow-2xl flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <Logo className="w-10 h-10" showText={true} />
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-[#15171E] text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Card on Mobile */}
              {user && (
                <div className="flex items-center gap-3 p-3 bg-[#15171E] border border-gold-500/30 rounded-2xl">
                  <img src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'} alt={user.name} className="w-10 h-10 rounded-xl object-cover border border-gold-500/40" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-gold-400 font-medium">🔥 {user.streakDays || 1}d Reading Streak</p>
                  </div>
                </div>
              )}

              {/* Mobile Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#15171E] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 outline-none"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              </form>

              {/* All Navigation Links */}
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider px-2 pt-2">All Sections & Pages</p>
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'gold-gradient-bg text-black shadow-md'
                          : 'text-gray-300 hover:bg-[#15171E] hover:text-gold-400'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {user?.isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-gold-400 bg-gold-500/10 border border-gold-500/30"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Moderation Panel</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <Link
                to="/upload"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full gold-gradient-bg text-black font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                <PlusCircle className="w-4 h-4" />
                <span>List a Book for Swap</span>
              </Link>

              {user ? (
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    logout();
                    navigate('/auth');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="w-full bg-[#15171E] border border-white/10 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
