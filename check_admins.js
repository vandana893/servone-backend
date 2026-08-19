const mongoose = require('mongoose');
const env = require('./src/config/env');
const Admin = require('./src/modules/admin/admin.model');

mongoose.connect(env.mongodbUri).then(async () => {
  const admins = await Admin.find({}, 'name email role status');
  console.log('--- ADMINS ---');
  console.log(JSON.stringify(admins, null, 2));
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
