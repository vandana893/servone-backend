const mongoose = require('mongoose');

const triggerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g. 'booking_created'
  name: { type: String, required: true },
  desc: { type: String },
  push: { type: Boolean, default: false },
  sms: { type: Boolean, default: false },
  email: { type: Boolean, default: false },
  whatsapp: { type: Boolean, default: false }
}, { timestamps: true });

// Convert _id to frontend format without exposing __v or _id
triggerSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('NotificationTrigger', triggerSchema);
