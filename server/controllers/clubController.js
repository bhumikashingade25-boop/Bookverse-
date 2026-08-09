const Club = require('../models/Club');
const ClubMember = require('../models/ClubMember');

// Get All Reading Clubs
exports.getClubs = async (req, res) => {
  try {
    const clubs = await Club.find();
    
    let joinedClubIds = [];
    if (req.user) {
      const userId = req.user._id || req.user.id;
      const memberships = await ClubMember.find({ user: userId });
      joinedClubIds = memberships.map(m => (m.club?._id ? m.club._id.toString() : m.club?.toString())).filter(Boolean);
    }

    res.json({ success: true, clubs, joinedClubIds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Club
exports.createClub = async (req, res) => {
  try {
    const { name, category, description, bannerUrl, featuredBookTitle, featuredBookAuthor, featuredBookCover } = req.body;

    if (!name || !description) {
      return res.status(400).json({ success: false, message: 'Please provide both club name and description' });
    }

    const userId = req.user ? (req.user._id || req.user.id) : '6a75ef4760c9c2c9ffed6e77';

    const club = await Club.create({
      name: name.trim(),
      category: category || 'Fiction',
      description: description.trim(),
      bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
      admin: userId,
      memberCount: 1,
      featuredBookTitle: featuredBookTitle || 'Dune',
      featuredBookAuthor: featuredBookAuthor || 'Frank Herbert',
      featuredBookCover: featuredBookCover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
    });

    try {
      await ClubMember.create({ club: club._id, user: userId });
    } catch (e) {
      // Non-blocking membership record
    }

    res.status(201).json({ success: true, club });
  } catch (error) {
    console.error('Club creation error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Join / Leave Club
exports.toggleJoinClub = async (req, res) => {
  try {
    const clubId = req.params.id;
    const userId = req.user ? (req.user._id || req.user.id) : '6a75ef4760c9c2c9ffed6e77';

    const existing = await ClubMember.findOne({ club: clubId, user: userId });

    if (existing) {
      await ClubMember.deleteMany({ club: clubId, user: userId });
      await Club.findByIdAndUpdate(clubId, { $inc: { memberCount: -1 } });
      res.json({ success: true, joined: false });
    } else {
      await ClubMember.create({ club: clubId, user: userId });
      await Club.findByIdAndUpdate(clubId, { $inc: { memberCount: 1 } });
      res.json({ success: true, joined: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
