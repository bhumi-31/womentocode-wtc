// ===========================================
// CONTACT MODEL
// ===========================================
// This defines what a "Contact Message" looks like.
// 
// When someone fills your contact form, it creates
// a new Contact document with:
// - name, email, subject, message
// - status (unread, read, replied, archived)
// ===========================================

const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  // Sender Info
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true
    // Optional phone number
  },

  // Message Content
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required']
  },

  // Categorization
  category: {
    type: String,
    enum: ['general', 'support', 'partnership', 'feedback', 'other'],
    default: 'general'
  },

  // Status for Admin to track
  status: {
    type: String,
    enum: ['unread', 'read', 'replied', 'archived'],
    default: 'unread'
  },

  // Admin notes (internal use)
  adminNotes: {
    type: String
    // Admin can add private notes about this message
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  readAt: {
    type: Date
    // When admin first read the message
  },
  repliedAt: {
    type: Date
    // When admin replied
  }
});

module.exports = mongoose.model('Contact', contactSchema);
