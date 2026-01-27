// ===========================================
// ARTICLE ROUTES
// ===========================================
// Maps URLs to controller functions
// 
// Public routes:
//   GET /api/articles - View published articles
//   GET /api/articles/featured - Featured articles
//   GET /api/articles/recent - Recent articles
//   GET /api/articles/search - Search articles
//   GET /api/articles/categories - List categories
//   GET /api/articles/tags - List popular tags
//   GET /api/articles/category/:category - By category
//   GET /api/articles/tag/:tag - By tag
//   GET /api/articles/:identifier - Single article
//   PUT /api/articles/:id/like - Like article
//
// Admin routes (require login + admin role):
//   GET /api/articles/admin/all - All articles (+ drafts)
//   POST /api/articles - Create article
//   PUT /api/articles/:id - Edit article
//   PUT /api/articles/:id/publish - Publish
//   PUT /api/articles/:id/unpublish - Unpublish
//   PUT /api/articles/:id/feature - Toggle featured
//   DELETE /api/articles/:id - Remove article
// ===========================================

const express = require('express');
const router = express.Router();

// Import controller functions
const {
  getPublishedArticles,
  getArticle,
  getByCategory,
  getByTag,
  getFeatured,
  getRecent,
  searchArticles,
  likeArticle,
  createArticle,
  updateArticle,
  publishArticle,
  unpublishArticle,
  toggleFeatured,
  deleteArticle,
  getAllArticlesAdmin,
  getCategories,
  getTags
} = require('../controllers/articleController');

// Import auth middleware
const { protect, authorize } = require('../middleware/auth');

// ===========================================
// PUBLIC ROUTES (Anyone can access)
// ===========================================

// GET /api/articles - Get published articles
router.get('/', getPublishedArticles);

// GET /api/articles/featured - Get featured articles
router.get('/featured', getFeatured);

// GET /api/articles/recent - Get recent articles
router.get('/recent', getRecent);

// GET /api/articles/search - Search articles
router.get('/search', searchArticles);

// GET /api/articles/categories - Get all categories
router.get('/categories', getCategories);

// GET /api/articles/tags - Get popular tags
router.get('/tags', getTags);

// GET /api/articles/category/:category - Get by category
router.get('/category/:category', getByCategory);

// GET /api/articles/tag/:tag - Get by tag
router.get('/tag/:tag', getByTag);

// ===========================================
// ADMIN ROUTES (Require login + admin role)
// ===========================================

// GET /api/articles/admin/all - Get all articles including drafts
router.get('/admin/all', protect, authorize('admin'), getAllArticlesAdmin);

// POST /api/articles - Create new article
router.post('/', protect, authorize('admin'), createArticle);

// PUT /api/articles/:id/publish - Publish article
router.put('/:id/publish', protect, authorize('admin'), publishArticle);

// PUT /api/articles/:id/unpublish - Unpublish article
router.put('/:id/unpublish', protect, authorize('admin'), unpublishArticle);

// PUT /api/articles/:id/feature - Toggle featured
router.put('/:id/feature', protect, authorize('admin'), toggleFeatured);

// PUT /api/articles/:id - Update article
router.put('/:id', protect, authorize('admin'), updateArticle);

// DELETE /api/articles/:id - Delete article
router.delete('/:id', protect, authorize('admin'), deleteArticle);

// ===========================================
// PUBLIC ROUTES (Must be last)
// ===========================================

// PUT /api/articles/:id/like - Like article (public)
router.put('/:id/like', likeArticle);

// GET /api/articles/:identifier - Get single article (by ID or slug)
router.get('/:identifier', getArticle);

module.exports = router;
