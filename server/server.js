const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection with enhanced error handling
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Options like useNewUrlParser are no longer needed in Mongoose 6+
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Database Name: ${conn.connection.name}`);

    // Debug: List all users to verify persistence
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    console.log(`📊 Total Users in DB: ${userCount}`);
    const debugUsers = await User.find({}, 'email role');
    console.log('👥 Users found:', debugUsers.map(u => `${u.email} (${u.role})`));
  } catch (error) {
    console.error("MongoDB Error:", error.message);
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

// Connect to database before starting server
connectDB().then(() => {
  console.log('\n🚀 Starting Express server...\n');
}).catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/stadiums', require('./routes/stadiums'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/reports', require('./routes/reports'));

app.get('/', (req, res) => {
  res.send('Online Stadium Management System API');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
