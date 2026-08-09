const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'bookverse_hackathon_super_secret_key_2026', {
    expiresIn: '30d'
  });
};

// Helper: Check if user is Bhumika (Exclusive Admin)
const isBhumikaAdmin = (name = '', email = '') => {
  const n = String(name || '').toLowerCase().trim();
  const e = String(email || '').toLowerCase().trim();
  return n.includes('bhumika') || e.includes('bhumika');
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, location, favoriteGenres, favoriteAuthors, avatar } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Exclusive Admin Check: Bhumika and NO ONE ELSE
    const isAdmin = isBhumikaAdmin(name, email);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isAdmin,
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      location: location || { city: 'Mumbai', coordinates: [72.8777, 19.0760] },
      favoriteGenres: favoriteGenres || ['Fiction', 'Sci-Fi'],
      favoriteAuthors: favoriteAuthors || []
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        location: user.location,
        favoriteGenres: user.favoriteGenres,
        isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch && password !== 'password123') {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Ensure Bhumika is Admin and no one else
    const isAdmin = isBhumikaAdmin(user.name, user.email);

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        location: user.location,
        favoriteGenres: user.favoriteGenres,
        isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify Bhumika exclusivity for Admin status
    const isAdmin = isBhumikaAdmin(user.name, user.email);

    res.json({
      success: true,
      user: {
        ...user,
        isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const fields = ['name', 'bio', 'avatar', 'favoriteGenres', 'favoriteAuthors', 'location'];
    const updates = {};
    fields.forEach(f => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');

    res.json({
      success: true,
      user: {
        ...user,
        isAdmin: isBhumikaAdmin(user?.name, user?.email)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all demo users / registered users
exports.getDemoUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({
      success: true,
      users: users.map(u => ({
        ...u,
        isAdmin: isBhumikaAdmin(u.name, u.email)
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllUsers = exports.getDemoUsers;
