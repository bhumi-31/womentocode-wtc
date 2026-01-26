// ===========================================
// ANNOUNCEMENT MODEL
// ===========================================
// This defines what an "Announcement" looks like.
// 
// Announcements are notices/alerts shown on the website:
// - Banners, popups, news updates
// - Can be scheduled to auto-show/hide
// ===========================================

const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  shortContent: {
    type: String,
    maxlength: [150, 'Short content cannot exceed 150 characters']
    // For banner displays
  },

  // Type & Priority
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'alert', 'news', 'update'],
    default: 'info'
    // info = blue, success = green, warning = yellow, alert = red
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Display Settings
  displayLocation: {
    type: String,
    enum: ['homepage', 'all-pages', 'header-banner', 'footer-banner', 'popup', 'sidebar'],
    default: 'homepage'
  },
  
  // Scheduling
  startDate: {
    type: Date,
    default: Date.now
    // When to start showing
  },
  endDate: {
    type: Date
    // When to stop showing (null = no expiry)
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
    // Pinned announcements appear first
  },

  // Optional Link/Button
  link: {
    type: String
    // URL to redirect when clicked
  },
  linkText: {
    type: String,
    default: 'Learn More'
    // Button text: "Register Now", "Read More", etc.
  },

  // Styling (Optional)
  backgroundColor: {
    type: String
    // Custom color: "#ff5722", "red"
  },
  textColor: {
    type: String
    // Custom text color
  },
  icon: {
    type: String
    // Icon name or emoji: "📢", "⚠️", "🎉"
  },

  // Target Audience
  audience: {
    type: String,
    enum: ['all', 'members', 'visitors', 'admins'],
    default: 'all'
  },

  // Dismissible
  isDismissible: {
    type: Boolean,
    default: true
    // Can user close/dismiss it?
  },

  // Tracking
  viewCount: {
    type: Number,
    default: 0
  },
  clickCount: {
    type: Number,
    default: 0
  },

  // Created By
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
announcementSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for faster queries
announcementSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
announcementSchema.index({ displayLocation: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
