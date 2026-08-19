
const mongoose = require('mongoose');
const env = require('./src/config/env');
const dashboardService = require('./src/modules/dashboard/dashboard.service');

mongoose.connect(env.mongodbUri).then(async () => {
  try {
    const stats = await dashboardService.getStats();
    console.log('STATS:', stats);

    const funnel = await dashboardService.getFunnel();
    console.log('FUNNEL:', funnel);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
});
