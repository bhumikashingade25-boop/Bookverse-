import React, { useState, useEffect } from 'react';
import { Repeat, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import ExchangeCard from '../components/ExchangeCard';
import { getExchangesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ExchangeRequestsPage = () => {
  const { user } = useAuth();
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');

  const fetchExchanges = async () => {
    try {
      setLoading(true);
      const res = await getExchangesApi();
      if (res.data.success) {
        setReceived(res.data.received);
        setSent(res.data.sent);
      }
    } catch (err) {
      console.log('Fetch exchanges error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchExchanges();
  }, [user]);

  const activeList = activeTab === 'received' ? received : sent;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-gold-400">
            <Repeat className="w-5 h-5" />
            <h2 className="font-serif font-bold text-2xl text-white">Book Exchange Center</h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Manage your active exchange proposals and completed transactions.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 text-xs font-bold">
        <button
          onClick={() => setActiveTab('received')}
          className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition ${
            activeTab === 'received'
              ? 'border-gold-500 text-gold-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          <span>Received Requests ({received.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition ${
            activeTab === 'sent'
              ? 'border-gold-500 text-gold-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 text-amber-400" />
          <span>Sent Requests ({sent.length})</span>
        </button>
      </div>

      {/* Exchange List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading exchange transactions...</div>
        ) : activeList.length === 0 ? (
          <div className="p-12 text-center glass-panel rounded-3xl text-gray-400 text-sm">
            No {activeTab} exchange requests found.
          </div>
        ) : (
          activeList.map(item => (
            <ExchangeCard
              key={item._id}
              exchange={item}
              isReceived={activeTab === 'received'}
              onUpdate={fetchExchanges}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ExchangeRequestsPage;
