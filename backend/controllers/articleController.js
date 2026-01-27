// ===========================================
// ARTICLE CONTROLLER
// ===========================================
// Business logic for Articles/Blog
// 
// Public: View published articles
// Admin: Create, edit, publish, delete
// ===========================================

const Article = require('../models/Article');

// @desc    Get all published articles
// @route   GET /api/articles
// @access  Public
exports.getPublishedArticles = async (req, res) => {
  try {
    const { category, tag, featured, limit } = req.query;

    // Build filter - only published articles
    const filter = { 
      status: 'published',
      isActive: true,
      publishedAt: { $lte: new Date() }
    };

    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (featured === 'true') filter.isFeatured = true;

    let query = Article.find(filter)
      .populate('author', 'name email')
      .sort({ publishedAt: -1 });

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const articles = await query;

    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch articles',
      error: error.message
    });
  }
};

// @desc    Get single article by ID or slug
// @route   GET /api/articles/:identifier
// @access  Public
exports.getArticle = async (req, res) => {
  try {
    const { identifier } = req.params;

    let article;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      article = await Article.findById(identifier)
        .populate('author', 'name email')
        .populate('relatedArticles', 'title slug featuredImage excerpt');
    } else {
      article = await Article.findOne({ slug: identifier })
        .populate('author', 'name email')
        .populate('relatedArticles', 'title slug featuredImage excerpt');
    }

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Increment view count
    article.viewCount += 1;
    await article.save();

    res.status(200).json({
      success: true,
      data: article
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch article',
      error: error.message
    });
  }
};

// @desc    Get articles by category
// @route   GET /api/articles/category/:category
// @access  Public
exports.getByCategory = async (req, res) => {
  try {
    const articles = await Article.find({
      category: req.params.category,
      status: 'published',
      isActive: true
    })
    .populate('author', 'name')
    .sort({ publishedAt: -1 });

    res.status(200).json({
      success: true,
      category: req.params.category,
      count: articles.length,
      data: articles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch articles',
      error: error.message
    });
  }
};

// @desc    Get articles by tag
// @route   GET /api/articles/tag/:tag
// @access  Public
exports.getByTag = async (req, res) => {
  try {
    const articles = await Article.find({
      tags: req.params.tag,
      status: 'published',
      isActive: true
    })
    .populate('author', 'name')
    .sort({ publishedAt: -1 });

    res.status(200).json({
      success: true,
      tag: req.params.tag,
      count: articles.length,
      data: articles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch articles',
      error: error.message
    });
  }
};

// @desc    Get featured articles
// @route   GET /api/articles/featured
// @access  Public
exports.getFeatured = async (req, res) => {
  try {
    const articles = await Article.find({
      isFeatured: true,
      status: 'published',
      isActive: true
    })
    .populate('author', 'name')
    .sort({ publishedAt: -1 })
    .limit(5);

    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch featured articles',
      error: error.message
    });
  }
};

// @desc    Get recent articles
// @route   GET /api/articles/recent
// @access  Public
exports.getRecent = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const articles = await Article.find({
      status: 'published',
      isActive: true
    })
    .select('title slug excerpt featuredImage publishedAt readTime category')
    .sort({ publishedAt: -1 })
    .limit(limit);

    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch recent articles',
      error: error.message
    });
  }
};

// @desc    Search articles
// @route   GET /api/articles/search
// @access  Public
exports.searchArticles = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const articles = await Article.find({
      status: 'published',
      isActive: true,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ]
    })
    .select('title slug excerpt featuredImage publishedAt category')
    .sort({ publishedAt: -1 });

    res.status(200).json({
      success: true,
      query: q,
      count: articles.length,
      data: articles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not search articles',
      error: error.message
    });
  }
};

// @desc    Like an article
// @route   PUT /api/articles/:id/like
// @access  Public
exports.likeArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $inc: { likeCount: 1 } },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Article liked!',
      data: { likeCount: article.likeCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not like article',
      error: error.message
    });
  }
};

