import React, { useState, useEffect } from 'react';
import OpenStreetMapView from '../components/OpenStreetMapView';
import DeliveryAgentTab from '../components/DeliveryAgentTab';
import Modal from '../components/Modal';
import { getBooksApi, createExchangeApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MapPin, Navigation, Crosshair, Bike, BookOpen, ShieldCheck, Sparkles, Zap, Globe } from 'lucide-react';

const NearbyMapPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('books'); // 'books' or 'delivery'
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Exchange Modal State
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [selectedBookToRequest, setSelectedBookToRequest] = useState(null);
  const [myBooks, setMyBooks] = useState([]);
  const [offeredBookId, setOfferedBookId] = useState('');

  const fetchMapBooks = async () => {
    try {
      setLoading(true);
      const res = await getBooksApi({ availability: 'AVAILABLE' });
      if (res.data.success) {
        setBooks(res.data.books);
      }

      if (user) {
        setMyBooks(res.data.books.filter(b => b.owner?._id === user._id || b.owner === user._id));
      }
    } catch (err) {
      console.log('Map books fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapBooks();
  }, [user]);

  const handleSelectBookFromMap = (book) => {
    setSelectedBookToRequest(book);
    setExchangeModalOpen(true);
  };

  const handleSendExchangeRequest = async (e) => {
    e.preventDefault();
    if (!offeredBookId) {
      showToast('Select a book to offer', 'error');
      return;
    }

    try {
      const res = await createExchangeApi({
        requestedBookId: selectedBookToRequest._id,
        offeredBookId
      });

      if (res.data.success) {
        showToast('Exchange request sent to nearby reader! 🔄');
        setExchangeModalOpen(false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error sending request', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Tab Controls */}
      <div className="p-6 bg-[#15171E] border border-gold-500/30 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-gold-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Globe className="w-4 h-4" />
            <span>OpenStreetMap (OSM) Live • Real-Time Neighborhood Radar</span>
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white">Local Radar & Express Courier</h2>
          <p className="text-xs text-gray-300 mt-1 max-w-xl">
            Live interactive OpenStreetMap displaying nearby readers, physical book listings, and active doorstep delivery agents across your city.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1.5 bg-[#0B0C10] border border-white/10 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab('books')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeTab === 'books'
                ? 'gold-gradient-bg text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Nearby Books ({books.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('delivery')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeTab === 'delivery'
                ? 'gold-gradient-bg text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Online Delivery Agents (4)</span>
          </button>
        </div>
      </div>

      {/* Real-Time OpenStreetMap Component */}
      <OpenStreetMapView 
        books={books} 
        activeTab={activeTab} 
        onSelectBook={handleSelectBookFromMap} 
      />

      {/* Online Delivery Agent Section */}
      {activeTab === 'delivery' ? (
        <DeliveryAgentTab />
      ) : (
        /* Quick Highlights when on Books tab */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[#15171E] border border-gold-500/20 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-400 flex items-center justify-center font-bold text-lg">
              🗺️
            </div>
            <div>
              <p className="text-xs font-bold text-white">OpenStreetMap (OSM) Engine</p>
              <p className="text-[11px] text-gray-400">Zero API key constraints, 100% open geospatial data</p>
            </div>
          </div>

          <div className="p-4 bg-[#15171E] border border-gold-500/20 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg">
              ⚡
            </div>
            <div>
              <p className="text-xs font-bold text-white">Express Delivery Option</p>
              <p className="text-[11px] text-gray-400">Book a doorstep courier in 1-tap</p>
            </div>
          </div>

          <div className="p-4 bg-[#15171E] border border-gold-500/20 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg">
              🌱
            </div>
            <div>
              <p className="text-xs font-bold text-white">Zero Shipping Waste</p>
              <p className="text-[11px] text-gray-400">Eco-friendly local neighborhood swaps</p>
            </div>
          </div>
        </div>
      )}

      {/* Book Exchange Request Modal */}
      <Modal isOpen={exchangeModalOpen} onClose={() => setExchangeModalOpen(false)} title="Request Physical Book Exchange">
        {selectedBookToRequest && (
          <form onSubmit={handleSendExchangeRequest} className="space-y-4 text-xs">
            <div className="p-3 bg-[#1F2430] rounded-xl flex items-center gap-3">
              <img src={selectedBookToRequest.coverUrl} alt="" className="w-12 h-16 object-cover rounded-lg shadow-md" />
              <div>
                <span className="text-[10px] text-gold-400 uppercase font-bold">{selectedBookToRequest.genre}</span>
                <h4 className="font-bold text-sm text-white">{selectedBookToRequest.title}</h4>
                <p className="text-xs text-gray-300">
                  Owner: {selectedBookToRequest.owner?.name || 'Local Reader'} • 📍 {selectedBookToRequest.distanceKm || 1.8} km away
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-300 font-semibold">Select a Book from Your Library to Offer</label>
              <select
                value={offeredBookId}
                onChange={(e) => setOfferedBookId(e.target.value)}
                required
                className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none font-medium"
              >
                <option value="">-- Choose Book to Offer --</option>
                {myBooks.map(b => (
                  <option key={b._id} value={b._id}>
                    {b.title} ({b.genre})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setExchangeModalOpen(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button type="submit" className="gold-gradient-bg text-black font-extrabold px-5 py-2.5 rounded-xl shadow-md">
                Send Swap Request
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default NearbyMapPage;
