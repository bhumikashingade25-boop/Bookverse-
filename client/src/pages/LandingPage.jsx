import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Repeat, Users, ShieldCheck, ArrowRight, Sparkles, Star, MapPin, Heart, Recycle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getBooksApi, getAdminStatsApi } from '../services/api';
import Logo from '../components/Logo';


const LandingPage = () => {
  const [featuredBooks, setFeaturedBooks] = useState([
    { title: 'The Alchemist', author: 'Paulo Coelho', cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80', genre: 'Fiction' },
    { title: 'Dune', author: 'Frank Herbert', cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', genre: 'Sci-Fi' },
    { title: 'Atomic Habits', author: 'James Clear', cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80', genre: 'Self-Help' },
    { title: 'Project Hail Mary', author: 'Andy Weir', cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80', genre: 'Sci-Fi' }
  ]);
  const [stats, setStats] = useState({
    totalExchanges: '12,400+',
    totalUsers: '8,500+',
    citiesCount: '45+'
  });

  useEffect(() => {
    // Dynamically fetch books from backend
    getBooksApi({ limit: 4 }).then(res => {
      if (res.data.success && res.data.books.length > 0) {
        setFeaturedBooks(res.data.books.slice(0, 4).map(b => ({
          title: b.title,
          author: b.author,
          cover: b.coverUrl,
          genre: b.genre
        })));
      }
    }).catch(err => console.log('Landing books fetch error:', err));

    // Dynamically fetch stats from admin API
    getAdminStatsApi().then(res => {
      if (res.data.success && res.data.stats) {
        setStats({
          totalExchanges: `${res.data.stats.totalExchanges || 12}k+`,
          totalUsers: `${res.data.stats.totalUsers || 8}k+`,
          citiesCount: '45+'
        });
      }
    }).catch(err => console.log('Landing stats fetch error:', err));
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#EAEAEA] overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Background glow circle */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="flex-1 space-y-6 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 bg-[#1F2430] border border-gold-500/40 px-4 py-1.5 rounded-full text-xs font-bold text-gold-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The #1 Social Book Exchange Platform</span>
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Give Every Book a <br />
            <span className="gold-gradient-text">Second Life.</span>
          </h1>

          <p className="text-gray-300 text-lg sm:text-xl max-w-2xl font-light leading-relaxed">
            Discover nearby readers, swap physical books effortlessly, track reading goals, and become part of a community where every story keeps moving.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <Link
              to="/discover"
              className="w-full sm:w-auto gold-gradient-bg hover:opacity-95 text-black font-extrabold px-8 py-4 rounded-2xl text-base shadow-xl shadow-gold-500/20 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <span>Explore Books</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/auth?mode=register"
              className="w-full sm:w-auto bg-[#1F2430] hover:bg-[#2A303C] border border-white/10 text-white font-bold px-8 py-4 rounded-2xl text-base transition flex items-center justify-center"
            >
              Join BookVerse
            </Link>
          </div>

          {/* Social Proof metrics */}
          <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-4 text-center lg:text-left">
            <div>
              <p className="font-serif text-2xl font-extrabold text-gold-400">{stats.totalExchanges}</p>
              <p className="text-xs text-gray-400">Books Exchanged</p>
            </div>
            <div>
              <p className="font-serif text-2xl font-extrabold text-gold-400">{stats.totalUsers}</p>
              <p className="text-xs text-gray-400">Active Readers</p>
            </div>
            <div>
              <p className="font-serif text-2xl font-extrabold text-gold-400">{stats.citiesCount}</p>
              <p className="text-xs text-gray-400">Cities Connected</p>
            </div>
          </div>
        </div>


        {/* Responsive Book Cards Visual (Clean Grid/Carousel on Mobile, 3D Fan on Desktop) */}
        <div className="flex-1 w-full flex flex-col items-center justify-center z-10 mt-6 lg:mt-0">
          
          {/* Mobile & Tablet View: Horizontal Scrollable Cards */}
          <div className="lg:hidden w-full flex gap-3 overflow-x-auto pb-4 pt-2 snap-x scrollbar-none px-2">
            {featuredBooks.map((book, idx) => (
              <motion.div
                key={idx}
                whileTap={{ scale: 0.96 }}
                className="snap-center shrink-0 w-44 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-gold-500/40 relative bg-black/60"
              >
                <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-3 flex flex-col justify-end">
                  <span className="text-[9px] font-bold text-gold-400 uppercase tracking-wider">{book.genre}</span>
                  <p className="font-serif font-bold text-sm text-white truncate">{book.title}</p>
                  <p className="text-[10px] text-gray-300 truncate">{book.author}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop View: Floating 3D Fan */}
          <div className="hidden lg:flex relative w-full h-[400px] items-center justify-center">
            {featuredBooks.map((book, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15, duration: 0.6 }}
                whileHover={{ rotateY: 0, scale: 1.08, zIndex: 30 }}
                className="absolute w-48 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-gold-500/40 glass-panel"
                style={{
                  top: `${idx * 22}px`,
                  left: `calc(50% - 150px + ${idx * 48}px)`,
                  transform: `rotate(${idx * 5 - 8}deg)`,
                  zIndex: 10 + idx
                }}
              >
                <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-3.5 flex flex-col justify-end">
                  <span className="text-[9px] font-bold text-gold-400 uppercase tracking-wider">{book.genre}</span>
                  <p className="font-serif font-bold text-sm text-white">{book.title}</p>
                  <p className="text-[10px] text-gray-300">{book.author}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-[#15171E] border-y border-white/10 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">How BookVerse Works</h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto mt-2">
              From bookshelf discovery to physical handoff, exchange your read books in 4 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Discover & Search', desc: 'Browse available books from nearby readers based on genre, distance, and ratings.', icon: BookOpen },
              { step: '02', title: 'Send Request', desc: 'Offer a book from your personal library in return for the book you want.', icon: Repeat },
              { step: '03', title: 'Chat & Meetup', desc: 'Accept requests, unlock private chat, and agree on a convenient pickup spot.', icon: MapPin },
              { step: '04', title: 'Read & Review', desc: 'Confirm receipt, update your reading goal progress, and leave reviews.', icon: Star }
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-[#0B0C10] border border-white/10 hover:border-gold-500/50 p-6 rounded-3xl space-y-4 text-left shadow-xl transition">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-extrabold text-2xl text-gold-500">{s.step}</span>
                    <Icon className="w-6 h-6 text-gold-400" />
                  </div>
                  <h3 className="font-bold text-lg text-white">{s.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sustainability & Community Callout */}
      <section className="py-20 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="glass-panel border border-gold-500/40 rounded-3xl p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-8 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-gold-500/20 border border-gold-500/40 text-gold-400 flex items-center justify-center shrink-0">
            <Recycle className="w-8 h-8" />
          </div>

          <div className="flex-1 space-y-2 text-center lg:text-left">
            <h3 className="font-serif text-2xl lg:text-3xl font-extrabold text-white">
              Read More. Spend Less. Waste Nothing.
            </h3>
            <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
              Millions of books collect dust after being read just once. By reusing and exchanging books locally, BookVerse reduces paper waste, makes reading affordable for everyone, and builds vibrant neighborhood reading communities.
            </p>
          </div>

          <Link
            to="/auth?mode=register"
            className="gold-gradient-bg hover:opacity-95 text-black font-extrabold px-6 py-3.5 rounded-2xl text-sm transition shrink-0 shadow-lg"
          >
            Start Exchanging Now
          </Link>
        </div>
      </section>


      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 lg:px-8 text-center text-xs text-gray-500 space-y-3 flex flex-col items-center">
        <Logo className="w-10 h-10" showText={true} />
        <p className="mt-2 font-light">"A book changes one reader. Shared books change an entire community."</p>
        <p>© 2026 BookVerse Inc. Hackathon Edition. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;

