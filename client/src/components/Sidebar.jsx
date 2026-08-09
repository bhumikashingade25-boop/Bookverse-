import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, Compass, BookMarked, Repeat, MapPin, 
  Users, Trophy, Sparkles, Bookmark, 
  BarChart2, Settings, ShieldAlert, UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Home Feed', icon: Home, path: '/home' },
    { label: 'Discover Books', icon: Compass, path: '/discover' },
    { label: 'Find People & Connect', icon: UserCheck, path: '/network' },
    { label: 'Exchanges', icon: Repeat, path: '/exchanges' },
    { label: 'Nearby Map', icon: MapPin, path: '/map' },
    { label: 'My Library', icon: BookMarked, path: '/library' },
    { label: 'Wishlist', icon: Bookmark, path: '/wishlist' },
    { label: 'Recommendations', icon: Sparkles, path: '/recommendations' },
    { label: 'Reading Clubs', icon: Users, path: '/clubs' },
    { label: 'Achievements', icon: Trophy, path: '/achievements' },
    { label: 'Reading Progress', icon: BarChart2, path: '/progress' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  if (user?.isAdmin) {
    navItems.push({ label: 'Admin Panel', icon: ShieldAlert, path: '/admin' });
  }

  return (
    <aside className="hidden lg:block w-64 shrink-0 bg-[#0B0C10] border-r border-white/10 p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="space-y-1">
        <p className="px-3 text-xs font-bold tracking-wider text-gray-500 uppercase mb-2">Navigation</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-gold-500/20 to-amber-500/10 text-gold-400 border-l-4 border-gold-500 font-semibold'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#15171E]'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Sustainability Stats Widget */}
      <div className="mt-8 p-4 rounded-2xl glass-card border border-emerald-500/20 text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Eco Reading Impact</span>
        </div>
        <p className="text-gray-300 text-[11px] leading-relaxed">
          Sharing physical books avoids paper manufacturing & reduces your carbon footprint.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
