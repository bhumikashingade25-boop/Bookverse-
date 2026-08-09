const Message = require('../models/Message');
const ExchangeRequest = require('../models/ExchangeRequest');
const Notification = require('../models/Notification');

// Get Messages for a specific Exchange Conversation
exports.getMessages = async (req, res) => {
  try {
    const { exchangeId } = req.params;

    const exchange = await ExchangeRequest.findById(exchangeId)
      .populate('requester', 'name avatar location')
      .populate('recipient', 'name avatar location')
      .populate('requestedBook')
      .populate('offeredBook');

    if (!exchange) {
      return res.status(404).json({ success: false, message: 'Exchange conversation not found' });
    }

    const messages = await Message.find({ exchangeRequest: exchangeId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    res.json({ success: true, exchange, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send Message
exports.sendMessage = async (req, res) => {
  try {
    const { exchangeId, content, sharedAddress } = req.body;

    const exchange = await ExchangeRequest.findById(exchangeId);
    if (!exchange) {
      return res.status(404).json({ success: false, message: 'Exchange conversation not found' });
    }

    const senderId = req.user._id.toString();
    const recipientId = exchange.requester.toString() === senderId ? exchange.recipient : exchange.requester;

    const message = await Message.create({
      exchangeRequest: exchangeId,
      sender: req.user._id,
      recipient: recipientId,
      content,
      sharedAddress: sharedAddress || ''
    });

    if (sharedAddress) {
      exchange.status = 'ADDRESS_SHARED';
      await exchange.save();
    }

    const populatedMsg = await Message.findById(message._id).populate('sender', 'name avatar');

    // Notify Recipient
    await Notification.create({
      recipient: recipientId,
      sender: req.user._id,
      type: 'NEW_MESSAGE',
      title: `Message from ${req.user.name}`,
      message: content.length > 40 ? content.substring(0, 40) + '...' : content,
      link: `/chat/${exchangeId}`
    });

    res.status(201).json({ success: true, message: populatedMsg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
