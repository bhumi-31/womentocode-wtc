// ===========================================
// AUTH ROUTES
// ===========================================
// Routes define the URLs and connect them to controllers
// Think of it as a "map" that says:
// "When someone visits /api/auth/login, run the login function"
// ===========================================

const express = require('express');
const router = express.Router();

// Import controller functions
const { 
  register, 
  login, 
  getMe, 
  getAllUsers,
  checkAdminAccess,
  updateUserRole
} = require('../controllers/authController');

// Import middleware
const { protect, authorize } = require('../middleware/auth');

// ------------------------------------------
// PUBLIC ROUTES (no login required)
// ------------------------------------------
// These are for visitors who haven't logged in yet

router.post('/register', register);   // POST /api/auth/register
// ↑ Frontend sends: { firstName, lastName, email, password, agreeToTerms }

router.post('/login', login);         // POST /api/auth/login
// ↑ Frontend sends: { email, password }
// ↑ Returns: user info + token + isAdmin flag

// ------------------------------------------
// PROTECTED ROUTES (login required)
// ------------------------------------------
// User must send token in header: Authorization: Bearer <token>

router.get('/me', protect, getMe);    // GET /api/auth/me
// ↑ Get current user's info

// ------------------------------------------
// ADMIN VERIFICATION ROUTE
// ------------------------------------------
// Frontend calls this when user tries to access admin dashboard
// It checks if the logged-in user is actually an admin

router.get('/check-admin', protect, authorize('admin'), checkAdminAccess);
// ↑ GET /api/auth/check-admin
// ↑ Returns: { hasAccess: true/false }

// ------------------------------------------
// ADMIN ONLY ROUTES
// ------------------------------------------
// Only users with role='admin' can access these

router.get('/users', protect, authorize('admin'), getAllUsers);
// ↑ GET /api/auth/users - Get all registered users

router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);
// ↑ PUT /api/auth/users/123/role - Change a user's role
// ↑ Body: { role: 'admin' } or { role: 'viewer' }

module.exports = router;
