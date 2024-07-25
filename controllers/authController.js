const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const transporter = require('../config/nodemailer');
const crypto = require('crypto');

// Register user
// exports.register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: 'User already exists' });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create new user
//     const newUser = new User({
//       name,
//       email,
//       password: hashedPassword,
//     });

//     // Save user to database
//     await newUser.save();

//     res.status(201).json({ message: 'User registered successfully' });
//   } catch (error) {
//     console.error('Error registering user:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };
// controllers/authController.js


// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      isVerified: false,
    });

    // Save user to database
    await newUser.save();

    // Send verification email
    const verificationLink = `${process.env.BASE_URL}/verify-email?token=${verificationToken}`;
    const mailOptions = {
      from: `"SchoolConnect" <${process.env.EMAIL_USER}>`, // Ensure a valid "From" address
      to: email,
      subject: 'Verify Your Email',
      html: `<p>Hello ${name},</p><p>Please verify your email by clicking the link below:</p><a href="${verificationLink}">Verify Email</a>`,
    };

    await transporter.sendMail(mailOptions); // Use transporter to send mail

    res.status(201).json({ message: 'User registered successfully. Please check your email to verify your account.' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send password reset email
    const resetLink = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: `"Your App Name" <${process.env.EMAIL_USER}>`, // Ensure a valid "From" address
      to: email,
      subject: 'Password Reset',
      html: `<p>Hello ${user.name},</p><p>You requested a password reset. Please click the link below to reset your password:</p><a href="${resetLink}">Reset Password</a>`,
    };

    await transporter.sendMail(mailOptions);

    res.send('Password reset email sent');
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Login user
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ error: 'Invalid email or password' });
//     }

//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ error: 'Invalid email or password' });
//     }

//     // Generate JWT token
//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//       expiresIn: '1h',
//     });

//     res.json({ token });
//   } catch (error) {
//     console.error('Error logging in user:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Return token and user data
    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