// @desc    Create article (Admin)
// @route   POST /api/articles
// @access  Private (Admin only)
exports.createArticle = async (req, res) => {
  try {
    // Set author
    if (req.user) {
      req.body.author = req.user.id;
      if (!req.body.authorName) {
        req.body.authorName = req.user.name;
      }
    }

    // If publishing now, set publishedAt
    if (req.body.status === 'published' && !req.body.publishedAt) {
      req.body.publishedAt = new Date();
    }

    const article = await Article.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Article created successfully!',
      data: article
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An article with this title already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Could not create article',
      error: error.message
    });
  }
};

// @desc    Update article (Admin)
// @route   PUT /api/articles/:id
// @access  Private (Admin only)
exports.updateArticle = async (req, res) => {
  try {
    // Regenerate slug if title changes
    if (req.body.title) {
      req.body.slug = req.body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // If publishing now, set publishedAt
    if (req.body.status === 'published') {
      const existing = await Article.findById(req.params.id);
      if (existing && existing.status !== 'published') {
        req.body.publishedAt = new Date();
      }
    }

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Article updated successfully!',
      data: article
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not update article',
      error: error.message
    });
  }
};

// @desc    Publish article (Admin)
// @route   PUT /api/articles/:id/publish
// @access  Private (Admin only)
exports.publishArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'published',
        publishedAt: new Date()
      },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Article published!',
      data: article
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not publish article',
      error: error.message
    });
  }
};

// @desc    Unpublish article (make draft) (Admin)
// @route   PUT /api/articles/:id/unpublish
// @access  Private (Admin only)
exports.unpublishArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { status: 'draft' },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Article unpublished (now draft)',
      data: article
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not unpublish article',
      error: error.message
    });
  }
};

// @desc    Toggle featured (Admin)
// @route   PUT /api/articles/:id/feature
// @access  Private (Admin only)
exports.toggleFeatured = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    article.isFeatured = !article.isFeatured;
    await article.save();

    res.status(200).json({
      success: true,
      message: `Article ${article.isFeatured ? 'featured' : 'unfeatured'}!`,
      data: article
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not toggle featured',
      error: error.message
    });
  }
};

// @desc    Delete article (Admin)
// @route   DELETE /api/articles/:id
// @access  Private (Admin only)
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully!',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not delete article',
      error: error.message
    });
  }
};

// @desc    Get all articles for admin (includes drafts)
// @route   GET /api/articles/admin/all
// @access  Private (Admin only)
exports.getAllArticlesAdmin = async (req, res) => {
  try {
    const { status, category } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const articles = await Article.find(filter)
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    const stats = {
      total: await Article.countDocuments(),
      published: await Article.countDocuments({ status: 'published' }),
      draft: await Article.countDocuments({ status: 'draft' }),
      scheduled: await Article.countDocuments({ status: 'scheduled' }),
      featured: await Article.countDocuments({ isFeatured: true }),
      totalViews: await Article.aggregate([
        { $group: { _id: null, total: { $sum: '$viewCount' } } }
      ]).then(r => r[0]?.total || 0)
    };

    res.status(200).json({
      success: true,
      count: articles.length,
      stats,
      data: articles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch articles',
      error: error.message
    });
  }
};

// @desc    Get all categories with count
// @route   GET /api/articles/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Article.aggregate([
      { $match: { status: 'published', isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: categories.map(c => ({ name: c._id, count: c.count }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch categories',
      error: error.message
    });
  }
};

// @desc    Get all tags with count
// @route   GET /api/articles/tags
// @access  Public
exports.getTags = async (req, res) => {
  try {
    const tags = await Article.aggregate([
      { $match: { status: 'published', isActive: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.status(200).json({
      success: true,
      data: tags.map(t => ({ name: t._id, count: t.count }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch tags',
      error: error.message
    });
  }
};
