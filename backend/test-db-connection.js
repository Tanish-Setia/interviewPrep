require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/backendEvaluation3';

console.log('🔍 Testing MongoDB connection...');
console.log('📍 Connection string:', MONGODB_URI.replace(/\/\/.*@/, '//***@'));

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(async () => {
    console.log('Successfully connected to MongoDB!');
    
    try {
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      console.log('Available collections:', collections.map(c => c.name).join(', ') || 'None');
      
      const User = require('./src/models/User');
      const userCount = await User.countDocuments();
      console.log(` Users in database: ${userCount}`);
      
      console.log('\n All tests passed! MongoDB is working correctly.');
      process.exit(0);
    } catch (error) {
      console.error(' Error testing database:', error.message);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error(' Failed to connect to MongoDB!');
    console.error('Error:', error.message);
    console.error('\n Troubleshooting steps:');
    console.error('1. Make sure MongoDB is installed and running');
    console.error('2. Check if MongoDB service is started:');
    console.error('   Windows: net start MongoDB');
    console.error('   Mac/Linux: sudo systemctl start mongod');
    console.error('3. Verify the connection string in .env file');
    console.error('4. Try connecting manually: mongosh "mongodb://localhost:27017"');
    process.exit(1);
  });

