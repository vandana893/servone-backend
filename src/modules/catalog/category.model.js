const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  icon: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

categorySchema.index({ isActive: 1 });

module.exports = mongoose.model('Category', categorySchema);
