import React, { useState, useEffect, useRef } from 'react';
import { Send, MapPin, CheckCircle, Info, Lock } from 'lucide-react';
import { getMessagesApi, sendMessageApi, completeExchangeApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ChatWindow = ({ exchangeId }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [exchange, setExchange] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchChatData = async () => {
    try {
      const res = await getMessagesApi(exchangeId);
      if (res.data.success) {
        setExchange(res.data.exchange);
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.log('Chat fetch error:', err.message);
    }
  };

  useEffect(() => {
    fetchChatData();
    const interval = setInterval(fetchChatData, 3000); // Near real-time polling
    return () => clearInterval(interval);
  }, [exchangeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const res = await sendMessageApi({
        exchangeId,
        content: inputText
      });
      if (res.data.success) {
        setMessages(prev => [...prev, res.data.message]);
        setInputText('');
      }
    } catch (err) {
      showToast('Error sending message', 'error');
    }
  };

  const handleShareAddress = async () => {
    if (!addressInput.trim()) return;
    try {
      const res = await sendMessageApi({
        exchangeId,
        content: `📍 Shared Meetup / Shipping Address: "${addressInput}"`,
        sharedAddress: addressInput
      });
      if (res.data.success) {
        setMessages(prev => [...prev, res.data.message]);
        setAddressInput('');
        setShowAddressModal(false);
        showToast('Address shared with partner!');
        fetchChatData();
      }
    } catch (err) {
      showToast('Error sharing address', 'error');
    }
  };

  const handleComplete = async () => {
    try {
      const res = await completeExchangeApi(exchangeId);
      if (res.data.success) {
        showToast('You confirmed receipt of the book! 🏆');
        fetchChatData();
      }
    } catch (err) {
      showToast('Error completing exchange', 'error');
    }
  };

  if (!exchange) {
    return <div className="p-8 text-center text-gray-400">Loading conversation...</div>;
  }

  const partner = exchange.requester?._id === user?._id ? exchange.recipient : exchange.requester;

  return (
    <div className="flex flex-col h-[75vh] bg-[#15171E] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      {/* Top Bar Header */}
      <div className="p-4 bg-[#1F2430] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={partner?.avatar} alt={partner?.name} className="w-10 h-10 rounded-full object-cover border border-gold-500/40" />
          <div>
            <h3 className="font-bold text-sm text-white">{partner?.name}</h3>
            <p className="text-xs text-gold-400">Exchanging: {exchange.requestedBook?.title} ↔ {exchange.offeredBook?.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddressModal(true)}
            className="flex items-center gap-1.5 bg-[#15171E] hover:bg-gold-500 hover:text-black text-gray-300 text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/10 transition"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share Meetup Spot</span>
          </button>

          <button
            onClick={handleComplete}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold px-3 py-1.5 rounded-xl transition"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Confirm Received</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0B0C10]/40">
        {messages.map((msg) => {
          if (msg.isSystemMessage) {
            return (
              <div key={msg._id} className="my-3 flex items-center justify-center">
                <div className="bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs px-4 py-2 rounded-full text-center max-w-md flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{msg.content}</span>
                </div>
              </div>
            );
          }

          const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;

          return (
            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md p-3.5 rounded-2xl text-xs space-y-1 shadow-md ${
                isMe
                  ? 'bg-gold-500 text-black rounded-tr-none font-medium'
                  : 'bg-[#1F2430] text-gray-100 rounded-tl-none border border-white/10'
              }`}>
                <p>{msg.content}</p>
                <span className={`block text-[10px] text-right ${isMe ? 'text-black/60' : 'text-gray-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Footer */}
      <form onSubmit={handleSend} className="p-3 bg-[#1F2430] border-t border-white/10 flex items-center gap-2">
        <input
          type="text"
          placeholder="Type message to agree on exchange pickup/delivery..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-[#15171E] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-gold-500/50"
        />
        <button
          type="submit"
          className="w-10 h-10 rounded-xl gold-gradient-bg text-black font-bold flex items-center justify-center hover:opacity-90 transition shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Share Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#15171E] border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-gold-400">
              <Lock className="w-5 h-5" />
              <h3 className="font-serif font-bold text-lg text-white">Share Secure Location</h3>
            </div>
            <p className="text-xs text-gray-400">
              Your exact address is only visible inside this private exchange chat. We recommend meeting at public places like local cafes or metro stations.
            </p>
            <textarea
              rows="3"
              placeholder="e.g. Starbuck’s Cafe, Bandra West or Flat 402, Sunshine Towers..."
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              className="w-full bg-[#1F2430] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-gold-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddressModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleShareAddress}
                className="bg-gold-500 text-black font-bold px-4 py-2 rounded-xl text-xs hover:bg-gold-400"
              >
                Share in Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
