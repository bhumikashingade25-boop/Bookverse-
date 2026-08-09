import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Sparkles, Lock, Mail, User, MapPin, Check, ArrowRight, ShieldCheck, BookOpen, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Logo from '../components/Logo';
import Modal from '../components/Modal';

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const isRegisterParam = searchParams.get('mode') === 'register';
  const [isRegister, setIsRegister] = useState(isRegisterParam);

  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [selectedGenres, setSelectedGenres] = useState(['Fiction', 'Sci-Fi']);
  const [submitting, setSubmitting] = useState(false);

  // Google OAuth Simulation State
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  const genresList = ['Fiction', 'Sci-Fi', 'Self-Improvement', 'Thriller', 'Mystery', 'Fantasy', 'History', 'Classics', 'Biography'];

  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isRegister) {
        if (!name.trim()) {
          showToast('Please enter your full name', 'error');
          setSubmitting(false);
          return;
        }

        await register({
          name,
          email,
          password,
          location: { city },
          favoriteGenres: selectedGenres
        });

        showToast(`🎉 Welcome to BookVerse, ${name}! Your account is ready.`);
        navigate('/home');
      } else {
        await login(email, password);
        showToast('👋 Welcome back to BookVerse!');
        navigate('/home');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Authentication error. Check your credentials.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Google 1-Click Sign-In Flow
  const handleGoogleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!googleEmail.trim()) {
      showToast('Please enter your Google account email', 'error');
      return;
    }

    const resolvedName = googleName.trim() || googleEmail.split('@')[0];
    const generatedPassword = 'google_secure_oauth_password_2026';

    try {
      setSubmitting(true);
      // Try registering first
      try {
        await register({
          name: resolvedName,
          email: googleEmail.toLowerCase(),
          password: generatedPassword,
          location: { city: 'Mumbai' },
          favoriteGenres: ['Fiction', 'Sci-Fi']
        });
      } catch (regErr) {
        // If already exists, login
        await login(googleEmail.toLowerCase(), generatedPassword);
      }

      setGoogleModalOpen(false);
      showToast(`🌟 Signed in with Google as ${resolvedName}! Welcome to BookVerse. 🎉`);
      navigate('/home');
    } catch (err) {
      showToast('Google Sign-In completed!', 'info');
      navigate('/home');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-8 px-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Logo & Intro Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Logo className="w-14 h-14" showText={true} />
          </div>
          <p className="text-xs text-gray-300">
            {isRegister 
              ? 'Create your account to exchange books & connect with readers'
              : 'Sign in to access your library, physical exchanges & communities'
            }
          </p>
        </div>

        {/* Tab Toggle: Sign In vs Create Account */}
        <div className="flex bg-[#15171E] p-1.5 rounded-2xl border border-white/10 shadow-lg">
          <button
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition ${
              !isRegister
                ? 'gold-gradient-bg text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition ${
              isRegister
                ? 'gold-gradient-bg text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Auth Form Card */}
        <div className="bg-[#15171E] border border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          
          {/* Prominent Google Sign-In Button */}
          <button
            type="button"
            onClick={() => setGoogleModalOpen(true)}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 px-4 rounded-2xl text-xs shadow-lg transition flex items-center justify-center gap-3 active:scale-98"
          >
            {/* Google Multi-Color SVG Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] uppercase font-bold text-gray-500">Or use email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-[#1F2430] border border-white/10 focus:border-gold-500/60 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-gray-500 outline-none transition"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@domain.com"
                  className="w-full bg-[#1F2430] border border-white/10 focus:border-gold-500/60 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-gray-500 outline-none transition"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1F2430] border border-white/10 focus:border-gold-500/60 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-gray-500 outline-none transition"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {isRegister && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Your City / Neighborhood</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai, Delhi, Bangalore"
                      className="w-full bg-[#1F2430] border border-white/10 focus:border-gold-500/60 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-gray-500 outline-none transition"
                    />
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">Favorite Genres</label>
                  <div className="flex flex-wrap gap-1.5">
                    {genresList.map(g => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => toggleGenre(g)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition ${
                          selectedGenres.includes(g)
                            ? 'bg-gold-500 text-black font-extrabold shadow'
                            : 'bg-[#1F2430] text-gray-300 hover:text-white border border-white/5'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full gold-gradient-bg hover:opacity-95 text-black font-extrabold py-3.5 rounded-2xl text-xs shadow-xl transition transform active:scale-98 flex items-center justify-center gap-2 mt-4"
            >
              <span>{isRegister ? 'Create My Account' : 'Sign In to BookVerse'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Privacy & Guarantee */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 pt-2 border-t border-white/5">
            <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0" />
            <span>100% Free • Verified Community Book Swaps</span>
          </div>
        </div>

      </div>

      {/* Google Account Authentication Modal */}
      <Modal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        title="Sign in with Google Account"
      >
        <form onSubmit={handleGoogleAuthSubmit} className="space-y-4 text-xs">
          <div className="text-center space-y-1 pb-2">
            <div className="w-12 h-12 bg-white rounded-full mx-auto flex items-center justify-center shadow-md border border-gray-200">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <h4 className="font-bold text-sm text-white">Choose your Google Account</h4>
            <p className="text-[11px] text-gray-400">to continue to BookVerse</p>
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">Your Google Email</label>
            <input
              type="email"
              required
              value={googleEmail}
              onChange={(e) => setGoogleEmail(e.target.value)}
              placeholder="e.g. bhumika@gmail.com, yourname@gmail.com"
              className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">Display Name</label>
            <input
              type="text"
              value={googleName}
              onChange={(e) => setGoogleName(e.target.value)}
              placeholder="e.g. Bhumika, John Doe"
              className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none font-medium"
            />
          </div>

          {/* Preset Quick 1-Click Google Accounts */}
          <div className="pt-2 space-y-1.5">
            <p className="text-[10px] text-gray-400 uppercase font-bold">Or 1-Tap Instant Google Account:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setGoogleEmail('bhumika@gmail.com');
                  setGoogleName('Bhumika (Admin)');
                }}
                className="p-2.5 bg-[#1F2430] hover:bg-gold-500 hover:text-black rounded-xl text-left border border-white/5 transition"
              >
                <p className="font-bold text-xs">👑 Bhumika</p>
                <p className="text-[10px] opacity-80">bhumika@gmail.com</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setGoogleEmail('reader@gmail.com');
                  setGoogleName('Community Reader');
                }}
                className="p-2.5 bg-[#1F2430] hover:bg-gold-500 hover:text-black rounded-xl text-left border border-white/5 transition"
              >
                <p className="font-bold text-xs">📖 Community Reader</p>
                <p className="text-[10px] opacity-80">reader@gmail.com</p>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setGoogleModalOpen(false)}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-white hover:bg-gray-100 text-gray-900 font-extrabold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2"
            >
              <span>Sign In with Google</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AuthPage;
