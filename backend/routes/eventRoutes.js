// ===========================================
// EVENT ROUTES
// ===========================================
// Maps URLs to controller functions
// 
// Public routes:
//   GET /api/events - View all events
//   GET /api/events/upcoming - Next 30 days
//   GET /api/events/type/:type - Filter by type
//   GET /api/events/:identifier - Single event (ID or slug)
//
// Admin routes (require login + admin role):
//   GET /api/events/admin/all - All events (includes drafts)
//   POST /api/events - Create event
//   PUT /api/events/:id - Edit event
//   PUT /api/events/:id/cancel - Cancel event
//   DELETE /api/events/:id - Remove event
// ===========================================

const express = require('express');
const router = express.Router();

// Import controller functions
const {
  getAllEvents,
  getEvent,
  getEventsByType,
  getUpcomingEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getAllEventsAdmin,
  cancelEvent
} = require('../controllers/eventController');

// Import auth middleware
const { protect, authorize } = require('../middleware/auth');

// ===========================================
// PUBLIC ROUTES (Anyone can access)
// ===========================================

// GET /api/events - Get all active events
// Supports filtering: /api/events?eventType=workshop&isOnline=true
router.get('/', getAllEvents);

// GET /api/events/upcoming - Get events in next 30 days
router.get('/upcoming', getUpcomingEvents);

// GET /api/events/type/:eventType - Get events by type
router.get('/type/:eventType', getEventsByType);

// ===========================================
// ADMIN ROUTES (Require login + admin role)
// ===========================================

// GET /api/events/admin/all - Get all events including drafts
router.get('/admin/all', protect, authorize('admin'), getAllEventsAdmin);

// POST /api/events - Create new event
router.post('/', protect, authorize('admin'), createEvent);

// PUT /api/events/:id/cancel - Cancel an event
router.put('/:id/cancel', protect, authorize('admin'), cancelEvent);

// PUT /api/events/:id - Update event
router.put('/:id', protect, authorize('admin'), updateEvent);

// DELETE /api/events/:id - Delete event
router.delete('/:id', protect, authorize('admin'), deleteEvent);

// ===========================================
// PUBLIC ROUTE (Must be last - catches :identifier)
// ===========================================

// GET /api/events/:identifier - Get single event (by ID or slug)
router.get('/:identifier', getEvent);

module.exports = router;
