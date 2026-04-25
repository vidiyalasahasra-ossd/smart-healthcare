const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Otp = require('../models/Otp');
const { auth } = require('../middleware/auth');

const router = express.Router();

const normalizeEmail = (email = '') => email.trim().toLowerCase();

// Register user
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['patient', 'doctor', 'admin']).withMessage('Invalid role'),
  body('otp').matches(/^\d{4}$/).withMessage('Valid 4-digit OTP is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const email = normalizeEmail(req.body.email);
    const {
      name,
      password,
      role,
      phone,
      specialization,
      experience,
      qualification,
      about,
      otp
    } = req.body;

    // Verify OTP securely on the backend
    const otpData = await Otp.findOne({ email });
    if (!otpData) {
      return res.status(400).json({ message: 'No OTP found' });
    }
    if (Date.now() > new Date(otpData.expiresAt).getTime()) {
      await Otp.deleteOne({ email });
      return res.status(400).json({ message: 'OTP expired' });
    }
    const isValidOtp = await bcrypt.compare(String(otp).trim(), otpData.otpHash);
    if (!isValidOtp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phone
    });

    await user.save();

    // If registering as doctor, create doctor profile
    let doctorProfile = null;
    if (role === 'doctor') {
      console.log('Creating doctor profile for user:', user._id);
      console.log('Doctor data:', { specialization, experience, qualification, about });

      if (!specialization || !experience || !qualification) {
        console.log('Missing required doctor fields');
        // Clean up user if doctor creation fails
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ message: 'Specialization, experience, and qualification are required for doctors' });
      }

      const doctor = new Doctor({
        user: user._id,
        name,
        specialization,
        experience: parseInt(experience),
        qualification,
        about: about || '',
        consultationFee: 500 // Default fee, can be updated later
      });

      doctorProfile = await doctor.save();
      console.log('Doctor profile created successfully:', doctorProfile._id);
    }

    // Clear the OTP once successfully verified and registered
    await Otp.deleteOne({ email });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      doctor: doctorProfile
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').exists().withMessage('Password required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      return res.json(user);
    }
    return res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
