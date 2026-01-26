// ===========================================
// TEAM CONTROLLER
// ===========================================
// This contains all the LOGIC for managing team members.
// 
// Functions:
// - getAllMembers: Get all team members (public)
// - getMember: Get one member by ID (public)
// - createMember: Add new member (admin only)
// - updateMember: Edit a member (admin only)
// - deleteMember: Remove a member (admin only)
// ===========================================

const Team = require('../models/Team');

// ------------------------------------------
// GET ALL MEMBERS
// ------------------------------------------
// GET /api/team
// Public - anyone can view the team
exports.getAllMembers = async (req, res) => {
  try {
    // Find all active members, sorted by 'order' field
    const members = await Team.find({ isActive: true }).sort('order');

    res.status(200).json({
      success: true,
      count: members.length,
      data: members
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch team members',
      error: error.message
    });
  }
};

// ------------------------------------------
// GET SINGLE MEMBER
// ------------------------------------------
// GET /api/team/:id
// Public - anyone can view
exports.getMember = async (req, res) => {
  try {
    const member = await Team.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    res.status(200).json({
      success: true,
      data: member
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch team member',
      error: error.message
    });
  }
};

// ------------------------------------------
// CREATE MEMBER
// ------------------------------------------
// POST /api/team
// Admin only - requires login + admin role
exports.createMember = async (req, res) => {
  try {
    const { name, role, image, bio, socialLinks, order } = req.body;

    const member = await Team.create({
      name,
      role,
      image,
      bio,
      socialLinks,
      order
    });

    res.status(201).json({
      success: true,
      message: 'Team member added successfully!',
      data: member
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not create team member',
      error: error.message
    });
  }
};

// ------------------------------------------
// UPDATE MEMBER
// ------------------------------------------
// PUT /api/team/:id
// Admin only
exports.updateMember = async (req, res) => {
  try {
    let member = await Team.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    // Update with new data
    member = await Team.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
      // new: true = return updated document
      // runValidators: true = check rules (like required fields)
    );

    res.status(200).json({
      success: true,
      message: 'Team member updated successfully!',
      data: member
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not update team member',
      error: error.message
    });
  }
};

// ------------------------------------------
// DELETE MEMBER
// ------------------------------------------
// DELETE /api/team/:id
// Admin only
exports.deleteMember = async (req, res) => {
  try {
    const member = await Team.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    await Team.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Team member deleted successfully!'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not delete team member',
      error: error.message
    });
  }
};
