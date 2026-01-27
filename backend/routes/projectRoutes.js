// ===========================================
// PROJECT ROUTES
// ===========================================
// Maps URLs to controller functions
// 
// Public routes:
//   GET /api/projects - View all projects
//   GET /api/projects/featured - View featured projects
//   GET /api/projects/category/:category - View by category
//   GET /api/projects/:identifier - View single project (by ID or slug)
//
// Admin routes (require login + admin role):
//   GET /api/projects/admin/all - View all (includes hidden)
//   POST /api/projects - Add new project
//   PUT /api/projects/:id - Edit project
//   DELETE /api/projects/:id - Remove project
// ===========================================

const express = require('express');
const router = express.Router();

// Import controller functions
const {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectsByCategory,
  getFeaturedProjects,
  getAllProjectsAdmin
} = require('../controllers/projectController');

// Import auth middleware
const { protect, authorize } = require('../middleware/auth');

// ===========================================
// PUBLIC ROUTES (Anyone can access)
// ===========================================

// GET /api/projects - Get all projects
// Supports filtering: /api/projects?status=completed&category=web
router.get('/', getAllProjects);

// GET /api/projects/featured - Get featured projects
router.get('/featured', getFeaturedProjects);

// GET /api/projects/category/:category - Get by category
router.get('/category/:category', getProjectsByCategory);

// ===========================================
// ADMIN ROUTES (Require login + admin role)
// ===========================================

// GET /api/projects/admin/all - Get all projects including hidden
router.get('/admin/all', protect, authorize('admin'), getAllProjectsAdmin);

// POST /api/projects - Create new project
router.post('/', protect, authorize('admin'), createProject);

// PUT /api/projects/:id - Update project
router.put('/:id', protect, authorize('admin'), updateProject);

// DELETE /api/projects/:id - Delete project
router.delete('/:id', protect, authorize('admin'), deleteProject);

// ===========================================
// PUBLIC ROUTE (Must be last - :identifier catches everything)
// ===========================================

// GET /api/projects/:identifier - Get single project (by ID or slug)
router.get('/:identifier', getProject);

module.exports = router;
