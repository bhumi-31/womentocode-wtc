// ===========================================
// EVENT MODEL
// ===========================================
// This defines what an "Event" looks like.
// 
// Events are one-time or short activities like:
// - Workshops, Webinars, Meetups
// - Conferences, Hackathons
// ===========================================

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true
    // URL-friendly: "react-workshop" instead of "React Workshop"
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  image: {
    type: String,
    default: '/images/default-event.png'
  },

  // Event Type
  eventType: {
    type: String,
    enum: ['workshop', 'webinar', 'meetup', 'conference', 'hackathon', 'seminar', 'networking', 'other'],
    default: 'workshop'
  },

  // Date & Time
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date
    // Optional: for multi-day events
  },
  startTime: {
    type: String
    // "10:00 AM"
  },
  endTime: {
    type: String
    // "4:00 PM"
  },
  timezone: {
    type: String,
    default: 'UTC'
  },

  // Location
  isOnline: {
    type: Boolean,
    default: false
  },
  venue: {
    type: String
    // "Tech Hub Auditorium"
  },
  address: {
    type: String
    // Full address for in-person events
  },
  city: {
    type: String
  },
  onlineLink: {
    type: String
    // Zoom/Meet link for virtual events
  },
  onlinePlatform: {
    type: String
    // "Zoom", "Google Meet", "Microsoft Teams"
  },

  // Pricing & Registration
  isFree: {
    type: Boolean,
    default: true
  },
  price: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  maxAttendees: {
    type: Number,
    default: 0  // 0 = unlimited
  },
  registeredCount: {
    type: Number,
    default: 0
  },
  registrationDeadline: {
    type: Date
  },
  registrationLink: {
    type: String
    // External registration link if using third-party
  },

  // Organizer Info
  organizer: {
    type: String,
    default: 'WomenToCode'
  },
  contactEmail: {
    type: String
  },
  contactPhone: {
    type: String
  },

  // Status
  status: {
    type: String,
    enum: ['draft', 'upcoming', 'ongoing', 'completed', 'cancelled', 'postponed'],
    default: 'draft'
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
  speakers: [{
    name: String,
    title: String,
    image: String,
    bio: String
  }],
  agenda: [{
    time: String,
    title: String,
    description: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String
    // What attendees need: "Laptop", "Basic JS knowledge"
  }],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-generate slug from title before saving
eventSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Index for faster queries
eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ slug: 1 });

module.exports = mongoose.model('Event', eventSchema);
