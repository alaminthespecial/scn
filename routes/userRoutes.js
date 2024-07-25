// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware'); // Ensure you have an auth middleware

// Route to get user data
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; // Assume the user ID is extracted from the token in the middleware
    const user = await User.findById(userId).select('-password'); // Exclude password from response
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

