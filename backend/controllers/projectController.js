// ===========================================
// PROJECT CONTROLLER
// ===========================================
// Business logic for Projects (CRUD operations)
// ===========================================

const Project = require('../models/Project');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
exports.getAllProjects = async (req, res) => {
  try {
    // Query parameters for filtering
    const { status, category, projectType, featured, technology } = req.query;
    
    // Build filter object
    const filter = { isActive: true };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (projectType) filter.projectType = projectType;
    if (featured === 'true') filter.isFeatured = true;
    if (technology) filter.technologies = technology;

    const projects = await Project.find(filter).sort({ order: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch projects',
      error: error.message
    });
  }
};

// @desc    Get single project by ID or slug
// @route   GET /api/projects/:identifier
// @access  Public
exports.getProject = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is MongoDB ObjectId or slug
    let project;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      // It's an ObjectId
      project = await Project.findById(identifier);
    } else {
      // It's a slug
      project = await Project.findOne({ slug: identifier });
    }

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch project',
      error: error.message
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin only)
exports.createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Project created successfully!',
      data: project
    });
  } catch (error) {
    // Handle duplicate slug
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A project with this title already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Could not create project',
      error: error.message
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin only)
exports.updateProject = async (req, res) => {
  try {
    // If title is being updated, regenerate slug
    if (req.body.title) {
      req.body.slug = req.body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project updated successfully!',
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not update project',
      error: error.message
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin only)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully!',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not delete project',
      error: error.message
    });
  }
};

// @desc    Get projects by category
// @route   GET /api/projects/category/:category
// @access  Public
exports.getProjectsByCategory = async (req, res) => {
  try {
    const projects = await Project.find({ 
      category: req.params.category,
      isActive: true 
    }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch projects',
      error: error.message
    });
  }
};

// @desc    Get featured projects
// @route   GET /api/projects/featured
// @access  Public
exports.getFeaturedProjects = async (req, res) => {
  try {
    const projects = await Project.find({ 
      isFeatured: true,
      isActive: true 
    }).sort({ order: 1 }).limit(6);

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch featured projects',
      error: error.message
    });
  }
};

// @desc    Get all projects for admin (includes hidden)
// @route   GET /api/projects/admin/all
// @access  Private (Admin only)
exports.getAllProjectsAdmin = async (req, res) => {
  try {
    const { category, status } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const projects = await Project.find(filter).sort({ order: 1, createdAt: -1 });

    const stats = {
      total: await Project.countDocuments(),
      completed: await Project.countDocuments({ status: 'completed' }),
      inProgress: await Project.countDocuments({ status: 'in-progress' }),
      featured: await Project.countDocuments({ isFeatured: true })
    };

    res.status(200).json({
      success: true,
      count: projects.length,
      stats,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch projects',
      error: error.message
    });
  }
};
