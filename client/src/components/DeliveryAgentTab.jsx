import React, { useState } from 'react';
import { 
  Bike, Zap, ShieldCheck, Clock, MapPin, Phone, Star, 
  CheckCircle2, ArrowRight, Sparkles, Navigation, PackageCheck, AlertCircle 
} from 'lucide-react';
import { MOCK_DELIVERY_AGENTS } from './GoogleMapView';
import { useToast } from '../context/ToastContext';
import Modal from './Modal';

const DeliveryAgentTab = ({ onDispatchAgent }) => {
  const { showToast } = useToast();
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [pickupAddress, setPickupAddress] = useState('Bandra West Reader Library (Mumbai)');
  const [deliveryAddress, setDeliveryAddress] = useState('My Current Location (GPS Verified)');
  const [bookTitle, setBookTitle] = useState('Sapiens: A Brief History of Humankind');
  const [dispatchStatus, setDispatchStatus] = useState('IDLE'); // IDLE, DISPATCHED, IN_TRANSIT, DELIVERED

  const handleStartBooking = (agent) => {
    setSelectedAgent(agent);
    setDispatchStatus('IDLE');
    setBookingModalOpen(true);
  };

  const handleConfirmDispatch = (e) => {
    e.preventDefault();
    setDispatchStatus('DISPATCHED');
    showToast(`🚀 ${selectedAgent.name} dispatched for pickup! ETA: ${selectedAgent.etaMinutes} mins.`);

    setTimeout(() => {
      setDispatchStatus('IN_TRANSIT');
      showToast(`🛵 ${selectedAgent.name} picked up "${bookTitle}" and is in transit to your address!`);
    }, 4000);

    setTimeout(() => {
      setDispatchStatus('DELIVERED');
      showToast(`🎉 Book delivered safely by ${selectedAgent.name}! Swap completed. 📖✨`);
    }, 9000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-[#15171E] via-[#1A1F2C] to-[#15171E] border border-gold-500/30 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-gold-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>BookVerse Express Doorstep Courier</span>
          </div>
          <h3 className="font-serif font-bold text-2xl text-white">Online Community Delivery Agents</h3>
          <p className="text-xs text-gray-300 mt-1 max-w-xl">
            Don't have time to travel for physical swaps? Book a verified neighborhood courier to collect the book from the owner and deliver it directly to your doorstep in minutes!
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-center">
            <p className="text-[10px] text-gray-400 uppercase font-bold">Avg. Pickup Time</p>
            <p className="text-base font-extrabold text-gold-400">⚡ 15 Mins</p>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <p className="text-[10px] text-gray-400 uppercase font-bold">Verified Riders</p>
            <p className="text-base font-extrabold text-emerald-400">100% Safe</p>
          </div>
        </div>
      </div>

      {/* Grid of Available Couriers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_DELIVERY_AGENTS.map((agent) => (
          <div
            key={agent.id}
            className="p-5 bg-[#15171E] hover:bg-[#1A1E29] border border-gold-500/20 hover:border-gold-500/50 rounded-3xl transition shadow-lg flex flex-col justify-between group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-gold-500/40 shadow-md"
                  />
                  <span className="absolute -bottom-1.5 -right-1.5 text-base bg-[#0B0C10] p-0.5 rounded-full shadow">
                    {agent.vehicleIcon}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white group-hover:text-gold-300 transition">{agent.name}</h4>
                    <span className="text-[9px] bg-gold-500/15 text-gold-300 font-extrabold px-2 py-0.5 rounded-full border border-gold-500/30">
                      {agent.tag}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mt-0.5">
                    {agent.vehicle} • 📍 {agent.currentLocationName}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-gray-300 mt-1">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {agent.rating} ({agent.reviews} deliveries)
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-gold-400 font-semibold">
                      <Clock className="w-3 h-3" />
                      {agent.etaMinutes} min ETA
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-gold-400">{agent.fee}</span>
                <p className="text-[10px] text-gray-400">{agent.distanceKm} km away</p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ID & Background Verified</span>
              </div>

              <button
                onClick={() => handleStartBooking(agent)}
                className="gold-gradient-bg hover:opacity-95 text-black font-extrabold text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition transform active:scale-95"
              >
                <span>Dispatch Courier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking & Live Dispatch Simulation Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title={dispatchStatus === 'IDLE' ? 'Book Express Courier Pickup' : 'Live Courier Dispatch Tracker'}
      >
        {selectedAgent && (
          <div className="space-y-4 text-xs">
            {dispatchStatus === 'IDLE' ? (
              <form onSubmit={handleConfirmDispatch} className="space-y-4">
                {/* Agent Summary */}
                <div className="p-3 bg-[#1F2430] border border-gold-500/30 rounded-2xl flex items-center gap-3">
                  <img src={selectedAgent.avatar} alt="" className="w-12 h-12 rounded-xl object-cover border border-gold-500/40" />
                  <div>
                    <span className="text-[10px] text-gold-400 font-bold uppercase">{selectedAgent.vehicle}</span>
                    <h4 className="font-bold text-sm text-white">{selectedAgent.name}</h4>
                    <p className="text-xs text-gray-400">⚡ {selectedAgent.etaMinutes} min ETA • Flat Fee: {selectedAgent.fee}</p>
                  </div>
                </div>

                {/* Pickup Details */}
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Book to Pick Up & Swap</label>
                  <input
                    type="text"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    required
                    className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none font-medium"
                    placeholder="Enter Book Title"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Pickup Address (Owner's Location)</label>
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    required
                    className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none font-medium"
                    placeholder="Owner's pickup point"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Drop-off Address (Your Doorstep)</label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                    className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-white outline-none font-medium"
                    placeholder="Your delivery address"
                  />
                </div>

                <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-between text-xs text-gold-300 font-bold">
                  <span>Total Delivery Fee:</span>
                  <span className="text-sm">{selectedAgent.fee}</span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingModalOpen(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="gold-gradient-bg text-black font-extrabold px-6 py-2.5 rounded-xl shadow-lg"
                  >
                    Confirm & Dispatch Now
                  </button>
                </div>
              </form>
            ) : (
              /* Live Tracker Progression */
              <div className="space-y-5 py-2">
                <div className="text-center space-y-1">
                  <div className="w-16 h-16 rounded-full gold-gradient-bg text-black mx-auto flex items-center justify-center text-3xl shadow-xl animate-bounce">
                    {selectedAgent.vehicleIcon}
                  </div>
                  <h4 className="font-bold text-base text-white">{selectedAgent.name}</h4>
                  <p className="text-xs text-gold-400 font-semibold">{selectedAgent.vehicle} • {selectedAgent.phone}</p>
                </div>

                {/* Progress Steps */}
                <div className="p-4 bg-[#1F2430] rounded-2xl space-y-3 border border-white/10">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold text-white text-xs">Courier Dispatched</p>
                      <p className="text-[10px] text-gray-400">Assigned {selectedAgent.name} • ETA 12 mins</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {dispatchStatus === 'IN_TRANSIT' || dispatchStatus === 'DELIVERED' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gold-400 border-t-transparent animate-spin shrink-0" />
                    )}
                    <div>
                      <p className="font-bold text-white text-xs">Book Collected from Owner</p>
                      <p className="text-[10px] text-gray-400">{pickupAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {dispatchStatus === 'DELIVERED' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-500 shrink-0" />
                    )}
                    <div>
                      <p className="font-bold text-white text-xs">Arriving at Your Doorstep</p>
                      <p className="text-[10px] text-gray-400">{deliveryAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setBookingModalOpen(false)}
                    className="gold-gradient-bg text-black font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-md"
                  >
                    Close & Keep Tracking
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DeliveryAgentTab;
