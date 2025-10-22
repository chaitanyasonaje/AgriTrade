const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Crop = require('./models/Crop');
const Farmer = require('./models/Farmer');
const Purchase = require('./models/Purchase');
const Sale = require('./models/Sale');
const Expense = require('./models/Expense');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Crop.deleteMany({});
    await Farmer.deleteMany({});
    await Purchase.deleteMany({});
    await Sale.deleteMany({});
    await Expense.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@agritrade.com',
      password: 'admin123',
      role: 'admin'
    });
    await adminUser.save();
    console.log('👤 Created admin user');

    // Create sample crops
    const crops = [
      { cropName: 'MAIZE', unit: 'quintal', description: 'Yellow Maize', marketRate: 2500 },
      { cropName: 'COTTON', unit: 'quintal', description: 'Cotton Seed', marketRate: 6500 },
      { cropName: 'WHEAT', unit: 'quintal', description: 'Wheat Grain', marketRate: 2800 },
      { cropName: 'BAJRA', unit: 'quintal', description: 'Pearl Millet', marketRate: 2200 },
      { cropName: 'SOYBEAN', unit: 'quintal', description: 'Soybean Seed', marketRate: 4500 },
      { cropName: 'SUGARCANE', unit: 'ton', description: 'Sugarcane', marketRate: 3500 }
    ];

    const createdCrops = await Crop.insertMany(crops);
    console.log('🌾 Created sample crops');

    // Create sample farmers
    const farmers = [
      {
        name: 'Ram Singh',
        village: 'Village A',
        contact: '9876543210',
        address: 'Near Temple, Village A',
        notes: 'Regular supplier'
      },
      {
        name: 'Shyam Kumar',
        village: 'Village B',
        contact: '9876543211',
        address: 'Main Road, Village B',
        notes: 'Good quality crops'
      },
      {
        name: 'Mohan Lal',
        village: 'Village C',
        contact: '9876543212',
        address: 'Behind School, Village C',
        notes: 'Bulk supplier'
      },
      {
        name: 'Suresh Patel',
        village: 'Village D',
        contact: '9876543213',
        address: 'Near Market, Village D',
        notes: 'Organic farmer'
      },
      {
        name: 'Rajesh Gupta',
        village: 'Village E',
        contact: '9876543214',
        address: 'Farm House, Village E',
        notes: 'Premium quality'
      }
    ];

    const createdFarmers = await Farmer.insertMany(farmers);
    console.log('👨‍🌾 Created sample farmers');

    // Create sample purchases
    const purchases = [
      {
        crop: createdCrops[0]._id, // Maize
        farmer: createdFarmers[0]._id,
        quantity: 50,
        rate: 2400,
        paymentStatus: 'Paid',
        purchaseDate: new Date('2024-01-15'),
        notes: 'Good quality maize'
      },
      {
        crop: createdCrops[1]._id, // Cotton
        farmer: createdFarmers[1]._id,
        quantity: 30,
        rate: 6300,
        paymentStatus: 'Pending',
        purchaseDate: new Date('2024-01-16'),
        notes: 'Premium cotton'
      },
      {
        crop: createdCrops[2]._id, // Wheat
        farmer: createdFarmers[2]._id,
        quantity: 40,
        rate: 2700,
        paymentStatus: 'Paid',
        purchaseDate: new Date('2024-01-17'),
        notes: 'Fresh wheat'
      },
      {
        crop: createdCrops[0]._id, // Maize
        farmer: createdFarmers[3]._id,
        quantity: 25,
        rate: 2450,
        paymentStatus: 'Paid',
        purchaseDate: new Date('2024-01-18'),
        notes: 'Organic maize'
      },
      {
        crop: createdCrops[4]._id, // Soybean
        farmer: createdFarmers[4]._id,
        quantity: 35,
        rate: 4400,
        paymentStatus: 'Pending',
        purchaseDate: new Date('2024-01-19'),
        notes: 'High protein soybean'
      }
    ];

    const createdPurchases = await Purchase.insertMany(purchases.map(p => ({
      ...p,
      createdBy: adminUser._id
    })));
    console.log('📦 Created sample purchases');

    // Create sample sales
    const sales = [
      {
        crop: createdCrops[0]._id, // Maize
        buyerName: 'ABC Industries',
        vehicleNumber: 'MH12AB1234',
        quantity: 30,
        rate: 2600,
        paymentStatus: 'Paid',
        saleDate: new Date('2024-01-20'),
        notes: 'Bulk order'
      },
      {
        crop: createdCrops[1]._id, // Cotton
        buyerName: 'XYZ Textiles',
        vehicleNumber: 'MH12CD5678',
        quantity: 20,
        rate: 6600,
        paymentStatus: 'Pending',
        saleDate: new Date('2024-01-21'),
        notes: 'Export quality'
      },
      {
        crop: createdCrops[2]._id, // Wheat
        buyerName: 'DEF Mills',
        vehicleNumber: 'MH12EF9012',
        quantity: 25,
        rate: 2900,
        paymentStatus: 'Paid',
        saleDate: new Date('2024-01-22'),
        notes: 'Flour mill order'
      },
      {
        crop: createdCrops[0]._id, // Maize
        buyerName: 'GHI Feed Company',
        vehicleNumber: 'MH12GH3456',
        quantity: 20,
        rate: 2550,
        paymentStatus: 'Paid',
        saleDate: new Date('2024-01-23'),
        notes: 'Animal feed'
      }
    ];

    const createdSales = await Sale.insertMany(sales.map(s => ({
      ...s,
      createdBy: adminUser._id
    })));
    console.log('💰 Created sample sales');

    // Create sample expenses
    const expenses = [
      {
        date: new Date('2024-01-15'),
        category: 'Transport',
        description: 'Truck rental for maize transport',
        amount: 2500,
        crop: createdCrops[0]._id,
        notes: 'Village A to warehouse'
      },
      {
        date: new Date('2024-01-16'),
        category: 'Labor',
        description: 'Loading and unloading charges',
        amount: 1500,
        notes: 'Cotton loading'
      },
      {
        date: new Date('2024-01-17'),
        category: 'Storage',
        description: 'Warehouse rent',
        amount: 3000,
        notes: 'Monthly warehouse rent'
      },
      {
        date: new Date('2024-01-18'),
        category: 'Transport',
        description: 'Fuel charges',
        amount: 2000,
        notes: 'Delivery to buyer'
      },
      {
        date: new Date('2024-01-19'),
        category: 'Other',
        description: 'Miscellaneous expenses',
        amount: 1000,
        notes: 'Office supplies'
      }
    ];

    await Expense.insertMany(expenses.map(e => ({
      ...e,
      createdBy: adminUser._id
    })));
    console.log('💸 Created sample expenses');

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`👤 Users: 1 (admin)`);
    console.log(`🌾 Crops: ${createdCrops.length}`);
    console.log(`👨‍🌾 Farmers: ${createdFarmers.length}`);
    console.log(`📦 Purchases: ${createdPurchases.length}`);
    console.log(`💰 Sales: ${createdSales.length}`);
    console.log(`💸 Expenses: ${expenses.length}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('Email: admin@agritrade.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run seeding
connectDB().then(() => {
  seedData();
});
