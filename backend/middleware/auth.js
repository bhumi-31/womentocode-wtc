// ===========================================
// AUTH MIDDLEWARE
// ===========================================
// Middleware is code that runs BETWEEN the request
// and the controller. It can:
// - Check if user is logged in
// - Check if user has permission
// - Stop the request if something is wrong
// ===========================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ------------------------------------------
// PROTECT - Check if user is logged in
// ------------------------------------------
// This middleware checks the token and allows/denies access
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in header
    // Format: "Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please log in.'
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user and attach to request
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    next();  // Continue to the controller

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid token.'
    });
  }
};

// ------------------------------------------
// AUTHORIZE - Check user role
// ------------------------------------------
// Only allow certain roles (e.g., only admins can delete users)
// Usage: authorize('admin', 'editor')
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this`
      });
    }
    next();
  };
};
