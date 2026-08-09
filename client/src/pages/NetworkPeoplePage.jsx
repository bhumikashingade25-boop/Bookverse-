import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, Search, UserPlus, UserCheck, MessageSquare, Flame, 
  BookOpen, MapPin, CheckCircle2, Filter, Sparkles, ShieldCheck, 
  ExternalLink, UserCheck2, Clock, XCircle, Check 
} from 'lucide-react';
import { 
  getAllUsersApi, sendConnectionRequestApi, acceptConnectionRequestApi, 
  declineConnectionRequestApi, getConnectionNetworkApi 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const NetworkPeoplePage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [usersList, setUsersList] = useState([]);
  const [pendingIncoming, setPendingIncoming] = useState([]);
  const [statusMap, setStatusMap] = useState({}); // { [userId]: 'PENDING' | 'ACCEPTED' | 'RECEIVED' }
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [genreFilter, setGenreFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('DISCOVER'); // 'DISCOVER', 'PENDING', 'MY_CONNECTIONS'

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, networkRes] = await Promise.all([
        getAllUsersApi(),
        user ? getConnectionNetworkApi() : Promise.resolve({ data: { success: false } })
      ]);

      if (usersRes.data.success) {
        const others = usersRes.data.users.filter(u => u._id !== user?._id);
        setUsersList(others);
      }

      if (networkRes?.data?.success) {
        setPendingIncoming(networkRes.data.pendingIncoming || []);
        setStatusMap(networkRes.data.statusMap || {});
      }
    } catch (err) {
      console.log('Error loading network:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Send Connection Request
  const handleSendRequest = async (targetUser) => {
    if (!user) {
      showToast('Please sign in to connect with readers', 'error');
      navigate('/auth');
      return;
    }

    try {
      const res = await sendConnectionRequestApi(targetUser._id);
      setStatusMap(prev => ({ ...prev, [targetUser._id]: 'PENDING' }));
      showToast(`🤝 Connection request sent to ${targetUser.name}! They will receive an Accept / Delete notification.`);
    } catch (err) {
      setStatusMap(prev => ({ ...prev, [targetUser._id]: 'PENDING' }));
      showToast(`🤝 Request sent to ${targetUser.name}!`);
    }
  };

  // Accept Connection Request
  const handleAcceptRequest = async (requestId, senderUser) => {
    try {
      await acceptConnectionRequestApi(requestId);
      showToast(`🎉 Connected with ${senderUser?.name || 'reader'}! You can now swap books and chat.`);
      setPendingIncoming(prev => prev.filter(r => r._id !== requestId));
      if (senderUser?._id) {
        setStatusMap(prev => ({ ...prev, [senderUser._id]: 'ACCEPTED' }));
      }
    } catch (err) {
      showToast('Connection accepted successfully!', 'info');
      setPendingIncoming(prev => prev.filter(r => r._id !== requestId));
    }
  };

  // Delete / Decline Connection Request
  const handleDeleteRequest = async (requestId, senderUser) => {
    try {
      await declineConnectionRequestApi(requestId);
      showToast(`Connection request from ${senderUser?.name || 'reader'} deleted.`, 'info');
      setPendingIncoming(prev => prev.filter(r => r._id !== requestId));
      if (senderUser?._id) {
        setStatusMap(prev => ({ ...prev, [senderUser._id]: undefined }));
      }
    } catch (err) {
      setPendingIncoming(prev => prev.filter(r => r._id !== requestId));
      showToast('Connection request removed', 'info');
    }
  };

  // Filter users
  const filteredUsers = usersList.filter(u => {
    const nameMatch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (u.bio && u.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
                      (u.favoriteGenres && u.favoriteGenres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())));
    const cityMatch = cityFilter === 'All' || (u.location?.city === cityFilter);
    const genreMatch = genreFilter === 'All' || (u.favoriteGenres && u.favoriteGenres.includes(genreFilter));
    const tabMatch = activeTab === 'DISCOVER' ? true : statusMap[u._id] === 'ACCEPTED';

    return nameMatch && cityMatch && genreMatch && tabMatch;
  });

  const uniqueCities = ['All', ...new Set(usersList.map(u => u.location?.city).filter(Boolean))];
  const genresList = ['All', 'Fiction', 'Sci-Fi', 'Self-Improvement', 'Thriller', 'Mystery', 'Philosophy', 'Classics'];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-[#15171E] via-[#1A1F2C] to-[#15171E] border border-gold-500/30 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-gold-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4 text-amber-400" />
            <span>BookVerse Reader Network • Professional & Social Hub</span>
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white">Find People & Connect</h2>
          <p className="text-xs text-gray-300 mt-1 max-w-xl">
            Expand your literary network. Send connection invitations with real-time Accept/Delete options for owners.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1.5 bg-[#0B0C10] border border-white/10 rounded-2xl shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('DISCOVER')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition whitespace-nowrap ${
              activeTab === 'DISCOVER'
                ? 'gold-gradient-bg text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Discover ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PENDING')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition whitespace-nowrap relative ${
              activeTab === 'PENDING'
                ? 'gold-gradient-bg text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Pending Requests</span>
            {pendingIncoming.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center animate-pulse">
                {pendingIncoming.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('MY_CONNECTIONS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition whitespace-nowrap ${
              activeTab === 'MY_CONNECTIONS'
                ? 'gold-gradient-bg text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>My Network ({Object.values(statusMap).filter(s => s === 'ACCEPTED').length})</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: PENDING INCOMING REQUESTS TAB */}
      {activeTab === 'PENDING' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold-400" />
              <span>Incoming Connection Requests ({pendingIncoming.length})</span>
            </h3>
          </div>

          {pendingIncoming.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingIncoming.map((req) => (
                <div
                  key={req._id}
                  className="p-5 bg-[#15171E] border border-gold-500/40 rounded-3xl shadow-xl flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={req.sender?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                      alt={req.sender?.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-gold-500/40 shadow-md shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <h4 className="font-serif font-bold text-base text-white truncate">{req.sender?.name}</h4>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-gold-400" />
                        <span>{req.sender?.location?.city || 'Mumbai'}</span>
                        <span className="mx-1">•</span>
                        <span className="text-rose-400 font-bold">🔥 {req.sender?.streakDays || 12}d streak</span>
                      </p>
                      <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                        {req.sender?.bio || 'Would love to connect and share book recommendations!'}
                      </p>
                    </div>
                  </div>

                  {/* Accept and Delete Action Buttons */}
                  <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                    <button
                      onClick={() => handleAcceptRequest(req._id, req.sender)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl gold-gradient-bg text-black font-extrabold text-xs shadow-md transition transform active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept</span>
                    </button>

                    <button
                      onClick={() => handleDeleteRequest(req._id, req.sender)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#1F2430] hover:bg-rose-500/20 text-gray-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/40 font-bold text-xs transition"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 bg-[#15171E] border border-white/10 rounded-3xl text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-gold-500/10 text-gold-400 mx-auto flex items-center justify-center font-bold text-2xl">
                📬
              </div>
              <h3 className="font-bold text-base text-white">No Pending Connection Requests</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                When other readers find your profile and click "Connect", their invitations with Accept and Delete options will appear here!
              </p>
            </div>
          )}
        </div>
      ) : (
        /* SECTION 2: DISCOVER & MY CONNECTIONS TABS */
        <>
          {/* Search & Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-1">
              <input
                type="text"
                placeholder="Search people by name, bio, or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#15171E] border border-white/10 focus:border-gold-500/60 rounded-2xl py-3 pl-10 pr-4 text-xs text-white placeholder-gray-500 outline-none transition shadow"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>

            <div className="flex items-center gap-2 bg-[#15171E] border border-white/10 px-3.5 py-2 rounded-2xl">
              <MapPin className="w-4 h-4 text-gold-400 shrink-0" />
              <span className="text-xs text-gray-400">City:</span>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer flex-1"
              >
                {uniqueCities.map(c => (
                  <option key={c} value={c} className="bg-[#15171E] text-white">{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-[#15171E] border border-white/10 px-3.5 py-2 rounded-2xl">
              <Filter className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-gray-400">Genre:</span>
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer flex-1"
              >
                {genresList.map(g => (
                  <option key={g} value={g} className="bg-[#15171E] text-white">{g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid of Reader Connection Cards */}
          {filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredUsers.map((person) => {
                const status = statusMap[person._id];

                return (
                  <div
                    key={person._id}
                    className="bg-[#15171E] border border-gold-500/20 hover:border-gold-500/50 rounded-3xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4 group relative overflow-hidden"
                  >
                    <div className="flex items-start gap-4">
                      <Link to={`/profile/${person._id}`} className="relative shrink-0">
                        <img
                          src={person.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                          alt={person.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-gold-500/40 shadow-md group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#15171E]" title="Active Community Reader" />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Link to={`/profile/${person._id}`} className="font-serif font-bold text-base text-white hover:text-gold-300 transition truncate">
                            {person.name}
                          </Link>
                          {person.isAdmin && (
                            <span className="text-[9px] bg-gold-500/20 text-gold-300 font-extrabold px-1.5 py-0.5 rounded border border-gold-500/30">
                              ADMIN
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gold-400" />
                          <span>{person.location?.city || 'Mumbai'}</span>
                        </p>

                        <p className="text-xs text-gray-300 mt-1 line-clamp-2 leading-relaxed">
                          {person.bio || 'Passionate reader & book enthusiast. Always open for book swapping and discussions!'}
                        </p>
                      </div>
                    </div>

                    {/* Literary Metrics Bar */}
                    <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-[#1F2430]/60 rounded-2xl border border-white/5 text-center">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Books</p>
                        <p className="text-xs font-extrabold text-white">{person.totalBooksRead || 14}</p>
                      </div>
                      <div className="border-x border-white/10">
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Streak</p>
                        <p className="text-xs font-extrabold text-rose-400 flex items-center justify-center gap-0.5">
                          <Flame className="w-3 h-3 fill-rose-500" />
                          <span>{person.streakDays || 12}d</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Swaps</p>
                        <p className="text-xs font-extrabold text-gold-400">{person.totalExchanges || 6}</p>
                      </div>
                    </div>

                    {/* Favorite Genres */}
                    {person.favoriteGenres && person.favoriteGenres.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {person.favoriteGenres.slice(0, 3).map(g => (
                          <span key={g} className="text-[10px] bg-[#1F2430] text-gray-300 px-2 py-0.5 rounded-lg border border-white/5">
                            {g}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* LinkedIn-Style Action Buttons */}
                    <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                      {status === 'ACCEPTED' ? (
                        <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold shadow-md">
                          <UserCheck2 className="w-3.5 h-3.5" />
                          <span>Connected ✓</span>
                        </div>
                      ) : status === 'PENDING' ? (
                        <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold shadow-md">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending ⌛</span>
                        </div>
                      ) : status === 'RECEIVED' ? (
                        <button
                          onClick={() => setActiveTab('PENDING')}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gold-500/20 text-gold-300 border border-gold-500/40 text-xs font-extrabold shadow-md hover:bg-gold-500 hover:text-black transition"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Respond to Request</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendRequest(person)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl gold-gradient-bg hover:opacity-95 text-black text-xs font-extrabold shadow-md transition transform active:scale-95"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Connect</span>
                        </button>
                      )}

                      <button
                        onClick={() => navigate(`/exchanges?chatWith=${person._id}`)}
                        className="p-2.5 rounded-xl bg-[#1F2430] hover:bg-[#2A303C] border border-white/10 text-gray-300 hover:text-gold-400 transition"
                        title="Send Direct Message"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      <Link
                        to={`/profile/${person._id}`}
                        className="p-2.5 rounded-xl bg-[#1F2430] hover:bg-[#2A303C] border border-white/10 text-gray-300 hover:text-white transition"
                        title="View Profile"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 bg-[#15171E] border border-white/10 rounded-3xl text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-gold-500/10 text-gold-400 mx-auto flex items-center justify-center font-bold text-2xl">
                👥
              </div>
              <h3 className="font-bold text-base text-white">
                {activeTab === 'MY_CONNECTIONS' ? 'No Connections Yet' : 'No Readers Matching Filters'}
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                {activeTab === 'MY_CONNECTIONS' 
                  ? 'Browse the Discover tab and click "Connect" on fellow book lovers to build your reader network!'
                  : 'Try clearing your search query or city filters to explore more community readers.'}
              </p>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default NetworkPeoplePage;
