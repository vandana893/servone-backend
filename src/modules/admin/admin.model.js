const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 255 },
  phone: { type: String, required: true, unique: true, trim: true, maxlength: 20 },
  address: { type: String, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['SuperAdmin', 'Manager', 'Support', 'Finance'], default: 'Manager' },
  permissions: [{ 
    type: String, 
    enum: [
      'Dashboard', 'Users', 'Partners', 'PartnerVerification', 'BSPWorkers', 
      'Categories', 'Subcategories', 'Services', 'Bookings', 'SupplierRequests', 
      'Finance', 'Referrals', 'CMS', 'Support', 'Offers', 'Reports', 
      'Notifications', 'Settings', 'Subscriptions'
    ] 
  }],
  
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'], default: 'ACTIVE' }
}, { timestamps: true });

// Exclude sensitive fields in JSON response globally
adminSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

module.exports = mongoose.model('Admin', adminSchema);
