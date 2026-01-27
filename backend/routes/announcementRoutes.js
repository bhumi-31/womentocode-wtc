// ===========================================
// ANNOUNCEMENT ROUTES
// ===========================================
// Maps URLs to controller functions
// 
// Public routes:
//   GET /api/announcements - View active announcements
//   GET /api/announcements/location/:location - By display location
//   GET /api/announcements/:id - View single
//   PUT /api/announcements/:id/click - Track click
//
// Admin routes (require login + admin role):
//   GET /api/announcements/admin/all - View all (+ inactive)
//   POST /api/announcements - Create
//   PUT /api/announcements/:id - Edit
//   PUT /api/announcements/:id/toggle - Activate/Deactivate
//   PUT /api/announcements/:id/pin - Pin/Unpin
//   DELETE /api/announcements/:id - Remove
// ===========================================

const express = require('express');
const router = express.Router();

// Import controller functions
const {
  getActiveAnnouncements,
  getByLocation,
  getAnnouncement,
  trackClick,
  createAnnouncement,
  updateAnnouncement,
  toggleActive,
  togglePinned,
  deleteAnnouncement,
  getAllAnnouncementsAdmin
} = require('../controllers/announcementController');

// Import auth middleware
const { protect, authorize } = require('../middleware/auth');

// ===========================================
// PUBLIC ROUTES (Anyone can access)
// ===========================================

// GET /api/announcements - Get active announcements
// Supports filtering: /api/announcements?location=header-banner
router.get('/', getActiveAnnouncements);

// GET /api/announcements/location/:location - Get by display location
router.get('/location/:location', getByLocation);

// ===========================================
// ADMIN ROUTES (Require login + admin role)
// ===========================================

// GET /api/announcements/admin/all - Get all including inactive
router.get('/admin/all', protect, authorize('admin'), getAllAnnouncementsAdmin);

// POST /api/announcements - Create new announcement
router.post('/', protect, authorize('admin'), createAnnouncement);

// PUT /api/announcements/:id/toggle - Toggle active status
router.put('/:id/toggle', protect, authorize('admin'), toggleActive);

// PUT /api/announcements/:id/pin - Toggle pinned status
router.put('/:id/pin', protect, authorize('admin'), togglePinned);

// PUT /api/announcements/:id - Update announcement
router.put('/:id', protect, authorize('admin'), updateAnnouncement);

// DELETE /api/announcements/:id - Delete announcement
router.delete('/:id', protect, authorize('admin'), deleteAnnouncement);

// ===========================================
// PUBLIC ROUTES (Must be after specific routes)
// ===========================================

// PUT /api/announcements/:id/click - Track link click (public)
router.put('/:id/click', trackClick);

// GET /api/announcements/:id - Get single announcement
router.get('/:id', getAnnouncement);

module.exports = router;
