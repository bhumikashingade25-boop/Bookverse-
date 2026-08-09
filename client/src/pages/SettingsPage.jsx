import React, { useState } from 'react';
import { Settings, Save, Shield, Bell, MapPin, User } from 'lucide-react';
import { updateUserProfileApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const SettingsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [city, setCity] = useState(user?.location?.city || 'Mumbai');
  const [yearlyTarget, setYearlyTarget] = useState(user?.readingGoal?.yearlyTarget || 24);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfileApi(user._id, {
        name,
        bio,
        location: { ...user.location, city },
        readingGoal: { yearlyTarget: Number(yearlyTarget), completedThisYear: user.readingGoal?.completedThisYear || 8 }
      });
      showToast('Settings saved successfully!');
    } catch (err) {
      showToast('Error saving settings', 'error');
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
