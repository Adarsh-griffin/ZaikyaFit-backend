const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

// Load environment variables from .env
dotenv.config();

const app = express();

// Middleware
// Enable CORS with specific options
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.json());


// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ Connected to MongoDB successfully!");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

// Routes
const authRoutes = require('./routes/authRoutes');
const bmiRoutes = require('./routes/bmiRoutes');
const userProfileRoutes = require('./routes/UserProfileRoutes'); // MongoDB persistent profile
const spoonacularRoutes = require('./routes/spoonacularRoutes');
//const userPreferences = require ('./routes/userPreferences'); // MongoDB persistent preferences
const geminiRoutes = require('./routes/geminiRoutes');
const visionRoutes = require ('./routes/visionRoutes')



// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/bmi', bmiRoutes);
//app.use('/api/preferences', userPreferences); // Temporary session-based
app.use('/api/user', userProfileRoutes);           //savvvvvvv
app.use('/api/spoonacular', spoonacularRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/vision',visionRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ API is working correctly!' });
});

// Start server
const PORT = process.env.PORT || 5000;
connectDB();
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
