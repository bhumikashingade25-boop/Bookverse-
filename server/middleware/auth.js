const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  // Check Authorization Bearer Header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      if (token && token !== 'undefined' && token !== 'null') {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bookverse_hackathon_super_secret_key_2026');
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
          return next();
        }
      }
    } catch (error) {
      console.warn('JWT verification error:', error.message);
      return res.status(401).json({ success: false, message: 'Invalid or expired session token. Please log in again.' });
    }
  }

  return res.status(401).json({ success: false, message: 'Authentication required. Please log in to continue.' });
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Administrator authorization required' });
  }
};

module.exports = { protect, adminOnly };
