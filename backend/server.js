// ===========================================
// WOMENTOCODE BACKEND SERVER (MVC Structure)
// ===========================================
// 
// FOLDER STRUCTURE:
// backend/
// ├── config/          # Configuration files
// │   └── db.js        # Database connection
// ├── models/          # Data structures (M in MVC)
// │   └── User.js      # User model
// ├── controllers/     # Logic/Brain (C in MVC)
// │   └── authController.js
// ├── routes/          # URL mappings
// │   └── authRoutes.js
// ├── middleware/      # Code that runs between request & response
// │   └── auth.js      # Authentication checks
// ├── server.js        # This file - Entry point
// └── .env             # Secret configuration
//
// ===========================================

// ------------------------------------------
// STEP 1: Import Dependencies
// ------------------------------------------
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import our custom modules
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teamRoutes');
const projectRoutes = require('./routes/projectRoutes');
const contactRoutes = require('./routes/contactRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const eventRoutes = require('./routes/eventRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const articleRoutes = require('./routes/articleRoutes');

// ------------------------------------------
// STEP 2: Create Express App
// ------------------------------------------
const app = express();

// ------------------------------------------
// STEP 3: Middleware
// ------------------------------------------
app.use(cors());           // Allow cross-origin requests
app.use(express.json({ limit: '50mb' }));   // Parse JSON bodies with larger limit for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));  // Parse URL-encoded bodies

// ------------------------------------------
// STEP 4: API Routes
// ------------------------------------------

// Home route - API info
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'WomenToCode API (MVC Structure)',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /auth/register',
        login: 'POST /auth/login',
        getMe: 'GET /auth/me (protected)',
        getAllUsers: 'GET /auth/users (admin only)'
      },
      health: 'GET /health'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    success: true,
    server: 'Running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Mount auth routes at /auth
app.use('/auth', authRoutes);

// Mount team routes at /team
app.use('/team', teamRoutes);

// Mount project routes at /projects
app.use('/projects', projectRoutes);

// Mount contact routes at /contact
app.use('/contact', contactRoutes);

// Mount gallery routes at /gallery
app.use('/gallery', galleryRoutes);

// Mount event routes at /events
app.use('/events', eventRoutes);

// Mount announcement routes at /announcements
app.use('/announcements', announcementRoutes);

// Mount article routes at /articles
app.use('/articles', articleRoutes);

// ------------------------------------------
// STEP 5: 404 Handler (Route not found)
// ------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ------------------------------------------
// STEP 6: Start Server
// ------------------------------------------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to database first
  await connectDB();
  
  // Then start the server
  app.listen(PORT, () => {
    console.log('');
    console.log('===========================================');
    console.log('🚀 WomenToCode Backend (MVC)');
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log('===========================================');
    console.log('');
    console.log('📝 Test in Hopscotch:');
    console.log('');
    console.log('1. GET  http://localhost:5000/');
    console.log('   → Shows API info');
    console.log('');
    console.log('2. GET  http://localhost:5000/api/health');
    console.log('   → Check server & database status');
    console.log('');
    console.log('3. POST http://localhost:5000/api/auth/register');
    console.log('   Body: { "name": "Admin", "email": "admin@test.com", "password": "123456", "role": "admin" }');
    console.log('');
    console.log('4. POST http://localhost:5000/api/auth/login');
    console.log('   Body: { "email": "admin@test.com", "password": "123456" }');
    console.log('');
  });
};

startServer();
