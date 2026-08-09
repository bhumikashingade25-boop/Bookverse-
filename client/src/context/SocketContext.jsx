import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize unread count with a custom setter if needed
  const updateUnreadCount = (count) => {
    setUnreadCount(count);
  };

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect to the WebSocket server
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('Connected to real-time WebSocket');
      newSocket.emit('identify', user._id || user.id);
    });

    // Listen for real-time notifications
    newSocket.on('NEW_NOTIFICATION', (notification) => {
      setUnreadCount((prev) => prev + 1);
      
      let message = notification.title || 'You have a new notification!';
      if (notification.type === 'NEW_FOLLOWER') {
        message = `🎉 ${notification.sender?.name || 'Someone'} started following you!`;
      } else if (notification.type === 'CONNECTION_REQUEST') {
        message = `🤝 ${notification.sender?.name || 'Someone'} sent a connection request!`;
      } else if (notification.type === 'CONNECTION_ACCEPTED') {
        message = `🎉 ${notification.sender?.name || 'Someone'} accepted your connection request!`;
      }
      
      showToast(message, 'info');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]); // Re-run if user changes

  return (
    <SocketContext.Provider value={{ socket, unreadCount, updateUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
};
