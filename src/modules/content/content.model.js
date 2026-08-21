const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  type: { type: String, enum: ['BANNER', 'FAQ', 'PAGE', 'POLICY', 'BLOG'], required: true },
  
  // For Banners
  title: String,
  imageUrl: String,
  linkUrl: String,
  
  // For FAQs
  category: String,
  question: String,
  answer: String,
  status: String,
  
  // For Pages/Policies/Blogs
  slug: { type: String, unique: true, sparse: true }, // URL slug
  name: String, // Also used for policy name
  route: String,
  platform: String,
  headline: String,
  subHeadline: String,
  image: String,
  
  content: String, // HTML or Markdown content
  author: String,
  seoTitle: String,
  seoDescription: String,
  seoKeywords: String,
  
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Query performance indexes
contentSchema.index({ type: 1 });
contentSchema.index({ isActive: 1 });
contentSchema.index({ type: 1, isActive: 1 });
contentSchema.index({ displayOrder: 1 });

module.exports = mongoose.model('Content', contentSchema);
