// ===========================================
// PROGRAM CONTROLLER
// ===========================================
// Business logic for Programs (CRUD operations)
// ===========================================

const Program = require('../models/Program');

// @desc    Get all programs
// @route   GET /api/programs
// @access  Public
exports.getAllPrograms = async (req, res) => {
  try {
    // Query parameters for filtering
    const { status, category, level, isFree } = req.query;
    
    // Build filter object
    const filter = { isActive: true };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (isFree === 'true') filter.isFree = true;

    const programs = await Program.find(filter).sort({ startDate: 1 });
    
    res.status(200).json({
      success: true,
      count: programs.length,
      data: programs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch programs',
      error: error.message
    });
  }
};

// @desc    Get single program by ID or slug
// @route   GET /api/programs/:identifier
// @access  Public
exports.getProgram = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is MongoDB ObjectId or slug
    let program;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      // It's an ObjectId
      program = await Program.findById(identifier);
    } else {
      // It's a slug
      program = await Program.findOne({ slug: identifier });
    }

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    res.status(200).json({
      success: true,
      data: program
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch program',
      error: error.message
    });
  }
};

// @desc    Create new program
// @route   POST /api/programs
// @access  Private (Admin only)
exports.createProgram = async (req, res) => {
  try {
    const program = await Program.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Program created successfully!',
      data: program
    });
  } catch (error) {
    // Handle duplicate slug
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A program with this title already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Could not create program',
      error: error.message
    });
  }
};

// @desc    Update program
// @route   PUT /api/programs/:id
// @access  Private (Admin only)
exports.updateProgram = async (req, res) => {
  try {
    // If title is being updated, regenerate slug
    if (req.body.title) {
      req.body.slug = req.body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const program = await Program.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Program updated successfully!',
      data: program
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not update program',
      error: error.message
    });
  }
};

// @desc    Delete program
// @route   DELETE /api/programs/:id
// @access  Private (Admin only)
exports.deleteProgram = async (req, res) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Program deleted successfully!',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not delete program',
      error: error.message
    });
  }
};

// @desc    Get programs by category
// @route   GET /api/programs/category/:category
// @access  Public
exports.getProgramsByCategory = async (req, res) => {
  try {
    const programs = await Program.find({ 
      category: req.params.category,
      isActive: true 
    }).sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: programs.length,
      data: programs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch programs',
      error: error.message
    });
  }
};
