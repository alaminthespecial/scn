const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: 'https://sc-dun.vercel.app/', // Update with your frontend URL
  methods: 'GET,POST,PUT,DELETE',
  credentials: true,
}));

// Middleware to parse JSON
app.use(express.json());

// Use the authentication routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
