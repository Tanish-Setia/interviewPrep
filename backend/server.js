const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const sanfoundryRoutes = require('./src/routes/sanfoundry');

dotenv.config();

const app = express();

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const allowedOrigins = [
  'http://localhost:3000',  
  'https://interview-prep-a9y7vd6fk-tanishs-projects-9945e9a9.vercel.app',
  'https://interview-prep-kappa-umber.vercel.app'  
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

app.set('trust proxy', 1);

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 100 
});
app.use('/api/', limiter);
app.use('/api/sanfoundry', sanfoundryRoutes);
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/profile', require('./src/routes/profile'));
app.use('/api/resume', require('./src/routes/resume'));
app.use('/api/questions', require('./src/routes/questions'));
app.use('/api/chat', require('./src/routes/chat'));
app.use('/api/subscriptions', require('./src/routes/subscriptions'));
app.use('/api/companies', require('./src/routes/companies'));
app.use('/api/webhooks', require('./src/routes/webhooks'));
app.use('/api/admin', require('./src/routes/admin'));

app.get('/api/health', async (req, res) => {
  const { checkDbHealth, testConnection } = require('./src/utils/dbHealth');
  const dbHealth = checkDbHealth();
  const dbTest = await testConnection();
  
  res.json({ 
    status: dbHealth.isConnected ? 'ok' : 'error',
    message: 'InterviewBit API is running',
    database: {
      status: dbHealth.status,
      connected: dbHealth.isConnected,
      test: dbTest
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/backendEvaluation3';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB:', MONGODB_URI.replace(/\/\/.*@/, '//***@')); 
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    console.error('Make sure MongoDB is running and the connection string is correct');
    console.error('Connection string:', MONGODB_URI.replace(/\/\/.*@/, '//***@'));
    process.exit(1);
  });

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

module.exports = app;