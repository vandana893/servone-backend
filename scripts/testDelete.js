require('dotenv').config();
const mongoose = require('mongoose');
const { deleteCategory } = require('../src/modules/catalog/catalog.service');

async function testDelete() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  try {
    const res = await deleteCategory('6a8820cbb2b7ea6bd47fe551');
    console.log('Success:', res);
  } catch (error) {
    console.error('Error status:', error.status);
    console.error('Error message:', error.message);
  }
  
  process.exit();
}

testDelete();
