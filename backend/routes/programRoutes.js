// ===========================================
// PROGRAM ROUTES
// ===========================================
// Maps URLs to controller functions
// 
// Public routes:
//   GET /api/programs - View all programs
//   GET /api/programs/:identifier - View single program (by ID or slug)
//   GET /api/programs/category/:category - View programs by category
//
// Admin routes (require login + admin role):
//   POST /api/programs - Add new program
//   PUT /api/programs/:id - Edit program
//   DELETE /api/programs/:id - Remove program
// ===========================================

const express = require('express');
const router = express.Router();

// Import controller functions
const {
  getAllPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
  getProgramsByCategory
} = require('../controllers/programController');

// Import auth middleware
const { protect, authorize } = require('../middleware/auth');

// ===========================================
// PUBLIC ROUTES (Anyone can access)
// ===========================================

// GET /api/programs - Get all programs
// Also supports filtering: /api/programs?status=active&category=bootcamp
router.get('/', getAllPrograms);

// GET /api/programs/category/:category - Get by category
// Example: /api/programs/category/bootcamp
router.get('/category/:category', getProgramsByCategory);

// GET /api/programs/:identifier - Get single program
// Works with both ID and slug: /api/programs/web-development
router.get('/:identifier', getProgram);

// ===========================================
// ADMIN ROUTES (Require login + admin role)
// ===========================================

// POST /api/programs - Create new program
router.post('/', protect, authorize('admin'), createProgram);

// PUT /api/programs/:id - Update program
router.put('/:id', protect, authorize('admin'), updateProgram);

// DELETE /api/programs/:id - Delete program
router.delete('/:id', protect, authorize('admin'), deleteProgram);

module.exports = router;
