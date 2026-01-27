// ===========================================
// GALLERY ROUTES
// ===========================================
// Maps URLs to controller functions
// 
// Public routes:
//   GET /api/gallery - View all images
//   GET /api/gallery/albums - List all albums
//   GET /api/gallery/album/:albumName - View album
//   GET /api/gallery/:id - View single image
//
// Admin routes (require login + admin role):
//   GET /api/gallery/admin/all - View all (includes hidden)
//   POST /api/gallery - Add image
//   PUT /api/gallery/:id - Edit image
//   DELETE /api/gallery/:id - Remove image
// ===========================================

const express = require('express');
const router = express.Router();

// Import controller functions
const {
  getAllImages,
  getImage,
  getAlbum,
  getAllAlbums,
  createImage,
  updateImage,
  deleteImage,
  getAllImagesAdmin
} = require('../controllers/galleryController');

// Import auth middleware
const { protect, authorize } = require('../middleware/auth');

// ===========================================
// PUBLIC ROUTES (Anyone can access)
// ===========================================

// GET /api/gallery - Get all images
// Supports filtering: /api/gallery?category=events&featured=true
router.get('/', getAllImages);

// GET /api/gallery/albums - Get list of all albums
router.get('/albums', getAllAlbums);

// GET /api/gallery/album/:albumName - Get images in specific album
router.get('/album/:albumName', getAlbum);

// ===========================================
// ADMIN ROUTES (Require login + admin role)
// ===========================================

// GET /api/gallery/admin/all - Get all images including hidden ones
router.get('/admin/all', protect, authorize('admin'), getAllImagesAdmin);

// POST /api/gallery - Add new image
router.post('/', protect, authorize('admin'), createImage);

// PUT /api/gallery/:id - Update image
router.put('/:id', protect, authorize('admin'), updateImage);

// DELETE /api/gallery/:id - Delete image
router.delete('/:id', protect, authorize('admin'), deleteImage);

// ===========================================
// PUBLIC ROUTE (Must be last - :id catches everything)
// ===========================================

// GET /api/gallery/:id - Get single image
router.get('/:id', getImage);

module.exports = router;
