const ExchangeRequest = require('../models/ExchangeRequest');
const ExchangeTransaction = require('../models/ExchangeTransaction');
const Book = require('../models/Book');
const User = require('../models/User');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Achievement = require('../models/Achievement');
const { triggerN8nWorkflow } = require('../services/n8nService');

// Get user exchange requests (Received and Sent)
exports.getExchanges = async (req, res) => {
  try {
    const received = await ExchangeRequest.find({ recipient: req.user._id })
      .populate('requester', 'name avatar location')
      .populate('requestedBook')
      .populate('offeredBook')
      .sort({ updatedAt: -1 });

    const sent = await ExchangeRequest.find({ requester: req.user._id })
      .populate('recipient', 'name avatar location')
      .populate('requestedBook')
      .populate('offeredBook')
      .sort({ updatedAt: -1 });

    res.json({ success: true, received, sent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create / Express Interest in an Exchange Request
exports.createExchangeRequest = async (req, res) => {
  try {
    const { requestedBookId, offeredBookId, notes, exchangeMethod } = req.body;

    const requestedBook = await Book.findById(requestedBookId);
    if (!requestedBook) {
      return res.status(404).json({ success: false, message: 'Requested book not found' });
    }

    if (requestedBook.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot request an exchange for your own book' });
    }

    let offeredBook = null;
    if (offeredBookId) {
      offeredBook = await Book.findById(offeredBookId);
      if (offeredBook && offeredBook.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You must offer a book from your own library' });
      }
    }

    // Fallback: If no offeredBookId specified, check if user has an available book, else use requestedBook as reference
    if (!offeredBook) {
      const userBook = await Book.findOne({ owner: req.user._id });
      offeredBook = userBook || requestedBook;
    }

    const exchangeRequest = await ExchangeRequest.create({
      requester: req.user._id,
      recipient: requestedBook.owner,
      requestedBook: requestedBook._id,
      offeredBook: offeredBook._id,
      exchangeMethod: exchangeMethod || 'PHYSICAL_MEET',
      notes: notes || '',
      status: 'REQUESTED'
    });

    // Send Notification to Owner of Book
    const message = offeredBook && offeredBook._id.toString() !== requestedBook._id.toString()
      ? `${req.user.name} is interested in exchanging for your book "${requestedBook.title}" (Offering: "${offeredBook.title}").`
      : `${req.user.name} is interested in exchanging for your book "${requestedBook.title}".`;

    await Notification.create({
      recipient: requestedBook.owner,
      sender: req.user._id,
      type: 'EXCHANGE_REQUEST',
      title: 'New Book Exchange Interest! 📖',
      message,
      link: `/exchanges`
    });

    // Trigger n8n Automation
    await triggerN8nWorkflow('EXCHANGE_REQUESTED', {
      requestId: exchangeRequest._id,
      requester: req.user.name,
      requestedBook: requestedBook.title
    });

    res.status(201).json({ success: true, exchangeRequest, message: 'Exchange interest sent to owner!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Express Interest Direct Shortcut
exports.expressInterest = async (req, res) => {
  try {
    const { bookId } = req.params;
    const requestedBook = await Book.findById(bookId);

    if (!requestedBook) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (requestedBook.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot request your own book' });
    }

    // Find any book owned by requester to offer, or fallback to requested book
    const userBook = await Book.findOne({ owner: req.user._id });
    const offeredBook = userBook || requestedBook;

    const exchangeRequest = await ExchangeRequest.create({
      requester: req.user._id,
      recipient: requestedBook.owner,
      requestedBook: requestedBook._id,
      offeredBook: offeredBook._id,
      status: 'REQUESTED'
    });

    // Notify Book Owner
    await Notification.create({
      recipient: requestedBook.owner,
      sender: req.user._id,
      type: 'EXCHANGE_REQUEST',
      title: 'Reader Interested in Your Book! 📚',
      message: `${req.user.name} is interested in exchanging for your book "${requestedBook.title}".`,
      link: '/exchanges'
    });

    res.json({
      success: true,
      message: `Interest sent to ${requestedBook.owner?.name || 'the owner'}! They have been notified.`,
      exchangeRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Accept Exchange Request
exports.acceptExchangeRequest = async (req, res) => {
  try {
    const exchange = await ExchangeRequest.findById(req.params.id)
      .populate('requestedBook')
      .populate('offeredBook')
      .populate('requester', 'name email')
      .populate('recipient', 'name email');

    if (!exchange) {
      return res.status(404).json({ success: false, message: 'Exchange request not found' });
    }

    const recipientId = (exchange.recipient?._id || exchange.recipient).toString();
    const requesterId = (exchange.requester?._id || exchange.requester).toString();
    const currentUserId = (req.user?._id || req.user?.id || req.user).toString();

    if (recipientId !== currentUserId) {
      return res.status(403).json({ success: false, message: 'Not authorized to accept this exchange' });
    }

    exchange.status = 'ACCEPTED';
    await exchange.save();

    // Mark books as PENDING_EXCHANGE
    if (exchange.requestedBook?._id) {
      await Book.findByIdAndUpdate(exchange.requestedBook._id, { status: 'PENDING_EXCHANGE' });
    }
    if (exchange.offeredBook?._id) {
      await Book.findByIdAndUpdate(exchange.offeredBook._id, { status: 'PENDING_EXCHANGE' });
    }

    // Create System Message to initialize Chat
    await Message.create({
      exchangeRequest: exchange._id,
      sender: req.user._id,
      recipient: requesterId,
      content: `Exchange request accepted! Chat is now enabled. Coordinates and meet-up details can be shared securely here.`,
      isSystemMessage: true
    });

    // Notify Requester (User A)
    await Notification.create({
      recipient: requesterId,
      sender: req.user._id,
      type: 'EXCHANGE_ACCEPTED',
      title: 'Exchange Request Accepted! 🎉',
      message: `Your exchange request for "${exchange.requestedBook?.title || 'the book'}" was accepted by ${req.user.name}.`,
      link: `/chat/${exchange._id}`
    });

    await triggerN8nWorkflow('EXCHANGE_ACCEPTED', { requestId: exchange._id });

    res.json({ success: true, exchange });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject Exchange Request
exports.rejectExchangeRequest = async (req, res) => {
  try {
    const exchange = await ExchangeRequest.findById(req.params.id).populate('requestedBook');
    if (!exchange) {
      return res.status(404).json({ success: false, message: 'Exchange request not found' });
    }

    const recipientId = (exchange.recipient?._id || exchange.recipient).toString();
    const requesterId = (exchange.requester?._id || exchange.requester).toString();
    const currentUserId = (req.user?._id || req.user?.id || req.user).toString();

    if (recipientId !== currentUserId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    exchange.status = 'REJECTED';
    await exchange.save();

    // Notify Requester (User A)
    await Notification.create({
      recipient: requesterId,
      sender: req.user._id,
      type: 'EXCHANGE_REJECTED',
      title: 'Exchange Request Declined',
      message: `Your exchange request for "${exchange.requestedBook?.title || 'the book'}" was rejected.`,
      link: '/exchanges'
    });

    res.json({ success: true, exchange });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete Exchange (Confirm Receipt by User)
exports.completeExchangeRequest = async (req, res) => {
  try {
    const exchange = await ExchangeRequest.findById(req.params.id)
      .populate('requestedBook')
      .populate('offeredBook');

    if (!exchange) {
      return res.status(404).json({ success: false, message: 'Exchange request not found' });
    }

    const userIdStr = req.user._id.toString();
    const requesterId = (exchange.requester?._id || exchange.requester).toString();
    const recipientId = (exchange.recipient?._id || exchange.recipient).toString();

    const isRequester = requesterId === userIdStr;
    const isRecipient = recipientId === userIdStr;

    if (!isRequester && !isRecipient) {
      return res.status(403).json({ success: false, message: 'Not authorized for this exchange' });
    }

    if (isRequester) exchange.requesterConfirmed = true;
    if (isRecipient) exchange.recipientConfirmed = true;

    // If both users confirmed receipt
    if (exchange.requesterConfirmed && exchange.recipientConfirmed) {
      exchange.status = 'COMPLETED';

      // Update book status
      if (exchange.requestedBook?._id) {
        await Book.findByIdAndUpdate(exchange.requestedBook._id, { status: 'EXCHANGED', $inc: { exchangeCount: 1 } });
      }
      if (exchange.offeredBook?._id) {
        await Book.findByIdAndUpdate(exchange.offeredBook._id, { status: 'EXCHANGED', $inc: { exchangeCount: 1 } });
      }

      // Update exchange counts for both users
      await User.findByIdAndUpdate(requesterId, { $inc: { totalExchanges: 1 } });
      await User.findByIdAndUpdate(recipientId, { $inc: { totalExchanges: 1 } });

      // Create transaction audit record
      await ExchangeTransaction.create({
        exchangeRequest: exchange._id,
        requester: requesterId,
        recipient: recipientId,
        bookOne: exchange.requestedBook?._id || exchange.requestedBook,
        bookTwo: exchange.offeredBook?._id || exchange.offeredBook
      });

      // System message in chat
      await Message.create({
        exchangeRequest: exchange._id,
        sender: req.user._id,
        recipient: isRequester ? recipientId : requesterId,
        content: `🎉 Exchange of "${exchange.requestedBook?.title || 'Book'}" is now officially COMPLETED!`,
        isSystemMessage: true
      });

      // Send Notifications
      await Notification.create({
        recipient: requesterId,
        sender: recipientId,
        type: 'EXCHANGE_COMPLETED',
        title: 'Exchange Completed! 🏆',
        message: `Your exchange of "${exchange.requestedBook?.title || 'Book'}" is completed. Leave a review!`,
        link: `/exchanges`
      });

      await Notification.create({
        recipient: recipientId,
        sender: requesterId,
        type: 'EXCHANGE_COMPLETED',
        title: 'Exchange Completed! 🏆',
        message: `Your exchange of "${exchange.offeredBook?.title || 'Book'}" is completed. Leave a review!`,
        link: `/exchanges`
      });

      await triggerN8nWorkflow('EXCHANGE_COMPLETED', { requestId: exchange._id });
    }

    await exchange.save();

    res.json({ success: true, exchange });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
