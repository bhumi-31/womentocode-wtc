// ===========================================
// ANNOUNCEMENT CONTROLLER
// ===========================================
// Business logic for Announcements
// 
// Public: View active announcements
// Admin: Create, edit, schedule, delete
// ===========================================

const Announcement = require('../models/Announcement');

// @desc    Get all active announcements (Public)
// @route   GET /api/announcements
// @access  Public
exports.getActiveAnnouncements = async (req, res) => {
  try {
    const now = new Date();
    const { location } = req.query;

    // Build filter for active, non-expired announcements
    const filter = {
      isActive: true,
      startDate: { $lte: now },
      $or: [
        { endDate: null },
        { endDate: { $gte: now } }
      ]
    };

    if (location) {
      filter.displayLocation = location;
    }

    const announcements = await Announcement.find(filter)
      .sort({ isPinned: -1, priority: -1, createdAt: -1 });
    // Pinned first, then by priority, then newest

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch announcements',
      error: error.message
    });
  }
};

// @desc    Get announcements by display location
// @route   GET /api/announcements/location/:location
// @access  Public
exports.getByLocation = async (req, res) => {
  try {
    const now = new Date();

    const announcements = await Announcement.find({
      displayLocation: req.params.location,
      isActive: true,
      startDate: { $lte: now },
      $or: [
        { endDate: null },
        { endDate: { $gte: now } }
      ]
    }).sort({ isPinned: -1, priority: -1 });

    res.status(200).json({
      success: true,
      location: req.params.location,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch announcements',
      error: error.message
    });
  }
};

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Public
exports.getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Increment view count
    announcement.viewCount += 1;
    await announcement.save();

    res.status(200).json({
      success: true,
      data: announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch announcement',
      error: error.message
    });
  }
};

// @desc    Track link click
// @route   PUT /api/announcements/:id/click
// @access  Public
exports.trackClick = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { $inc: { clickCount: 1 } },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Click tracked',
      data: { clickCount: announcement.clickCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not track click',
      error: error.message
    });
  }
};

// @desc    Create announcement (Admin)
// @route   POST /api/announcements
// @access  Private (Admin only)
exports.createAnnouncement = async (req, res) => {
  try {
    // Add created by user
    if (req.user) {
      req.body.createdBy = req.user.id;
    }

    const announcement = await Announcement.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully!',
      data: announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not create announcement',
      error: error.message
    });
  }
};

// @desc    Update announcement (Admin)
// @route   PUT /api/announcements/:id
// @access  Private (Admin only)
exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully!',
      data: announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not update announcement',
      error: error.message
    });
  }
};

// @desc    Toggle active status (Admin)
// @route   PUT /api/announcements/:id/toggle
// @access  Private (Admin only)
exports.toggleActive = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    announcement.isActive = !announcement.isActive;
    await announcement.save();

    res.status(200).json({
      success: true,
      message: `Announcement ${announcement.isActive ? 'activated' : 'deactivated'}!`,
      data: announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not toggle announcement',
      error: error.message
    });
  }
};

// @desc    Toggle pinned status (Admin)
// @route   PUT /api/announcements/:id/pin
// @access  Private (Admin only)
exports.togglePinned = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    announcement.isPinned = !announcement.isPinned;
    await announcement.save();

    res.status(200).json({
      success: true,
      message: `Announcement ${announcement.isPinned ? 'pinned' : 'unpinned'}!`,
      data: announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not toggle pin',
      error: error.message
    });
  }
};

// @desc    Delete announcement (Admin)
// @route   DELETE /api/announcements/:id
// @access  Private (Admin only)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully!',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not delete announcement',
      error: error.message
    });
  }
};

// @desc    Get all announcements for admin (includes inactive/expired)
// @route   GET /api/announcements/admin/all
// @access  Private (Admin only)
exports.getAllAnnouncementsAdmin = async (req, res) => {
  try {
    const { type, location, isActive } = req.query;
    const now = new Date();

    const filter = {};
    if (type) filter.type = type;
    if (location) filter.displayLocation = location;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const announcements = await Announcement.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Calculate stats
    const stats = {
      total: await Announcement.countDocuments(),
      active: await Announcement.countDocuments({ isActive: true }),
      inactive: await Announcement.countDocuments({ isActive: false }),
      pinned: await Announcement.countDocuments({ isPinned: true }),
      expired: await Announcement.countDocuments({ 
        endDate: { $lt: now, $ne: null } 
      }),
      scheduled: await Announcement.countDocuments({ 
        startDate: { $gt: now } 
      })
    };

    res.status(200).json({
      success: true,
      count: announcements.length,
      stats,
      data: announcements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch announcements',
      error: error.message
    });
  }
};
