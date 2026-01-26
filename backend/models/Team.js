// ===========================================
// TEAM MEMBER MODEL
// ===========================================
// This defines what a "Team Member" looks like in our database.
// 
// Each team member has:
// - name (required)
// - role/position (e.g., "Founder", "Developer")
// - image URL
// - bio (short description)
// - social media links
// - order (for sorting on website)
// ===========================================

const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Role/Position is required'],
    trim: true
    // Examples: "Founder & CEO", "Lead Developer", "Marketing Head"
  },
  image: {
    type: String,
    default: '/images/default-avatar.png'
    // URL to the team member's photo
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
    // Short description about the person
  },
  
  // Social Media Links (all optional)
  socialLinks: {
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    github: { type: String, default: '' },
    instagram: { type: String, default: '' }
  },
  
  // Display Settings
  order: {
    type: Number,
    default: 0
    // Used to control the order on the website
    // Lower number = appears first
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

module.exports = mongoose.model('Team', teamSchema);
