const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true },
  description: String,
  icon: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Prevent duplicate subcategory names within the same category
subcategorySchema.index({ categoryId: 1, name: 1 }, { unique: true });

// Additional query performance indexes
subcategorySchema.index({ isActive: 1 });
subcategorySchema.index({ categoryId: 1 });

module.exports = mongoose.model('Subcategory', subcategorySchema);
