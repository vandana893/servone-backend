require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function fixAdminPasswords() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('admin123', salt);
  const managerHash = await bcrypt.hash('manager123', salt);
  
  await db.collection('admins').updateOne(
    { email: 'admin@servone.com' },
    { $set: { password: adminHash } }
  );
  
  await db.collection('admins').updateOne(
    { email: 'manager@servone.com' },
    { $set: { password: managerHash } }
  );
  
  console.log('Fixed passwords in DB!');
  process.exit(0);
}

fixAdminPasswords();
