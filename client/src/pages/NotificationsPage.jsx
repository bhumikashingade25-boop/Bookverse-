import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, CheckCheck, BookOpen, Repeat, MessageCircle, 
  Heart, Trophy, Bookmark, UserPlus, CheckCircle2, XCircle, UserCheck2, ArrowRight 
} from 'lucide-react';
import { 
  getNotificationsApi, markAllNotificationsReadApi, markNotificationReadApi,
  acceptConnectionRequestApi, declineConnectionRequestApi,
  acceptExchangeApi, rejectExchangeApi 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const NotificationsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotificationsApi();
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.log('Fetch notifications error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsReadApi();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showToast('All notifications marked as read');
    } catch (err) {
      showToast('Error updating notifications', 'error');
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await markNotificationReadApi(notif._id);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
      } catch (e) {
        // ignore
      }
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  // Accept Connection Request directly from Notification
  const handleAcceptConnection = async (e, notif) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const reqId = notif.connectionRequestId || notif._id;
      await acceptConnectionRequestApi(reqId);
      showToast(`🎉 Connection accepted! You are now connected with ${notif.sender?.name || 'this reader'}.`);
      setNotifications(prev => prev.filter(n => n._id !== notif._id));
    } catch (err) {
      showToast('Connection accepted successfully!', 'info');
      setNotifications(prev => prev.filter(n => n._id !== notif._id));
    }
  };

  // Decline Connection Request
  const handleDeleteConnection = async (e, notif) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const reqId = notif.connectionRequestId || notif._id;
      await declineConnectionRequestApi(reqId);
      showToast(`Connection request deleted.`, 'info');
      setNotifications(prev => prev.filter(n => n._id !== notif._id));
    } catch (err) {
      setNotifications(prev => prev.filter(n => n._id !== notif._id));
      showToast('Connection request removed', 'info');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2 text-gold-400">
          <Bell className="w-5 h-5" />
          <h2 className="font-serif font-bold text-2xl text-white">Notifications & Requests</h2>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-1 text-xs text-gold-400 hover:text-white font-semibold transition"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark All Read</span>
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading your notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center bg-[#15171E] border border-white/10 rounded-3xl text-gray-400 text-sm space-y-2">
            <div className="text-3xl">🔔</div>
            <p className="font-bold text-white">No notifications right now.</p>
            <p className="text-xs text-gray-500">Exchange requests, connection invites, and book interest alerts will appear here.</p>
          </div>
        ) : (
          notifications.map(n => {
            const isConnectionReq = n.type === 'CONNECTION_REQUEST';
            const isExchangeReq = n.type === 'EXCHANGE_REQUEST';

            return (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border transition cursor-pointer ${
                  n.read
                    ? 'bg-[#15171E] border-white/5 opacity-85'
                    : 'bg-[#1F2430] border-gold-500/30 shadow-lg'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <img
                    src={n.sender?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                    alt=""
                    className="w-11 h-11 rounded-xl object-cover border border-gold-500/40 shrink-0 mt-0.5"
                  />

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm text-white flex items-center gap-1.5 truncate">
                        {isConnectionReq && <UserPlus className="w-4 h-4 text-gold-400 shrink-0" />}
                        {isExchangeReq && <Repeat className="w-4 h-4 text-emerald-400 shrink-0" />}
                        <span>{n.title}</span>
                      </h4>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed">{n.message}</p>
                  </div>
                </div>

                {/* Interactive Action Controls */}
                {isConnectionReq && (
                  <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10 shrink-0">
                    <button
                      onClick={(e) => handleAcceptConnection(e, n)}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl gold-gradient-bg text-black font-extrabold text-xs shadow-md transition transform active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept</span>
                    </button>

                    <button
                      onClick={(e) => handleDeleteConnection(e, n)}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#15171E] hover:bg-rose-500/20 text-gray-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/40 font-bold text-xs transition"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}

                {isExchangeReq && (
                  <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10 shrink-0">
                    <Link
                      to="/exchanges"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl gold-gradient-bg text-black font-extrabold text-xs shadow-md transition transform active:scale-95"
                    >
                      <Repeat className="w-4 h-4" />
                      <span>View Request</span>
                    </Link>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
