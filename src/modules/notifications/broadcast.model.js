const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  target: { type: String, required: true },
  status: { type: String, default: 'Delivered' },
  audience: { type: String, default: '1,200 (Est)' },
  date: { type: String }
}, { timestamps: true });

// Convert _id to id when returned to frontend
broadcastSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Broadcast', broadcastSchema);
