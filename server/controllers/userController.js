const User = require('../models/User');
const Follow = require('../models/Follow');
const Book = require('../models/Book');
const Post = require('../models/Post');
const Achievement = require('../models/Achievement');
const Notification = require('../models/Notification');
const ConnectionRequest = require('../models/ConnectionRequest');

// Get User Profile with Stats & Collections
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const books = await Book.find({ owner: user._id });
    const posts = await Post.find({ author: user._id }).sort({ createdAt: -1 });
    const achievements = await Achievement.find({ user: user._id });

    // Check if current logged in user follows this user
    let isFollowing = false;
    let connectionStatus = 'NONE';

    if (req.user) {
      const currentUserId = (req.user._id || req.user.id || req.user).toString();
      const targetUserId = user._id.toString();

      const followDoc = await Follow.findOne({ follower: currentUserId, following: targetUserId });
      if (followDoc) isFollowing = true;

      const reqDoc = await ConnectionRequest.findOne({
        $or: [
          { sender: currentUserId, recipient: targetUserId },
          { sender: targetUserId, recipient: currentUserId }
        ]
      });

      if (reqDoc) {
        if (reqDoc.status === 'ACCEPTED') {
          connectionStatus = 'CONNECTED';
        } else if (reqDoc.status === 'PENDING') {
          connectionStatus = reqDoc.sender.toString() === currentUserId ? 'PENDING' : 'RECEIVED';
        }
      }
    }

    res.json({
      success: true,
      user,
      books,
      posts,
      achievements,
      isFollowing,
      connectionStatus
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update User Profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, bio, avatar, favoriteGenres, favoriteAuthors, location, readingGoal } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (avatar) user.avatar = avatar;
    if (favoriteGenres) user.favoriteGenres = favoriteGenres;
    if (favoriteAuthors) user.favoriteAuthors = favoriteAuthors;
    if (location) user.location = location;
    if (readingGoal) user.readingGoal = readingGoal;

    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send Connection Request (LinkedIn Style)
exports.sendConnectionRequest = async (req, res) => {
  try {
    const recipientId = req.params.id;
    const currentUserId = (req.user?._id || req.user?.id || req.user).toString();

    if (recipientId === currentUserId) {
      return res.status(400).json({ success: false, message: 'You cannot connect with yourself' });
    }

    const targetUser = await User.findById(recipientId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Target user not found' });
    }

    // Check existing request in either direction
    let existing = await ConnectionRequest.findOne({
      $or: [
        { sender: currentUserId, recipient: recipientId },
        { sender: recipientId, recipient: currentUserId }
      ]
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        return res.json({ success: true, status: 'CONNECTED', message: 'Already connected' });
      }
      existing.status = 'PENDING';
      existing.sender = currentUserId;
      existing.recipient = recipientId;
      await existing.save();
    } else {
      existing = await ConnectionRequest.create({
        sender: currentUserId,
        recipient: recipientId,
        status: 'PENDING'
      });
    }

    // Create Notification for the Recipient
    await Notification.create({
      recipient: recipientId,
      sender: currentUserId,
      type: 'CONNECTION_REQUEST',
      title: 'New Connection Request! 🤝',
      message: `${req.user.name} sent you a connection request on BookVerse.`,
      link: '/network',
      connectionRequestId: existing._id
    });

    res.json({
      success: true,
      status: 'PENDING',
      message: `Connection request sent to ${targetUser.name}!`,
      request: existing
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Accept Connection Request
exports.acceptConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentUserId = (req.user?._id || req.user?.id || req.user).toString();
    const request = await ConnectionRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Connection request not found' });
    }

    const recipientId = (request.recipient?._id || request.recipient).toString();
    const senderId = (request.sender?._id || request.sender).toString();

    if (recipientId !== currentUserId) {
      return res.status(403).json({ success: false, message: 'Not authorized to accept this request' });
    }

    request.status = 'ACCEPTED';
    await request.save();

    // Mutual Follow
    try {
      const f1 = await Follow.findOne({ follower: senderId, following: recipientId });
      if (!f1) await Follow.create({ follower: senderId, following: recipientId });
    } catch (e) {}

    try {
      const f2 = await Follow.findOne({ follower: recipientId, following: senderId });
      if (!f2) await Follow.create({ follower: recipientId, following: senderId });
    } catch (e) {}

    // Update connection counts
    try {
      await User.findByIdAndUpdate(senderId, { $inc: { followersCount: 1 } });
      await User.findByIdAndUpdate(recipientId, { $inc: { followersCount: 1 } });
    } catch (e) {}

    // Notify the original sender
    await Notification.create({
      recipient: senderId,
      sender: currentUserId,
      type: 'CONNECTION_ACCEPTED',
      title: 'Connection Accepted! 🎉',
      message: `${req.user.name} accepted your connection request. You are now connected!`,
      link: `/profile/${currentUserId}`
    });

    // Mark any existing request notification as read
    try {
      const notif = await Notification.findOne({ connectionRequestId: requestId });
      if (notif) {
        notif.read = true;
        await notif.save();
      }
    } catch (e) {}

    res.json({
      success: true,
      status: 'CONNECTED',
      message: 'Connection request accepted successfully! 🎉'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Decline / Delete Connection Request
exports.declineConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentUserId = (req.user?._id || req.user?.id || req.user).toString();
    const request = await ConnectionRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Connection request not found' });
    }

    const recipientId = (request.recipient?._id || request.recipient).toString();
    const senderId = (request.sender?._id || request.sender).toString();

    if (recipientId !== currentUserId && senderId !== currentUserId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    try {
      await ConnectionRequest.findByIdAndDelete(requestId);
    } catch (e) {}

    try {
      const notif = await Notification.findOne({ connectionRequestId: requestId });
      if (notif) {
        await Notification.findByIdAndDelete(notif._id);
      }
    } catch (e) {}

    res.json({
      success: true,
      status: 'DELETED',
      message: 'Connection request deleted.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Pending Requests & Connection Map for current user
exports.getConnectionNetwork = async (req, res) => {
  try {
    const currentUserId = (req.user?._id || req.user?.id || req.user).toString();

    // Incoming Pending Requests
    const pendingIncoming = await ConnectionRequest.find({
      recipient: currentUserId,
      status: 'PENDING'
    }).populate('sender', 'name email avatar bio location favoriteGenres streakDays totalBooksRead');

    // All active connection requests (for mapping status on user cards)
    const allUserRequests = await ConnectionRequest.find({
      $or: [{ sender: currentUserId }, { recipient: currentUserId }]
    });

    const statusMap = {};
    allUserRequests.forEach(r => {
      const sId = (r.sender?._id || r.sender).toString();
      const rId = (r.recipient?._id || r.recipient).toString();

      if (sId === currentUserId) {
        statusMap[rId] = r.status; // 'PENDING' or 'ACCEPTED'
      } else {
        statusMap[sId] = r.status === 'PENDING' ? 'RECEIVED' : r.status;
      }
    });

    res.json({
      success: true,
      pendingIncoming,
      statusMap
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Follow User
exports.followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = (req.user?._id || req.user?.id || req.user).toString();

    if (targetUserId === currentUserId) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const existingFollow = await Follow.findOne({ follower: currentUserId, following: targetUserId });
    if (existingFollow) {
      return res.status(400).json({ success: false, message: 'Already following user' });
    }

    await Follow.create({ follower: currentUserId, following: targetUserId });
    await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: 1 } });
    await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: 1 } });

    // Send notification to target user
    await Notification.create({
      recipient: targetUserId,
      sender: currentUserId,
      type: 'NEW_FOLLOWER',
      title: 'New Follower!',
      message: `${req.user.name} started following your reading profile.`,
      link: `/profile/${currentUserId}`
    });

    res.json({ success: true, message: 'Followed user successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Unfollow User
exports.unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = (req.user?._id || req.user?.id || req.user).toString();

    const deleted = await Follow.findOneAndDelete({ follower: currentUserId, following: targetUserId });
    if (deleted) {
      await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: -1 } });
      await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: -1 } });
    }

    // Also remove connection request if any
    await ConnectionRequest.findOneAndDelete({
      $or: [
        { sender: currentUserId, recipient: targetUserId },
        { sender: targetUserId, recipient: currentUserId }
      ]
    });

    res.json({ success: true, message: 'Unfollowed user successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all users (for discovery/map)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
