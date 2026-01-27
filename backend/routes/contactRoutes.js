// ===========================================
// CONTACT ROUTES
// ===========================================
// Maps URLs to controller functions
// 
// Public routes:
//   POST /api/contact - Submit a message (anyone)
//
// Admin routes (require login + admin role):
//   GET /api/contact - View all messages
//   GET /api/contact/unread-count - Get unread count
//   GET /api/contact/:id - View single message
//   PUT /api/contact/:id - Update status/notes
//   DELETE /api/contact/:id - Delete message
// ===========================================

const express = require('express');
const router = express.Router();

// Import controller functions
const {
  submitMessage,
  getAllMessages,
  getMessage,
  updateMessage,
  deleteMessage,
  getUnreadCount
} = require('../controllers/contactController');

// Import auth middleware
const { protect, authorize } = require('../middleware/auth');

// ===========================================
// PUBLIC ROUTES
// ===========================================

// POST /api/contact - Submit contact form
router.post('/', submitMessage);

// ===========================================
// ADMIN ROUTES (Require login + admin role)
// ===========================================

// GET /api/contact/unread-count - Quick check for unread messages
// Note: This must be BEFORE /:id route, otherwise "unread-count" is treated as an ID
router.get('/unread-count', protect, authorize('admin'), getUnreadCount);

// GET /api/contact - Get all messages
router.get('/', protect, authorize('admin'), getAllMessages);

// GET /api/contact/:id - Get single message (auto-marks as read)
router.get('/:id', protect, authorize('admin'), getMessage);

// PUT /api/contact/:id - Update message status/notes
router.put('/:id', protect, authorize('admin'), updateMessage);

// DELETE /api/contact/:id - Delete message
router.delete('/:id', protect, authorize('admin'), deleteMessage);

module.exports = router;
