const { generateRecommendationsForUser } = require('../services/aiService');

exports.getRecommendations = async (req, res) => {
  try {
    const recommendations = await generateRecommendationsForUser(req.user);
    res.json({ success: true, count: recommendations.length, recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
