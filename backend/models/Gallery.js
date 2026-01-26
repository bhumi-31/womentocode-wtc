// ===========================================
// GALLERY MODEL
// ===========================================
// This defines what a "Gallery Image" looks like.
// 
// Each image has:
// - title, image URL, description
// - category (events, workshops, team, etc.)
// - album (for grouping related photos)
// - order (control display position)
// ===========================================

const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: [true, 'Image title is required'],
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Image URL is required']
    // URL or path to the image file
  },
  thumbnail: {
    type: String
    // Smaller version for faster loading (optional)
  },
  description: {
    type: String,
    trim: true
    // Caption for the image
  },

  // Categorization
  category: {
    type: String,
    enum: ['events', 'workshops', 'team', 'campus', 'students', 'achievements', 'other'],
    default: 'other'
  },
  album: {
    type: String,
    trim: true
    // Group related photos: "Summer Bootcamp 2024", "Graduation Day"
  },
  tags: [{
    type: String,
    trim: true
    // For searching: ["graduation", "2024", "students"]
  }],

  // Display Control
  order: {
    type: Number,
    default: 0
    // Lower numbers appear first
  },
  isActive: {
    type: Boolean,
    default: true
    // Set to false to hide without deleting
  },
  isFeatured: {
    type: Boolean,
    default: false
    // Featured images can be shown on homepage
  },

  // Metadata
  photographer: {
    type: String
    // Credit: "Photo by John Doe"
  },
  dateTaken: {
    type: Date
    // When the photo was taken
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
gallerySchema.index({ category: 1, order: 1 });
gallerySchema.index({ album: 1 });
gallerySchema.index({ tags: 1 });

module.exports = mongoose.model('Gallery', gallerySchema);
