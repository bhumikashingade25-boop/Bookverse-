import React, { useState, useEffect } from 'react';
import { Users, Plus, UserCheck, Sparkles, BookOpen } from 'lucide-react';
import Modal from '../components/Modal';
import { getClubsApi, createClubApi, toggleJoinClubApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ReadingClubsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [clubs, setClubs] = useState([]);
  const [joinedClubIds, setJoinedClubIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Sci-Fi');
  const [description, setDescription] = useState('');

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const res = await getClubsApi();
      if (res.data.success) {
        setClubs(res.data.clubs);
        setJoinedClubIds(res.data.joinedClubIds || []);
      }
    } catch (err) {
      console.log('Error fetching clubs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [user]);

  const handleToggleJoin = async (clubId) => {
    try {
      const res = await toggleJoinClubApi(clubId);
      if (res.data.success) {
        if (res.data.joined) {
          setJoinedClubIds(prev => [...prev, clubId]);
          showToast('Joined Reading Club! 🎉');
        } else {
          setJoinedClubIds(prev => prev.filter(id => id !== clubId));
          showToast('Left Reading Club');
        }
        fetchClubs();
      }
    } catch (err) {
      showToast('Error updating club membership', 'error');
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    if (!name || !description) return;

    try {
      const res = await createClubApi({
        name,
        category,
        description
      });

      if (res.data.success) {
        showToast('Reading Club created! 📚');
        setIsModalOpen(false);
        setName('');
        setDescription('');
        fetchClubs();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Error creating club', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-gold-400">
            <Users className="w-5 h-5" />
            <h2 className="font-serif font-bold text-2xl text-white">Reading Clubs & Communities</h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Join genre societies, discuss monthly reads, and exchange books with club members.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="gold-gradient-bg text-black font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg hover:opacity-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create Club</span>
        </button>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="p-8 text-center text-gray-400 col-span-full">Loading reading clubs...</div>
        ) : (
          clubs.map(club => {
            const isMember = joinedClubIds.includes(club._id);
            return (
              <div
                key={club._id}
                className="bg-[#15171E] border border-white/10 hover:border-gold-500/40 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between space-y-4 transition"
              >
                {/* Banner */}
                <div className="relative h-36 bg-black/40">
                  <img src={club.bannerUrl} alt="" className="w-full h-full object-cover" />
                  <span className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-gold-300 uppercase border border-gold-500/30">
                    {club.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-serif font-bold text-lg text-white">{club.name}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2">{club.description}</p>
                  </div>

                  {/* Featured Book Badge */}
                  <div className="p-3 bg-[#1F2430]/60 border border-white/5 rounded-xl flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-gold-400 shrink-0" />
                    <div className="truncate text-xs">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Current Club Read</span>
                      <span className="font-bold text-white truncate">{club.featuredBookTitle}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-xs text-gray-400 font-medium">👥 {club.memberCount} Members</span>

                    <button
                      onClick={() => handleToggleJoin(club._id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                        isMember
                          ? 'bg-[#1F2430] text-gray-200 border border-white/10 hover:bg-rose-500/20 hover:text-rose-400'
                          : 'gold-gradient-bg text-black hover:opacity-95'
                      }`}
                    >
                      {isMember ? <UserCheck className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      <span>{isMember ? 'Joined' : 'Join Club'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Club Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Start a Reading Club">
        <form onSubmit={handleCreateClub} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">Club Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Cyberpunk Book Club"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none"
            >
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Fiction">Fiction</option>
              <option value="Self-Improvement">Self-Improvement</option>
              <option value="Thriller">Thriller</option>
              <option value="Mystery">Mystery</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">Description *</label>
            <textarea
              rows="3"
              required
              placeholder="What type of books will your club read and discuss?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button type="submit" className="bg-gold-500 text-black font-bold px-5 py-2 rounded-xl">
              Create Reading Club
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ReadingClubsPage;
