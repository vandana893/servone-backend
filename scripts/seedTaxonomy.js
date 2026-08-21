const mongoose = require('mongoose');
const Category = require('../src/modules/catalog/category.model');
const Subcategory = require('../src/modules/catalog/subcategory.model');
const Service = require('../src/modules/catalog/service.model');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const taxonomy = [
  {
    name: 'Home Services',
    subcategories: [
      {
        name: 'Plumbing',
        services: [
          {
            name: 'Tap & Faucet Repair',
            description: 'Repair for leaking or broken taps',
            pricingModel: 'Fixed',
            price: 199,
          }
        ]
      }
    ]
  },
  {
    name: 'Spiritual Services',
    subcategories: [
      {
        name: 'Pandit Booking',
        services: [
          {
            name: 'Pandit for Home Pooja',
            description: 'Book verified pandits for home rituals',
            pricingModel: 'Fixed',
            price: 501,
          }
        ]
      }
    ]
  },
  {
    name: "Women's Salon",
    subcategories: [
      {
        name: 'Makeup & Styling',
        services: [
          {
            name: 'Bridal Makeup',
            description: 'Complete bridal makeover package',
            pricingModel: 'Quote',
            price: 5000,
          }
        ]
      }
    ]
  },
  {
    name: "Men's Salon",
    subcategories: [
      {
        name: 'Haircut & Styling',
        services: [
          {
            name: 'Standard Haircut',
            description: 'Professional haircut at home',
            pricingModel: 'Fixed',
            price: 199,
          },
          {
            name: 'Barber',
            description: 'Professional barber service at home',
            pricingModel: 'Fixed',
            price: 299,
          }
        ]
      }
    ]
  },
  {
    name: 'Healthcare',
    subcategories: [
      {
        name: 'Doctor Consultation',
        services: [
          {
            name: 'General Physician',
            description: 'Consult a qualified physician',
            pricingModel: 'Fixed',
            price: 499,
          }
        ]
      }
    ]
  },
  {
    name: 'Agriculture',
    subcategories: [
      {
        name: 'Tractor & Machinery',
        services: [
          {
            name: 'Tractor Booking',
            description: 'Book a tractor for farm operations',
            pricingModel: 'Quote',
            price: 1000,
          }
        ]
      }
    ]
  },
  {
    name: 'Errand & Daily Assistance',
    subcategories: [
      {
        name: 'Document & Parcel',
        services: [
          {
            name: 'Document Delivery',
            description: 'Local pickup and drop off',
            pricingModel: 'Quote',
            price: 100,
          }
        ]
      }
    ]
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI not found in .env');
      process.exit(1);
    }
    
    console.log('Connecting to MongoDB...', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected to DB');

    for (const catData of taxonomy) {
      // Upsert Category
      let category = await Category.findOne({ name: catData.name });
      if (!category) {
        console.log(`Creating category: ${catData.name}`);
        category = await Category.create({ name: catData.name, isActive: true });
      } else {
        console.log(`Category exists: ${catData.name}`);
      }

      for (const subData of catData.subcategories) {
        // Upsert Subcategory
        let subcategory = await Subcategory.findOne({ name: subData.name, categoryId: category._id });
        if (!subcategory) {
          console.log(`  Creating subcategory: ${subData.name}`);
          subcategory = await Subcategory.create({
            categoryId: category._id,
            name: subData.name,
            isActive: true
          });
        } else {
          console.log(`  Subcategory exists: ${subData.name}`);
        }

        for (const srvData of subData.services) {
          // Upsert Service
          let service = await Service.findOne({
            name: srvData.name,
            categoryId: category._id,
            subcategoryId: subcategory._id
          });
          if (!service) {
            console.log(`    Creating service: ${srvData.name}`);
            await Service.create({
              categoryId: category._id,
              subcategoryId: subcategory._id,
              name: srvData.name,
              description: srvData.description,
              pricingModel: srvData.pricingModel || 'Fixed',
              price: srvData.price || 0,
              isActive: true,
              variants: [
                { name: 'Standard', price: srvData.price || 0, description: srvData.description }
              ]
            });
          } else {
            console.log(`    Service exists: ${srvData.name}`);
            await Service.findByIdAndUpdate(service._id, {
              description: srvData.description,
              pricingModel: srvData.pricingModel || 'Fixed',
            });
          }
        }
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
