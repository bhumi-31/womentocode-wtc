// ===========================================
// CONTACT CONTROLLER
// ===========================================
// Business logic for Contact Messages
// 
// Public: Anyone can submit a message
// Admin: Can view, update status, delete messages
// ===========================================

const Contact = require('../models/Contact');

// @desc    Submit a contact message (Public)
// @route   POST /api/contact
// @access  Public
exports.submitMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message, category } = req.body;

    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
      category
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received. We will get back to you soon.',
      data: {
        id: contact._id,
        name: contact.name,
        subject: contact.subject
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not submit message. Please try again.',
      error: error.message
    });
  }
};

// @desc    Get all messages (Admin)
// @route   GET /api/contact
// @access  Private (Admin only)
exports.getAllMessages = async (req, res) => {
  try {
    // Query parameters for filtering
    const { status, category } = req.query;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    // Get messages, newest first
    const messages = await Contact.find(filter).sort({ createdAt: -1 });

    // Count by status for dashboard
    const stats = {
      total: await Contact.countDocuments(),
      unread: await Contact.countDocuments({ status: 'unread' }),
      read: await Contact.countDocuments({ status: 'read' }),
      replied: await Contact.countDocuments({ status: 'replied' }),
      archived: await Contact.countDocuments({ status: 'archived' })
    };

    res.status(200).json({
      success: true,
      count: messages.length,
      stats,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch messages',
      error: error.message
    });
  }
};

// @desc    Get single message (Admin)
// @route   GET /api/contact/:id
// @access  Private (Admin only)
exports.getMessage = async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Auto-mark as read if unread
    if (message.status === 'unread') {
      message.status = 'read';
      message.readAt = new Date();
      await message.save();
    }

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch message',
      error: error.message
    });
  }
};

// @desc    Update message status/notes (Admin)
// @route   PUT /api/contact/:id
// @access  Private (Admin only)
exports.updateMessage = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === 'read' && !req.body.readAt) {
        updateData.readAt = new Date();
      }
      if (status === 'replied') {
        updateData.repliedAt = new Date();
      }
    }
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    const message = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not update message',
      error: error.message
    });
  }
};

// @desc    Delete message (Admin)
// @route   DELETE /api/contact/:id
// @access  Private (Admin only)
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Contact.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not delete message',
      error: error.message
    });
  }
};

// @desc    Get unread count (for navbar badge)
// @route   GET /api/contact/unread-count
// @access  Private (Admin only)
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Contact.countDocuments({ status: 'unread' });
    
    res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not get unread count',
      error: error.message
    });
  }
};
