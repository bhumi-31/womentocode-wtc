// ===========================================
// GALLERY CONTROLLER
// ===========================================
// Business logic for Gallery Images
// 
// Public: View images, filter by category/album
// Admin: Add, edit, delete images
// ===========================================

const Gallery = require('../models/Gallery');

// @desc    Get all gallery images
// @route   GET /api/gallery
// @access  Public
exports.getAllImages = async (req, res) => {
  try {
    // Query parameters for filtering
    const { category, album, featured, tag } = req.query;
    
    // Build filter - only show active images to public
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (album) filter.album = album;
    if (featured === 'true') filter.isFeatured = true;
    if (tag) filter.tags = tag;

    const images = await Gallery.find(filter).sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: images.length,
      data: images
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch gallery images',
      error: error.message
    });
  }
};

// @desc    Get single image
// @route   GET /api/gallery/:id
// @access  Public
exports.getImage = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    res.status(200).json({
      success: true,
      data: image
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch image',
      error: error.message
    });
  }
};

// @desc    Get images by album
// @route   GET /api/gallery/album/:albumName
// @access  Public
exports.getAlbum = async (req, res) => {
  try {
    const images = await Gallery.find({ 
      album: req.params.albumName,
      isActive: true 
    }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      album: req.params.albumName,
      count: images.length,
      data: images
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch album',
      error: error.message
    });
  }
};

// @desc    Get all album names
// @route   GET /api/gallery/albums
// @access  Public
exports.getAllAlbums = async (req, res) => {
  try {
    // Get unique album names
    const albums = await Gallery.distinct('album', { 
      album: { $ne: null, $ne: '' },
      isActive: true 
    });

    // Get count for each album
    const albumsWithCount = await Promise.all(
      albums.map(async (albumName) => {
        const count = await Gallery.countDocuments({ album: albumName, isActive: true });
        return { name: albumName, imageCount: count };
      })
    );

    res.status(200).json({
      success: true,
      count: albums.length,
      data: albumsWithCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch albums',
      error: error.message
    });
  }
};

// @desc    Add new image
// @route   POST /api/gallery
// @access  Private (Admin only)
exports.createImage = async (req, res) => {
  try {
    const image = await Gallery.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Image added to gallery!',
      data: image
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not add image',
      error: error.message
    });
  }
};

// @desc    Update image
// @route   PUT /api/gallery/:id
// @access  Private (Admin only)
exports.updateImage = async (req, res) => {
  try {
    const image = await Gallery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Image updated successfully!',
      data: image
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not update image',
      error: error.message
    });
  }
};

// @desc    Delete image
// @route   DELETE /api/gallery/:id
// @access  Private (Admin only)
exports.deleteImage = async (req, res) => {
  try {
    const image = await Gallery.findByIdAndDelete(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully!',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not delete image',
      error: error.message
    });
  }
};

// @desc    Get all images for admin (includes hidden)
// @route   GET /api/gallery/admin/all
// @access  Private (Admin only)
exports.getAllImagesAdmin = async (req, res) => {
  try {
    const { category, album } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (album) filter.album = album;

    const images = await Gallery.find(filter).sort({ order: 1, createdAt: -1 });

    // Stats for admin dashboard
    const stats = {
      total: await Gallery.countDocuments(),
      active: await Gallery.countDocuments({ isActive: true }),
      hidden: await Gallery.countDocuments({ isActive: false }),
      featured: await Gallery.countDocuments({ isFeatured: true })
    };

    res.status(200).json({
      success: true,
      count: images.length,
      stats,
      data: images
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch images',
      error: error.message
    });
  }
};
