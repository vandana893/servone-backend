require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const Booking = require('./src/modules/bookings/booking.model.js');
    const Category = require('./src/modules/catalog/category.model.js');
    const Service = require('./src/modules/catalog/service.model.js');
    const bookings = await Booking.find().sort({createdAt: -1}).limit(5).populate('serviceId').populate('categoryId');
    console.log(JSON.stringify(bookings, null, 2));
    process.exit();
  })
  .catch(err => { console.error(err); process.exit(1); });
