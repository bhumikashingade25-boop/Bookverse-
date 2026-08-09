import React, { useState } from 'react';
import { Settings, Save, Shield, Bell, MapPin, User } from 'lucide-react';
import { updateUserProfileApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [city, setCity] = useState(user?.location?.city || 'Mumbai');
  const [yearlyTarget, setYearlyTarget] = useState(user?.readingGoal?.yearlyTarget || 24);
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateUserProfileApi(user._id, {
        name,
        bio,
        avatar,
        location: { ...user.location, city },
        readingGoal: { yearlyTarget: Number(yearlyTarget), completedThisYear: user.readingGoal?.completedThisYear || 8 }
      });
      if (res.data.success) {
        updateUser(res.data.user);
        showToast('Settings saved successfully!');
      }
    } catch (err) {
      showToast('Error saving settings', 'error');
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Settings className="w-6 h-6 text-gold-400" />
          <div>
            <h2 className="font-serif font-bold text-2xl text-white">Account & Preference Settings</h2>
            <p className="text-xs text-gray-400">Update your profile, location radius, and reading goals.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-2 flex flex-col items-center sm:items-start pb-2 border-b border-white/10">
            <label className="text-gray-300 font-semibold">Profile Avatar (DP)</label>
            <div className="flex items-center gap-4 w-full">
              <img src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'} alt="DP preview" className="w-16 h-16 rounded-full object-cover border-2 border-gold-500/50" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gold-500/10 file:text-gold-400 hover:file:bg-gold-500/20 cursor-pointer" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gold-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">City Location</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gold-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">Annual Reading Goal Target (Books)</label>
            <input
              type="number"
              value={yearlyTarget}
              onChange={(e) => setYearlyTarget(e.target.value)}
              className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gold-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 font-semibold">Bio / Reading Interests</label>
            <textarea
              rows="3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gold-500"
            />
          </div>

          <button
            type="submit"
            className="gold-gradient-bg text-black font-extrabold px-6 py-3 rounded-xl text-xs hover:opacity-95 transition shadow-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
