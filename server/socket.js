const { Server } = require('socket.io');

let io;
// Map to keep track of userId -> socketId
const userSocketMap = new Map();

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: true,
        credentials: true
      }
    });

    io.on('connection', (socket) => {
      console.log('New Socket connected:', socket.id);

      // Client sends identify event after login
      socket.on('identify', (userId) => {
        if (userId) {
          userSocketMap.set(userId.toString(), socket.id);
          console.log(`User ${userId} identified with socket ${socket.id}`);
        }
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
        // Find and remove the user mapping
        for (const [userId, sId] of userSocketMap.entries()) {
          if (sId === socket.id) {
            userSocketMap.delete(userId);
            console.log(`User ${userId} disconnected.`);
            break;
          }
        }
      });
    });

    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error('Socket.io is not initialized!');
    }
    return io;
  },
  getSocketIdForUser: (userId) => {
    if (!userId) return null;
    return userSocketMap.get(userId.toString());
  },
  sendNotificationToUser: (userId, payload) => {
    if (!io) return;
    const socketId = userSocketMap.get(userId?.toString());
    if (socketId) {
      io.to(socketId).emit('NEW_NOTIFICATION', payload);
    }
  }
};
