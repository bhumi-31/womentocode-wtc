// ===========================================
// TEAM MEMBER MODEL
// ===========================================
// This defines what a "Team Member" looks like in our database.
// Matches the frontend teamData structure exactly.
// ===========================================

const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  // Unique identifier (slug)
  id: {
    type: String,
    unique: true,
    sparse: true
    // e.g., 'sarah-johnson'
  },
  
  // Name fields
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  name: {
    type: String,
    trim: true
    // Full name, auto-generated if not provided
  },
  
  // Role/Position
  role: {
    type: String,
    required: [true, 'Role/Position is required'],
    trim: true
    // Examples: "Founder & CEO", "Lead Developer", "Marketing Head"
  },
  
  // Profile Image
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop'
  },
  
  // Theme Color for card
  color: {
    type: String,
    default: '#F7D046'
    // Hex color code for card accent
  },
  
  // Bio (previously quote/tagline)
  quote: {
    type: String,
    default: ''
    // Member's bio description
  },
  
  // Bio alias (same as quote)
  bio: {
    type: String,
    default: ''
  },
  
  // Tech Stack
  techStack: {
    type: String,
    default: ''
    // e.g., "React, Node.js, Python, MongoDB"
  },
  
  // Social Media Links
  social: {
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    github: { type: String, default: '' }
  },
  
  // Display Settings
  order: {
    type: Number,
    default: 0
    // Used to control the order on the website
  },
  isActive: {
    type: Boolean,
    default: true
    // If false, won't show on website
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-generate id (slug) and full name before saving
teamSchema.pre('save', function(next) {
  // Generate full name
  if (this.firstName && this.lastName) {
    this.name = `${this.firstName} ${this.lastName}`;
  }
  
  // Generate slug id
  if (!this.id && this.name) {
    this.id = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Team', teamSchema);
