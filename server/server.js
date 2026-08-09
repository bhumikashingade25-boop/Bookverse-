const express = require('express');
const http = require('http');
const socketModule = require('./socket');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load environment variables
dotenv.config();

const app = express();
const httpServer = http.createServer(app);
socketModule.init(httpServer);

const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'BookVerse REST API is running!',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Initialize Database & Routes
const initApp = async () => {
  try {
    await connectDB();

    // Attach API Routes
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/users', require('./routes/userRoutes'));
    app.use('/api/books', require('./routes/bookRoutes'));
    app.use('/api/exchanges', require('./routes/exchangeRoutes'));
    app.use('/api/chat', require('./routes/chatRoutes'));
    app.use('/api/posts', require('./routes/postRoutes'));
    app.use('/api/clubs', require('./routes/clubRoutes'));
    app.use('/api/recommendations', require('./routes/recommendationRoutes'));
    app.use('/api/notifications', require('./routes/notificationRoutes'));
    app.use('/api/admin', require('./routes/adminRoutes'));
    app.use('/api/wishlist', require('./routes/wishlistRoutes'));

    // Error handling middleware
    app.use(errorHandler);

    // Auto-seed demo data if empty
    const seedData = require('./seed/seedData');
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding initial demo dataset...');
      await seedData();
      console.log('Seeding finished!');
    }
  } catch (err) {
    console.error('App init error:', err);
  }
};

initApp();

httpServer.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 BookVerse Express Server running on port ${PORT}`);
  console.log(`📡 WebSocket server running`);
  console.log(`📖 API Health: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
