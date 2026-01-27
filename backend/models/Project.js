// ===========================================
// PROJECT MODEL
// ===========================================
// This defines what a "Project" looks like.
// 
// Each project has:
// - title (required)
// - description
// - category (web, mobile, data-science, etc.)
// - technologies used
// - status (in-progress, completed, etc.)
// ===========================================

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true
    // URL-friendly version of title: "E-Commerce Website" → "e-commerce-website"
  },
  
  // Creator Info
  creatorName: {
    type: String,
    trim: true
    // Name of the person who created the project
  },
  graduationYear: {
    type: String,
    // Year of graduation e.g., "2024"
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
    default: '/images/default-project.png'
  },
  images: [{
    type: String
    // Multiple project screenshots
  }],

  // Category & Type
  category: {
    type: String,
    enum: ['web', 'mobile', 'desktop', 'data-science', 'machine-learning', 'iot', 'other'],
    default: 'web'
  },
  projectType: {
    type: String,
    enum: ['personal', 'client', 'open-source', 'hackathon', 'academic', 'other'],
    default: 'personal'
  },

  // Technologies
  technologies: [{
    type: String
    // ["React", "Node.js", "MongoDB"]
  }],
  programmingLanguages: [{
    type: String
    // ["JavaScript", "Python"]
  }],

  // Links
  liveUrl: {
    type: String
    // Live demo link
  },
  githubUrl: {
    type: String
    // Source code link
  },
  videoUrl: {
    type: String
    // Demo video link
  },

  // Team/Contributors
  teamMembers: [{
    name: String,
    role: String,
    linkedin: String
  }],

  // Timeline
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  duration: {
    type: String
    // "3 months", "6 weeks"
  },

  // Status
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'on-hold', 'archived'],
    default: 'completed'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },

  // Extra Info
  features: [{
    type: String
    // Key features: ["User authentication", "Payment integration"]
  }],
  challenges: {
    type: String
    // Challenges faced during development
  },
  learnings: {
    type: String
    // What was learned from this project
  },

  // Display Order
  order: {
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
projectSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
