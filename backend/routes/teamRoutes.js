// ===========================================
// TEAM ROUTES
// ===========================================
// This maps URLs to controller functions.
// 
// PUBLIC routes (no login needed):
// - GET /api/team - view all members
// - GET /api/team/:id - view one member
// 
// ADMIN routes (login + admin role required):
// - POST /api/team - add member
// - PUT /api/team/:id - update member
// - DELETE /api/team/:id - delete member
// ===========================================

const express = require('express');
const router = express.Router();

// Import controller functions
const {
  getAllMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember
} = require('../controllers/teamController');

// Import auth middleware
const { protect, authorize } = require('../middleware/auth');

// ------------------------------------------
// PUBLIC ROUTES
// ------------------------------------------
router.get('/', getAllMembers);        // GET /api/team
router.get('/:id', getMember);         // GET /api/team/:id

// ------------------------------------------
// ADMIN ROUTES (protected)
// ------------------------------------------
// protect = must be logged in
// authorize('admin') = must have admin role
router.post('/', protect, authorize('admin'), createMember);
router.put('/:id', protect, authorize('admin'), updateMember);
router.delete('/:id', protect, authorize('admin'), deleteMember);

module.exports = router;
