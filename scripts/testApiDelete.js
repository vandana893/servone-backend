require('dotenv').config();
const { generateAccessToken } = require('../src/utils/jwt');
const axios = require('axios');
const mongoose = require('mongoose');
const Admin = require('../src/modules/admin/admin.model');

async function testApiDelete() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const admin = await Admin.findOne({ role: 'SuperAdmin' });
  if (!admin) {
    console.log('No SuperAdmin found');
    process.exit(1);
  }

  const token = generateAccessToken({
    sub: admin._id,
    accountType: 'ADMIN',
    role: admin.role
  });

  console.log('Token generated');

  try {
    // I need a category ID to delete. Let's get one from the API first.
    const getRes = await axios.get('https://servone-backend.onrender.com/api/catalog/categories');
    const categories = getRes.data.data.data;
    if (categories.length === 0) {
      console.log('No categories to delete');
      process.exit();
    }
    
    // Create a dummy category directly in DB to delete
    const Category = require('../src/modules/catalog/category.model');
    const dummy = await Category.create({ name: 'DummyCategoryToTestDelete', description: 'Test', icon: 'test' });
    console.log('Created dummy category:', dummy._id);

    const res = await axios.delete(`https://servone-backend.onrender.com/api/catalog/categories/${dummy._id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Success:', res.data);
  } catch (error) {
    if (error.response) {
      console.error('API Error Status:', error.response.status);
      console.error('API Error Body:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
  
  process.exit();
}

testApiDelete();
