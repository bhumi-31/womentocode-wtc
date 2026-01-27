// ===========================================
// PROGRAM MODEL
// ===========================================
// This defines what a "Program" (course/workshop) looks like.
// 
// Each program has:
// - title (required)
// - description
// - category (bootcamp, workshop, course, etc.)
// - duration, price
// - status (upcoming, active, completed)
// ===========================================

const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: [true, 'Program title is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true
    // URL-friendly version of title: "Web Development" → "web-development"
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
    // For cards/previews
  },
  image: {
    type: String,
    default: '/images/default-program.png'
  },

  // Category & Level
  category: {
    type: String,
    enum: ['bootcamp', 'workshop', 'course', 'webinar', 'mentorship'],
    default: 'course'
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all-levels'],
    default: 'all-levels'
  },

  // Schedule & Duration
  duration: {
    type: String
    // Examples: "8 weeks", "3 months", "2 days"
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  schedule: {
    type: String
    // Examples: "Mon-Fri 9am-5pm", "Weekends only"
  },

  // Pricing
  price: {
    type: Number,
    default: 0
    // 0 means free
  },
  currency: {
    type: String,
    default: 'USD'
  },
  isFree: {
    type: Boolean,
    default: false
  },

  // Status
  status: {
    type: String,
    enum: ['draft', 'upcoming', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // Extra Info
  features: [{
    type: String
    // List of what's included: ["Live classes", "Certificate", "Job support"]
  }],
  requirements: [{
    type: String
    // Prerequisites: ["Basic HTML knowledge", "Laptop required"]
  }],

  // Enrollment
  maxStudents: {
    type: Number,
    default: 0  // 0 means unlimited
  },
  enrolledCount: {
    type: Number,
    default: 0
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-generate slug from title before saving
programSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with dash
      .replace(/(^-|-$)/g, '');      // Remove leading/trailing dashes
  }
  next();
});

module.exports = mongoose.model('Program', programSchema);
