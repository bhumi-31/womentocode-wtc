// ===========================================
// EVENT CONTROLLER
// ===========================================
// Business logic for Events
// 
// Public: View upcoming events, filter by type
// Admin: Create, edit, cancel, delete events
// ===========================================

const Event = require('../models/Event');

// @desc    Get all upcoming/active events
// @route   GET /api/events
// @access  Public
exports.getAllEvents = async (req, res) => {
  try {
    const { eventType, status, featured, city, isOnline } = req.query;
    
    // Build filter - show active events only
    const filter = { isActive: true };
    
    // By default, show upcoming and ongoing events
    if (status) {
      filter.status = status;
    } else {
      filter.status = { $in: ['upcoming', 'ongoing'] };
    }
    
    if (eventType) filter.eventType = eventType;
    if (featured === 'true') filter.isFeatured = true;
    if (city) filter.city = city;
    if (isOnline === 'true') filter.isOnline = true;
    if (isOnline === 'false') filter.isOnline = false;

    const events = await Event.find(filter).sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch events',
      error: error.message
    });
  }
};

// @desc    Get single event by ID or slug
// @route   GET /api/events/:identifier
// @access  Public
exports.getEvent = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    let event;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      // It's a MongoDB ObjectId
      event = await Event.findById(identifier);
    } else {
      // It's a slug
      event = await Event.findOne({ slug: identifier });
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch event',
      error: error.message
    });
  }
};

// @desc    Get events by type
// @route   GET /api/events/type/:eventType
// @access  Public
exports.getEventsByType = async (req, res) => {
  try {
    const events = await Event.find({
      eventType: req.params.eventType,
      isActive: true,
      status: { $in: ['upcoming', 'ongoing'] }
    }).sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      eventType: req.params.eventType,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch events',
      error: error.message
    });
  }
};

// @desc    Get upcoming events (next 30 days)
// @route   GET /api/events/upcoming
// @access  Public
exports.getUpcomingEvents = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);

    const events = await Event.find({
      isActive: true,
      status: 'upcoming',
      startDate: { $gte: today, $lte: thirtyDaysLater }
    }).sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch upcoming events',
      error: error.message
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Admin only)
exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Event created successfully!',
      data: event
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An event with this title already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Could not create event',
      error: error.message
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Admin only)
exports.updateEvent = async (req, res) => {
  try {
    // Regenerate slug if title changes
    if (req.body.title) {
      req.body.slug = req.body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event updated successfully!',
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not update event',
      error: error.message
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin only)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully!',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not delete event',
      error: error.message
    });
  }
};

// @desc    Get all events for admin (includes drafts, cancelled)
// @route   GET /api/events/admin/all
// @access  Private (Admin only)
exports.getAllEventsAdmin = async (req, res) => {
  try {
    const { eventType, status } = req.query;
    
    const filter = {};
    if (eventType) filter.eventType = eventType;
    if (status) filter.status = status;

    const events = await Event.find(filter).sort({ createdAt: -1 });

    // Stats for dashboard
    const stats = {
      total: await Event.countDocuments(),
      upcoming: await Event.countDocuments({ status: 'upcoming' }),
      ongoing: await Event.countDocuments({ status: 'ongoing' }),
      completed: await Event.countDocuments({ status: 'completed' }),
      cancelled: await Event.countDocuments({ status: 'cancelled' }),
      draft: await Event.countDocuments({ status: 'draft' })
    };

    res.status(200).json({
      success: true,
      count: events.length,
      stats,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch events',
      error: error.message
    });
  }
};

// @desc    Cancel an event
// @route   PUT /api/events/:id/cancel
// @access  Private (Admin only)
exports.cancelEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event cancelled successfully',
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not cancel event',
      error: error.message
    });
  }
};
