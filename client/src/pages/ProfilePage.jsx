import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  User, MapPin, BookOpen, Repeat, Trophy, Flame, UserPlus, 
  UserCheck, Shield, Edit3, MessageSquare, PlusCircle, Sparkles, 
  BookMarked, Bookmark, Clock, UserCheck2, XCircle, Share2, CheckCircle2 
} from 'lucide-react';
import BookGrid from '../components/BookGrid';
import PostCard from '../components/PostCard';
import AchievementBadge from '../components/AchievementBadge';
import Modal from '../components/Modal';
import { 
  getUserProfileApi, followUserApi, unfollowUserApi, 
  sendConnectionRequestApi, acceptConnectionRequestApi, 
  declineConnectionRequestApi, updateUserProfileApi 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // If no :id is in URL, default to logged in user's profile
  const profileId = id || currentUser?._id;

  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('library');
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('NONE'); // 'NONE' | 'PENDING' | 'RECEIVED' | 'CONNECTED'

  // Edit Profile Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editGenres, setEditGenres] = useState([]);
  const [editYearlyGoal, setEditYearlyGoal] = useState(24);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getUserProfileApi(profileId);
      if (res.data.success) {
        setProfileData(res.data);
        setIsFollowing(res.data.isFollowing);
        setConnectionStatus(res.data.connectionStatus || 'NONE');

        // Pre-fill edit modal form
        if (res.data.user) {
          setEditName(res.data.user.name || '');
          setEditBio(res.data.user.bio || '');
          setEditCity(res.data.user.location?.city || 'Mumbai');
          setEditAvatar(res.data.user.avatar || '');
          setEditGenres(res.data.user.favoriteGenres || ['Fiction', 'Sci-Fi']);
          setEditYearlyGoal(res.data.user.readingGoal?.yearlyTarget || 24);
        }
      }
    } catch (err) {
      console.log('Fetch profile error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileId) fetchProfile();
  }, [profileId, currentUser]);

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await unfollowUserApi(profileId);
        setIsFollowing(false);
        showToast('Unfollowed reader');
      } else {
        await followUserApi(profileId);
        setIsFollowing(true);
        showToast('Following reader! You will receive their latest book updates.');
      }
      fetchProfile();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error toggling follow', 'error');
    }
  };

  const handleConnect = async () => {
    try {
      await sendConnectionRequestApi(profileId);
      setConnectionStatus('PENDING');
      showToast(`🤝 Connection request sent to ${profileData.user.name}!`);
    } catch (err) {
      setConnectionStatus('PENDING');
      showToast(`🤝 Request sent to ${profileData.user.name}!`);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await updateUserProfileApi(currentUser._id, {
        name: editName,
        bio: editBio,
        avatar: editAvatar,
        location: { city: editCity },
        favoriteGenres: editGenres,
        readingGoal: { yearlyTarget: Number(editYearlyGoal) }
      });
      if (res.data.success) {
        if (updateUser) updateUser(res.data.user);
        showToast('🎉 Your profile has been updated!');
        setEditModalOpen(false);
        fetchProfile();
      }
    } catch (err) {
      showToast('Error updating profile', 'error');
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-400">Loading reader profile...</div>;
  if (!profileData || !profileData.user) {
    return (
      <div className="p-12 text-center bg-[#15171E] border border-white/10 rounded-3xl space-y-3">
        <p className="text-rose-400 font-bold text-base">Reader Profile Not Found</p>
        <p className="text-xs text-gray-400">The user may have been removed or the link is invalid.</p>
        <Link to="/network" className="inline-block gold-gradient-bg text-black font-extrabold px-5 py-2.5 rounded-xl text-xs">
          Explore Network
        </Link>
      </div>
    );
  }

  const { user, books = [], posts = [], achievements = [] } = profileData;
  const isSelf = currentUser?._id?.toString() === user._id?.toString();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Dynamic Profile Header */}
      <div className="bg-[#15171E] p-6 lg:p-8 rounded-3xl border border-gold-500/30 shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Glow background accent */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative shrink-0">
            <img
              src={(isSelf && currentUser?.avatar) ? currentUser.avatar : (user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80')}
              alt={user.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-gold-500 shadow-xl"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#15171E]" title="Active Community Reader" />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2.5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="font-serif font-bold text-2xl sm:text-3xl text-white">{user.name}</h1>
                  {user.isAdmin && (
                    <span className="text-[10px] bg-gold-500/20 text-gold-300 font-extrabold px-2 py-0.5 rounded-full border border-gold-500/30 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-gold-400" />
                      <span>ADMIN</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-400 flex items-center justify-center sm:justify-start gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-gold-400" />
                  <span>{user.location?.city || 'Mumbai'}, India</span>
                  <span className="mx-1">•</span>
                  <span className="text-gold-300 font-semibold">BookVerse Verified Reader</span>
                </p>
              </div>

              {/* Context Action Controls */}
              {isSelf ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1F2430] hover:bg-[#2A303C] border border-white/10 text-white transition shadow"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-gold-400" />
                    <span>Edit Profile</span>
                  </button>

                  <Link
                    to="/upload"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold gold-gradient-bg text-black shadow-md transition transform active:scale-95"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ List Book</span>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {/* LinkedIn Style Connect Button */}
                  <button
                    onClick={connectionStatus === 'NONE' ? handleConnect : undefined}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition shadow-md ${
                      connectionStatus === 'CONNECTED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : connectionStatus === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'gold-gradient-bg text-black hover:opacity-95'
                    }`}
                  >
                    {connectionStatus === 'CONNECTED' ? (
                      <>
                        <UserCheck2 className="w-3.5 h-3.5" />
                        <span>Connected ✓</span>
                      </>
                    ) : connectionStatus === 'PENDING' ? (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending ⌛</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Connect</span>
                      </>
                    )}
                  </button>

                  {/* Direct Message CTA */}
                  <button
                    onClick={() => navigate(`/exchanges?chatWith=${user._id}`)}
                    className="p-2 rounded-xl bg-[#1F2430] hover:bg-[#2A303C] border border-white/10 text-gray-300 hover:text-gold-400 transition"
                    title="Direct Message"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  {/* Follow Toggle */}
                  <button
                    onClick={handleFollowToggle}
                    className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                      isFollowing
                        ? 'bg-[#1F2430] text-gray-300 border-white/10 hover:text-rose-400'
                        : 'bg-[#1F2430] text-gold-300 border-gold-500/30 hover:bg-gold-500 hover:text-black'
                    }`}
                  >
                    <span>{isFollowing ? 'Following' : 'Follow'}</span>
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed font-light">
              {user.bio || 'Passionate reader & book enthusiast. Always open for book swapping and discussions!'}
            </p>

            {/* Favorite Genres Pills */}
            {user.favoriteGenres && user.favoriteGenres.length > 0 && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                {user.favoriteGenres.map(g => (
                  <span key={g} className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#1F2430] text-gold-300 border border-white/5">
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Literary Metrics Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-white/10 text-center">
          <div className="p-3 bg-[#1F2430]/60 rounded-2xl border border-white/5">
            <p className="font-serif font-extrabold text-xl text-gold-400">{books.length || user.totalBooksRead || 0}</p>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Exchange Books</p>
          </div>

          <div className="p-3 bg-[#1F2430]/60 rounded-2xl border border-white/5">
            <p className="font-serif font-extrabold text-xl text-gold-400">{user.totalExchanges || 0}</p>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Swaps Completed</p>
          </div>

          <div className="p-3 bg-[#1F2430]/60 rounded-2xl border border-white/5">
            <p className="font-serif font-extrabold text-xl text-rose-400 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-rose-500" />
              <span>{user.streakDays || 1}d</span>
            </p>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Reading Streak</p>
          </div>

          <div className="p-3 bg-[#1F2430]/60 rounded-2xl border border-white/5">
            <p className="font-serif font-extrabold text-xl text-gold-400">{user.followersCount || 0}</p>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Connections & Followers</p>
          </div>
        </div>
      </div>

      {/* Profile Section Tabs */}
      <div className="flex border-b border-white/10 gap-2 text-xs font-bold overflow-x-auto scrollbar-none">
        {[
          { key: 'library', label: `Physical Bookshelf (${books.length})`, icon: BookOpen },
          { key: 'posts', label: `Activity & Posts (${posts.length})`, icon: MessageSquare },
          { key: 'achievements', label: `Literary Badges (${achievements.length})`, icon: Trophy },
          { key: 'habits', label: `Reading Habits & Goals`, icon: Sparkles }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 pb-3 px-3 border-b-2 transition whitespace-nowrap ${
                activeTab === t.key
                  ? 'border-gold-500 text-gold-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Physical Bookshelf */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-white">
              {isSelf ? 'Your Listed Books for Physical Swap' : `${user.name}'s Listed Books`}
            </h3>
            {isSelf && (
              <Link to="/upload" className="text-xs text-gold-400 hover:underline font-bold">
                + List Another Book
              </Link>
            )}
          </div>

          {books.length > 0 ? (
            <BookGrid books={books} loading={false} />
          ) : (
            <div className="p-10 bg-[#15171E] border border-white/10 rounded-3xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gold-500/10 text-gold-400 mx-auto flex items-center justify-center font-bold text-xl">
                📚
              </div>
              <h4 className="font-bold text-sm text-white">
                {isSelf ? 'No Physical Books Listed Yet' : `${user.name} has not listed books yet`}
              </h4>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                {isSelf 
                  ? 'List your physical copies on BookVerse to enable swaps with nearby readers in your city!'
                  : 'Check back later or message this reader to ask about books they plan to swap.'}
              </p>
              {isSelf && (
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 gold-gradient-bg text-black font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md mt-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>List Your First Book</span>
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Activity & Community Posts */}
      {activeTab === 'posts' && (
        <div className="space-y-4 max-w-2xl">
          {posts.length > 0 ? (
            posts.map(p => (
              <PostCard key={p._id} post={p} />
            ))
          ) : (
            <div className="p-10 bg-[#15171E] border border-white/10 rounded-3xl text-center space-y-2">
              <div className="text-2xl">✍️</div>
              <h4 className="font-bold text-sm text-white">No Community Posts Yet</h4>
              <p className="text-xs text-gray-400">
                {isSelf ? 'Share your latest thoughts or reading milestones on the Home Feed!' : 'This reader has not posted in the community feed yet.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Literary Badges */}
      {activeTab === 'achievements' && (
        <div className="space-y-4">
          {achievements.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievements.map(a => (
                <AchievementBadge key={a._id} achievement={a} />
              ))}
            </div>
          ) : (
            <div className="p-10 bg-[#15171E] border border-white/10 rounded-3xl text-center space-y-2">
              <div className="text-2xl">🏆</div>
              <h4 className="font-bold text-sm text-white">Badges Unlocked on Swaps & Streaks</h4>
              <p className="text-xs text-gray-400">
                Badges like "Literary Pioneer", "100 Pages Streak", and "Community Host" appear here as you read and swap.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Reading Habits & Goals */}
      {activeTab === 'habits' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-[#15171E] border border-white/10 rounded-3xl space-y-3">
            <h4 className="font-serif font-bold text-sm text-gold-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Annual Reading Goal</span>
            </h4>
            <p className="text-2xl font-extrabold text-white">
              {user.readingGoal?.completedThisYear || 0} / {user.readingGoal?.yearlyTarget || 24} Books
            </p>
            <p className="text-xs text-gray-400">
              Target for 2026 • Building consistent daily habits through physical book exchange.
            </p>
          </div>

          <div className="p-6 bg-[#15171E] border border-white/10 rounded-3xl space-y-3">
            <h4 className="font-serif font-bold text-sm text-gold-400 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold-400" />
              <span>Location & Exchange Radius</span>
            </h4>
            <p className="text-lg font-bold text-white">
              {user.location?.city || 'Mumbai'}, {user.location?.state || 'Maharashtra'}
            </p>
            <p className="text-xs text-gray-400">
              Preferred swap radius: Within 15 km • Eligible for Hyperlocal Courier Delivery.
            </p>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Your Reading Profile">
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">Your Display Name</label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">Reader Bio / About You</label>
            <textarea
              rows={3}
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="Tell other readers about your favorite books, reading genres, and swap preferences..."
              className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-gray-300 font-semibold">City</label>
              <input
                type="text"
                value={editCity}
                onChange={(e) => setEditCity(e.target.value)}
                placeholder="e.g. Mumbai, Delhi"
                className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-300 font-semibold">Yearly Reading Target</label>
              <input
                type="number"
                value={editYearlyGoal}
                onChange={(e) => setEditYearlyGoal(e.target.value)}
                placeholder="e.g. 24"
                className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none font-medium"
              />
            </div>
          </div>

          <div className="space-y-3 flex flex-col items-center pb-4 border-b border-white/10">
            <label className="text-gray-300 font-semibold w-full text-left">Profile Avatar (DP)</label>
            <div className="flex flex-col items-center gap-4 w-full">
              <img src={editAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'} alt="DP preview" className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-gold-500 shadow-xl" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="w-full text-center text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gold-500/10 file:text-gold-400 hover:file:bg-gold-500/20 cursor-pointer" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gold-gradient-bg text-black font-extrabold px-5 py-2.5 rounded-xl shadow-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default ProfilePage;
