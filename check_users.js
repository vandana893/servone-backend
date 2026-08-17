const mongoose = require('mongoose');
const env = require('./src/config/env');
const User = require('./src/modules/users/user.model');

mongoose.connect(env.mongodbUri).then(async () => {
  const users = await User.find({}, 'name email phone role');
  console.log('--- USERS ---');
  console.log(JSON.stringify(users, null, 2));
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
