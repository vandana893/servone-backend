require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../src/modules/admin/admin.model');
const Category = require('../src/modules/catalog/category.model');
const Subcategory = require('../src/modules/catalog/subcategory.model');
const Service = require('../src/modules/catalog/service.model');
const bcrypt = require('bcryptjs');

const taxonomy = [
  {
    name: 'Home Services',
    description: 'Plumbing, Electrical, Cleaning, AC, Appliances and more',
    subcategories: [
      { name: 'Plumbing', services: ['Tap & Faucet Repair', 'Pipe Leakage Repair', 'Water Tank Installation/Repair', 'Bathroom Plumbing', 'Kitchen Plumbing', 'Drainage & Blockage Removal', 'Toilet Repair', 'Motor/Pump Repair', 'New Plumbing Installation', 'Emergency Plumbing'] },
      { name: 'Electrical', services: ['Switch & Socket Repair', 'Fan Installation/Repair', 'Light Installation', 'Wiring Repair', 'MCB/Fuse Repair', 'Meter/Power Issue Assistance', 'Inverter Installation/Repair', 'Geyser Electrical Repair', 'New Electrical Installation', 'Emergency Electrician'] },
      { name: 'Carpentry', services: ['Door Repair', 'Door Lock/Fitting', 'Furniture Repair', 'Bed Repair', 'Table/Chair Repair', 'Cupboard Repair', 'Wood Polishing', 'Modular Furniture Work', 'Curtain/Rod Installation', 'Custom Carpentry'] },
      { name: 'Painting', services: ['Room Painting', 'House Exterior Painting', 'Wall Texture', 'Putty Work', 'Waterproof Painting', 'Door/Window Painting', 'Commercial Painting', 'Touch-up Painting', 'Colour Consultation'] },
      { name: 'Cleaning', services: ['Home Deep Cleaning', 'Bathroom Cleaning', 'Kitchen Cleaning', 'Sofa Cleaning', 'Carpet Cleaning', 'Water Tank Cleaning', 'Floor Cleaning', 'Move-in/Move-out Cleaning', 'Office Cleaning', 'Post-Construction Cleaning'] },
      { name: 'AC & Cooler', services: ['AC Service', 'AC Repair', 'AC Installation', 'AC Uninstallation', 'AC Gas Refill', 'AC Cleaning', 'Cooler Repair', 'Cooler Service', 'Cooler Installation', 'Cooler Pump/Pad Replacement'] },
      { name: 'RO & Water Purifier', services: ['RO Service', 'RO Repair', 'Filter Replacement', 'Membrane Replacement', 'RO Installation', 'RO Uninstallation', 'Water Purifier Cleaning', 'Water Quality Check'] },
      { name: 'Appliance Repair', services: ['Refrigerator Repair', 'Washing Machine Repair', 'Microwave Repair', 'Geyser Repair', 'TV Repair', 'Chimney Repair', 'Induction/Cooktop Repair', 'Mixer/Grinder Repair', 'Water Heater Repair', 'Other Appliance Repair'] },
      { name: 'Home Maintenance', services: ['Pest Control', 'Waterproofing', 'Roof Repair', 'Tile Repair', 'Masonry Work', 'Glass Work', 'Mosquito Control', 'Home Inspection', 'General Handyman', 'Home Renovation Assistance'] }
    ]
  },
  {
    name: 'Personal & Lifestyle',
    description: 'Salon, Beauty, Barber, Massage, Wellness, Laundry',
    subcategories: [
      { name: 'Salon & Beauty', services: ['Women\'s Haircut', 'Men\'s Haircut', 'Hair Styling', 'Hair Colour', 'Facial', 'Cleanup', 'Waxing', 'Manicure', 'Pedicure', 'Makeup', 'Bridal Makeup', 'Party Makeup', 'Threading', 'Hair Spa'] },
      { name: 'Barber', services: ['Haircut', 'Beard Trim', 'Shaving', 'Hair Styling', 'Head Massage', 'Kids Haircut', 'Home Barber Visit'] },
      { name: 'Massage & Wellness', services: ['Head Massage', 'Body Massage', 'Foot Massage', 'Relaxation Therapy', 'Wellness Session', 'Home Wellness Visit'] },
      { name: 'Laundry', services: ['Wash & Fold', 'Dry Cleaning', 'Ironing', 'Steam Ironing', 'Blanket/Quilt Cleaning', 'Curtain Cleaning', 'Pickup & Delivery'] }
    ]
  },
  {
    name: 'Healthcare',
    description: 'Doctor, Nursing, Lab, Medicine, Ambulance',
    subcategories: [
      { name: 'Doctor Consultation', services: ['General Physician', 'Pediatric Consultation', 'Women’s Health Consultation', 'Senior Citizen Consultation', 'Specialist Consultation', 'Teleconsultation', 'Home Visit Doctor'] },
      { name: 'Nursing & Home Care', services: ['Home Nurse', 'Elder Care', 'Patient Attendant', 'Post-Surgery Care', 'Injection/IV Assistance', 'Wound/Dressing Assistance', 'Physiotherapy at Home', 'Caregiver Booking'] },
      { name: 'Lab & Diagnostics', services: ['Blood Test', 'Urine Test', 'Health Package', 'Diabetes Test', 'Thyroid Test', 'Home Sample Collection', 'Diagnostic Test Booking', 'Report Collection/Delivery'] },
      { name: 'Medicine Services', services: ['Medicine Delivery', 'Prescription Pickup', 'Medicine Refill Assistance', 'Pharmacy Pickup', 'Health Product Delivery'] },
      { name: 'Ambulance & Emergency', services: ['Basic Ambulance', 'Advanced Ambulance', 'Patient Transfer', 'Hospital Transfer', 'Emergency Transport Assistance'] },
      { name: 'Home Healthcare', services: ['Medical Equipment Rental', 'Oxygen Equipment Assistance', 'Hospital Bed Rental', 'Wheelchair Rental', 'Home Monitoring', 'Post-Hospital Care'] }
    ]
  },
  {
    name: 'Agriculture / Rural',
    description: 'Tractor, Farm Equipment, Labour, Seeds, Fertilizer',
    subcategories: [
      { name: 'Tractor & Machinery', services: ['Tractor Booking', 'Tractor Rental', 'Rotavator Rental', 'Harvester Booking', 'JCB/Excavator Booking', 'Thresher Rental', 'Sprayer Rental', 'Farm Machinery Rental'] },
      { name: 'Farm Equipment', services: ['Seed Drill', 'Cultivator', 'Plough', 'Sprayer', 'Pump Set', 'Drip Equipment', 'Irrigation Equipment', 'Harvesting Equipment', 'Equipment Repair'] },
      { name: 'Agricultural Labour', services: ['Farm Labour Booking', 'Sowing Labour', 'Harvesting Labour', 'Weeding Labour', 'Spraying Labour', 'Loading/Unloading Labour', 'Seasonal Labour Teams'] },
      { name: 'Irrigation Services', services: ['Pump Repair', 'Borewell Assistance', 'Pipe Installation', 'Drip Irrigation Installation', 'Sprinkler Installation', 'Water Tank Setup', 'Irrigation Maintenance'] },
      { name: 'Seeds & Fertilizer', services: ['Seed Delivery', 'Fertilizer Delivery', 'Organic Fertilizer', 'Pesticide/Farm Input Delivery', 'Crop-specific Input Assistance', 'Agri Input Store Discovery'] },
      { name: 'Veterinary', services: ['Veterinary Doctor Booking', 'Cattle Health Visit', 'Livestock Treatment Assistance', 'Vaccination Assistance', 'Animal Medicine Delivery', 'Dairy Animal Care', 'Pet/Farm Animal Consultation'] },
      { name: 'Crop Advisory', services: ['Crop Selection Advice', 'Sowing Advisory', 'Disease Identification', 'Pest Advisory', 'Fertilizer Advisory', 'Irrigation Advisory', 'Harvest Advisory', 'Market/Price Information'] },
      { name: 'Soil Testing', services: ['Soil Sample Pickup', 'Soil Testing Booking', 'Soil Health Report', 'NPK Testing', 'pH Testing', 'Crop Recommendation Based on Soil'] }
    ]
  },
  {
    name: 'Errand & Daily Assistance',
    description: 'Grocery, Pick/Drop, Bills, Queues',
    subcategories: [
      { name: 'Grocery & Essentials', services: ['Grocery Pickup', 'Grocery Delivery', 'Daily Essentials', 'Vegetable/Fruit Pickup', 'Local Shop Pickup'] },
      { name: 'Medicine Pickup', services: ['Prescription Pickup', 'Medicine Store Pickup', 'Urgent Medicine Delivery', 'Medical Item Pickup'] },
      { name: 'Document & Parcel', services: ['Document Pickup', 'Document Drop', 'Local Parcel Delivery', 'Courier Assistance', 'Office Document Delivery'] },
      { name: 'Pick & Drop', services: ['Person Pick & Drop', 'School/College Pick & Drop', 'Airport/Railway Pickup', 'Hospital Pick & Drop', 'Local Item Pickup & Drop', 'Vehicle Pickup/Drop'] },
      { name: 'Bill Payment Assistance', services: ['Electricity Bill', 'Water Bill', 'Mobile Recharge', 'DTH Recharge', 'Gas Bill', 'Other Utility Payments'] },
      { name: 'Shopping Assistance', services: ['Local Shopping', 'Market Shopping', 'Pharmacy Shopping', 'Grocery Shopping', 'Gift Shopping', 'Custom Shopping Request'] },
      { name: 'Queue & Personal Assistance', services: ['Queue Standing', 'Token Collection', 'Appointment Assistance', 'Form Submission Assistance', 'Office Visit Assistance', 'Personal Errand', 'Elderly Errand Assistance'] }
    ]
  },
  {
    name: 'Spiritual Services',
    description: 'Pandit, Pooja, Havan, Muhurat, Astrology',
    subcategories: [
      { name: 'Pandit Booking', services: ['Pandit for Home Pooja', 'Pandit for Temple Pooja', 'Pandit for Ceremony', 'Pandit for Sanskar', 'Pandit for Havan', 'Regional/Language Preference'] },
      { name: 'Pooja', services: ['Griha Pravesh Pooja', 'Satyanarayan Pooja', 'Ganesh Pooja', 'Lakshmi Pooja', 'Durga Pooja', 'Navratri Pooja', 'Festival Pooja', 'General Home Pooja'] },
      { name: 'Havan & Anushthan', services: ['Ganesh Havan', 'Navgraha Havan', 'Mahamrityunjaya Havan', 'Vastu Havan', 'Shanti Havan', 'Special Anushthan'] },
      { name: 'Muhurat', services: ['Griha Pravesh Muhurat', 'Marriage Muhurat', 'Business Opening Muhurat', 'Vehicle Purchase Muhurat', 'Property Purchase Muhurat', 'Other Auspicious Muhurat'] },
      { name: 'Astrology', services: ['Kundli Consultation', 'Kundli Matching', 'Career Astrology', 'Marriage Astrology', 'Business Astrology', 'Horoscope', 'Dosha Consultation', 'Online Astrology'] },
      { name: 'Pooja Samagri', services: ['Pooja Kit', 'Havan Samagri', 'Festival Pooja Kit', 'Diya & Oil', 'Mala & Religious Items', 'Kalash & Pooja Essentials', 'Customized Pooja Samagri Delivery'] }
    ]
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/servone_dev');
    console.log('Connected to MongoDB for seeding full taxonomy...');

    // Warning: we only clear catalog models and admins to not destroy user/booking data in case they ran it in prod (though not recommended)
    await Admin.deleteMany({});
    await Category.deleteMany({});
    await Subcategory.deleteMany({});
    await Service.deleteMany({});

    // 1. Initial Admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    await Admin.create({
      name: 'Super Admin',
      email: 'admin@servone.com',
      phone: '9999999999',
      password: hashedPassword,
      role: 'SuperAdmin',
      permissions: [
        'Dashboard', 'Users', 'Partners', 'PartnerVerification', 'BSPWorkers', 
        'Categories', 'Subcategories', 'Services', 'Bookings', 'SupplierRequests', 
        'Finance', 'Referrals', 'CMS', 'Support', 'Offers', 'Reports', 
        'Notifications', 'Settings', 'Subscriptions'
      ]
    });
    console.log('Admin seeded.');

    // 2. Loop through Taxonomy to create Categories, Subcategories, and Services
    for (const cat of taxonomy) {
      const categoryDoc = await Category.create({ name: cat.name, description: cat.description });
      console.log(`Created Category: ${categoryDoc.name}`);

      for (const sub of cat.subcategories) {
        const subcategoryDoc = await Subcategory.create({ categoryId: categoryDoc._id, name: sub.name });
        
        const serviceDocs = sub.services.map(svcName => ({
          categoryId: categoryDoc._id,
          subcategoryId: subcategoryDoc._id,
          name: svcName,
          pricingModel: svcName.includes('Delivery') || svcName.includes('Pickup') ? 'Fixed' : 'Starting From',
          price: Math.floor(Math.random() * 500) + 100, // random dummy price
          estimatedDuration: '1 hour',
          providerType: 'Any',
          isEmergencyAvailable: svcName.toLowerCase().includes('emergency'),
          serviceAreaRadius: 10,
          averageRating: 0,
          totalReviews: 0,
          variants: [
            { name: 'Standard', price: Math.floor(Math.random() * 500) + 100, description: 'Standard service' }
          ]
        }));

        await Service.insertMany(serviceDocs);
      }
    }

    console.log('Full Taxonomy Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
