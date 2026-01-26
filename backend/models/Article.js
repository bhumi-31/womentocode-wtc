// ===========================================
// ARTICLE MODEL
// ===========================================
// This defines what an "Article" (blog post) looks like.
// 
// Articles are blog posts, news, tutorials:
// - Title, content, author
// - Categories, tags
// - Draft/Published status
// - Featured image
// ===========================================

const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: [true, 'Article title is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true
    // URL-friendly: "how-to-learn-coding" 
  },
  content: {
    type: String,
    required: [true, 'Content is required']
    // Full article content (can be HTML or Markdown)
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
    // Short preview for cards/listings
  },
  featuredImage: {
    type: String
    // Main image for the article
  },

  // Author
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  authorName: {
    type: String
    // Fallback if author not linked
  },
  authorBio: {
    type: String
  },
  authorImage: {
    type: String
  },

  // Categorization
  category: {
    type: String,
    enum: ['technology', 'career', 'tutorials', 'news', 'events', 'success-stories', 'tips', 'other'],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true
    // ["javascript", "beginners", "web-development"]
  }],

  // Status & Visibility
  status: {
    type: String,
    enum: ['draft', 'published', 'scheduled', 'archived'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
    // Featured articles shown prominently
  },

  // Scheduling
  publishedAt: {
    type: Date
    // When article was/will be published
  },
  scheduledFor: {
    type: Date
    // For scheduled posts
  },

  // SEO
  metaTitle: {
    type: String
    // Custom title for search engines
  },
  metaDescription: {
    type: String
    // Custom description for search engines
  },
  metaKeywords: [{
    type: String
  }],

  // Engagement
  viewCount: {
    type: Number,
    default: 0
  },
  likeCount: {
    type: Number,
    default: 0
  },
  shareCount: {
    type: Number,
    default: 0
  },

  // Reading
  readTime: {
    type: Number
    // Estimated read time in minutes
  },

  // Related
  relatedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],

  // Comments (optional - can enable/disable)
  allowComments: {
    type: Boolean,
    default: true
  },
  commentCount: {
    type: Number,
    default: 0
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-generate slug from title before saving
articleSchema.pre('save', function(next) {
  // Generate slug
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Calculate read time (average 200 words per minute)
  if (this.isModified('content') && this.content) {
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200);
  }

  // Update timestamp
  this.updatedAt = new Date();
  
  next();
});

// Index for faster queries
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ category: 1 });
articleSchema.index({ tags: 1 });

module.exports = mongoose.model('Article', articleSchema);
