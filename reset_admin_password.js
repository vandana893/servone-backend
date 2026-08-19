const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('./src/config/env');
const Admin = require('./src/modules/admin/admin.model');

mongoose.connect(env.mongodbUri).then(async () => {
  const email = 'admin@servone.com';
  const newPassword = 'admin123';
  
  const admin = await Admin.findOne({ email });
  if (!admin) {
    console.log(`Admin ${email} not found!`);
    process.exit(1);
  }
  
  const salt = await bcrypt.genSalt(10);
  admin.password = await bcrypt.hash(newPassword, salt);
  
  await admin.save();
  console.log(`Password for ${email} has been reset to ${newPassword}`);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
