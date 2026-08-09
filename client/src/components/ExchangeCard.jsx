import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightLeft, MessageCircle, CheckCircle2, XCircle, PackageCheck } from 'lucide-react';
import { acceptExchangeApi, rejectExchangeApi, completeExchangeApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const ExchangeCard = ({ exchange, isReceived, onUpdate }) => {
  const { showToast } = useToast();

  const handleAccept = async () => {
    try {
      const res = await acceptExchangeApi(exchange._id);
      if (res.data.success) {
        showToast('Exchange Accepted! Chat enabled 🎉');
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      showToast(err.message || 'Error accepting exchange', 'error');
    }
  };

  const handleReject = async () => {
    try {
      const res = await rejectExchangeApi(exchange._id);
      if (res.data.success) {
        showToast('Exchange declined.');
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      showToast(err.message || 'Error rejecting exchange', 'error');
    }
  };

  const handleConfirmReceipt = async () => {
    try {
      const res = await completeExchangeApi(exchange._id);
      if (res.data.success) {
        showToast('Receipt confirmed! 🏆');
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      showToast(err.message || 'Error confirming receipt', 'error');
    }
  };

  const otherUser = isReceived ? exchange.requester : exchange.recipient;
  const statusColors = {
    REQUESTED: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    ACCEPTED: 'bg-gold-500/20 text-gold-300 border-gold-500/40',
    REJECTED: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    ADDRESS_SHARED: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    COMPLETED: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
  };

  return (
    <div className="bg-[#15171E] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={otherUser?.avatar} alt={otherUser?.name} className="w-10 h-10 rounded-full object-cover border border-gold-500/40" />
          <div>
            <h4 className="font-bold text-sm text-white">{otherUser?.name}</h4>
            <p className="text-xs text-gray-400">{isReceived ? 'Wants to exchange with you' : 'You sent a request to this reader'}</p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${statusColors[exchange.status] || statusColors.REQUESTED}`}>
          {exchange.status.replace('_', ' ')}
        </span>
      </div>

      {/* Books Swap Graphic */}
      <div className="grid grid-cols-2 gap-3 bg-[#1F2430]/60 border border-white/10 rounded-xl p-3 items-center relative">
        <div className="text-center space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Requested Book</span>
          <img src={exchange.requestedBook?.coverUrl} alt="" className="w-16 h-24 object-cover rounded-lg mx-auto shadow-md" />
          <p className="font-bold text-xs text-white truncate">{exchange.requestedBook?.title}</p>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full gold-gradient-bg text-black font-bold flex items-center justify-center shadow-lg">
          <ArrowRightLeft className="w-4 h-4" />
        </div>

        <div className="text-center space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Offered Book</span>
          <img src={exchange.offeredBook?.coverUrl} alt="" className="w-16 h-24 object-cover rounded-lg mx-auto shadow-md" />
          <p className="font-bold text-xs text-white truncate">{exchange.offeredBook?.title}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10 gap-2">
        {exchange.status === 'REQUESTED' && isReceived && (
          <div className="flex gap-2 w-full">
            <button
              onClick={handleAccept}
              className="flex-1 flex items-center justify-center gap-1.5 gold-gradient-bg text-black font-bold py-2 rounded-xl text-xs transition shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Accept Request</span>
            </button>
            <button
              onClick={handleReject}
              className="flex-1 flex items-center justify-center gap-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-bold py-2 rounded-xl text-xs border border-rose-500/40 transition"
            >
              <XCircle className="w-4 h-4" />
              <span>Decline</span>
            </button>
          </div>
        )}

        {(exchange.status === 'ACCEPTED' || exchange.status === 'ADDRESS_SHARED') && (
          <div className="flex gap-2 w-full">
            <Link
              to={`/chat/${exchange._id}`}
              className="flex-1 flex items-center justify-center gap-1.5 bg-gold-500 hover:bg-gold-400 text-black font-bold py-2 rounded-xl text-xs transition shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Open Chat</span>
            </Link>

            <button
              onClick={handleConfirmReceipt}
              className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-bold py-2 rounded-xl text-xs border border-amber-500/40 transition"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Confirm Received</span>
            </button>
          </div>
        )}

        {exchange.status === 'COMPLETED' && (
          <div className="w-full text-center text-xs text-gold-400 font-bold py-1.5 bg-gold-500/10 rounded-xl border border-gold-500/30">
            ✓ Exchange Completed Successfully!
          </div>
        )}
      </div>
    </div>
  );

};

export default ExchangeCard;
