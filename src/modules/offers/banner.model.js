const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  position: { type: String, default: 'Custom Position' },
  url: { type: String, default: '/' },
  status: { type: String, enum: ['Live', 'Hidden'], default: 'Live' },
  imgUrl: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
