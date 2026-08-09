import React, { useState, useEffect } from 'react';
import { MapPin, Filter, BookOpen, User, Navigation, ArrowRight, Crosshair, CheckCircle2, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';

const MapView = ({ books = [], users = [], onSelectBook }) => {
  const { showToast } = useToast();
  const [selectedItem, setSelectedItem] = useState(null);
  const [radiusFilter, setRadiusFilter] = useState(15);
  const [genreFilter, setGenreFilter] = useState('All');
  
  // Live GPS Location State
  const [userLocationName, setUserLocationName] = useState('Mumbai Central (Default)');
  const [userCoordinates, setUserCoordinates] = useState([72.8777, 19.0760]);
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Enable Live GPS Location
  const handleEnableGPS = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    setGpsLoading(true);
    showToast('Detecting your live GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoordinates([longitude, latitude]);
        setUserLocationName(`Your Live GPS (${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°)`);
        setGpsActive(true);
        setGpsLoading(false);
        showToast('📍 Live GPS Location Activated! Radar centered on your position. 🎉');
      },
      (error) => {
        setGpsLoading(false);
        console.warn('GPS Error:', error.message);
        showToast('Could not access live GPS. Using City Mode.', 'info');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Filter books within radius
  const filteredBooks = books.filter(b => {
    const distMatch = (b.distanceKm || 2.5) <= radiusFilter;
    const genreMatch = genreFilter === 'All' || b.genre === genreFilter;
    return distMatch && genreMatch;
  });

  return (
    <div className="relative w-full h-[650px] bg-[#0B0C10] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
      
      {/* Map Control & Live GPS Bar Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 bg-[#15171E]/95 backdrop-blur-md p-3 rounded-2xl border border-gold-500/30 shadow-xl">
        
        {/* Left: GPS Status & Enable Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleEnableGPS}
            disabled={gpsLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-md ${
              gpsActive
                ? 'gold-gradient-bg text-black border border-gold-500/50'
                : 'bg-[#1F2430] hover:bg-gold-500 hover:text-black text-gold-300 border border-gold-500/30'
            }`}
          >
            <Crosshair className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
            <span>{gpsActive ? '📍 Live GPS Active' : '📍 Enable My Live GPS Location'}</span>
          </button>

          <span className="hidden sm:inline text-[11px] text-gray-300 font-medium truncate max-w-[200px]">
            {userLocationName}
          </span>
        </div>

        {/* Right: Radius & Genre Filters */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-[#1F2430] px-3 py-1.5 rounded-xl border border-white/10">
            <Filter className="w-3.5 h-3.5 text-gold-400" />
            <span className="text-gray-400">Radius:</span>
            <select
              value={radiusFilter}
              onChange={(e) => setRadiusFilter(Number(e.target.value))}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              <option value={5} className="bg-[#15171E]">5 km</option>
              <option value={10} className="bg-[#15171E]">10 km</option>
              <option value={15} className="bg-[#15171E]">15 km</option>
              <option value={30} className="bg-[#15171E]">30 km</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#1F2430] px-3 py-1.5 rounded-xl border border-white/10">
            <span className="text-gray-400">Genre:</span>
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              <option value="All" className="bg-[#15171E]">All Genres</option>
              <option value="Sci-Fi" className="bg-[#15171E]">Sci-Fi</option>
              <option value="Fiction" className="bg-[#15171E]">Fiction</option>
              <option value="Self-Improvement" className="bg-[#15171E]">Self-Improvement</option>
              <option value="Thriller" className="bg-[#15171E]">Thriller</option>
              <option value="Fantasy" className="bg-[#15171E]">Fantasy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Styled Interactive SVG City Map Surface */}
      <div className="relative flex-1 bg-gradient-to-br from-[#0F1117] via-[#151821] to-[#0B0C10] overflow-hidden flex items-center justify-center">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f243020_1px,transparent_1px),linear-gradient(to_bottom,#1f243020_1px,transparent_1px)] bg-[size:36px_36px]" />
        
        {/* Radial Radar Pulse Rings */}
        <div className="absolute w-[480px] h-[480px] rounded-full border border-gold-500/20 animate-ping opacity-25 pointer-events-none" />
        <div className="absolute w-[320px] h-[320px] rounded-full border border-gold-500/30 opacity-40 pointer-events-none" />
        <div className="absolute w-[180px] h-[180px] rounded-full border border-amber-500/40 opacity-60 pointer-events-none" />

        {/* Center User Location Pin */}
        <div className="absolute z-10 flex flex-col items-center">
          <div className="w-6 h-6 rounded-full bg-gold-400 border-2 border-black flex items-center justify-center shadow-xl shadow-gold-500/60 animate-bounce">
            <div className="w-2.5 h-2.5 rounded-full bg-black" />
          </div>
          <span className="bg-black/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-gold-300 font-bold mt-1.5 border border-gold-500/40 shadow-lg">
            {gpsActive ? '📍 Your Live Position' : '📍 You (Center Point)'}
          </span>
        </div>

        {/* Interactive Reader Pins Scatter */}
        {filteredBooks.map((book, idx) => {
          const angle = (idx / (filteredBooks.length || 1)) * 2 * Math.PI;
          const distanceOffset = 90 + (idx % 3) * 65;
          const leftOffset = Math.cos(angle) * distanceOffset;
          const topOffset = Math.sin(angle) * distanceOffset;

          return (
            <motion.button
              key={book._id}
              onClick={() => setSelectedItem(book)}
              whileHover={{ scale: 1.25, zIndex: 40 }}
              style={{
                transform: `translate(${leftOffset}px, ${topOffset}px)`
              }}
              className="absolute z-10 group flex flex-col items-center cursor-pointer transition-transform"
            >
              <div className="relative">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-10 h-14 object-cover rounded-lg border-2 border-gold-500 shadow-2xl group-hover:border-amber-400"
                />
                <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-gold-500 text-black font-extrabold text-[9px] shadow">
                  {book.distanceKm || 1.8}km
                </span>
              </div>
              <span className="bg-[#15171E]/95 text-white font-semibold text-[10px] px-2 py-0.5 rounded-md mt-1 border border-white/10 shadow-md truncate max-w-[100px]">
                {book.title}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Selected Item Drawer Popup */}
      {selectedItem && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-4 left-4 right-4 z-30 bg-[#15171E] border border-gold-500/40 rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <img src={selectedItem.coverUrl} alt="" className="w-12 h-16 object-cover rounded-lg shadow-md shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-gold-400 uppercase tracking-wider">{selectedItem.genre}</span>
              <h4 className="font-bold text-sm text-white">{selectedItem.title}</h4>
              <p className="text-xs text-gray-400">
                Owner: <span className="text-white font-medium">{selectedItem.owner?.name || 'Nearby Reader'}</span> • 📍 {selectedItem.distanceKm || 2.1} km from your location
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (onSelectBook) onSelectBook(selectedItem);
            }}
            className="flex items-center justify-center gap-1.5 gold-gradient-bg text-black font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md hover:opacity-95 transition shrink-0"
          >
            <span>Request Physical Exchange</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default MapView;
