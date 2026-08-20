require('dotenv').config();
const mongoose = require('mongoose');

async function checkAdmins() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const admins = await db.collection('admins').find({}).toArray();
  console.log('Admins in DB:', admins.map(a => ({ email: a.email, password: a.password })));
  process.exit(0);
}

checkAdmins();
