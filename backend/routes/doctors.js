const express = require('express');
const Doctor = require('../models/Doctor');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all specializations
router.get('/specializations', (req, res) => {
  const specializations = [
    'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 'Pediatrics',
    'Psychiatry', 'Radiology', 'Surgery', 'Urology', 'Gynecology',
    'Ophthalmology', 'ENT', 'Dentistry', 'General Medicine'
  ];
  res.json(specializations);
});

// Get doctors by specialization
router.get('/', async (req, res) => {
  try {
    const { specialization } = req.query;
    let query = {};

    if (specialization) {
      query.specialization = specialization;
    }

    const doctors = await Doctor.find(query)
      .populate('user', 'name email')
      .select('name specialization experience qualification ratings totalReviews image consultationFee availability');

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current doctor's profile (protected)
router.get('/profile/me', auth, requireRole(['doctor']), async (req, res) => {
  try {
    console.log('Getting doctor profile for user ID:', req.user._id);
    console.log('User role:', req.user.role);

    const doctor = await Doctor.findOne({ user: req.user._id })
      .populate('user', 'name email phone');

    console.log('Doctor found:', doctor);

    if (!doctor) {
      console.log('No doctor found for user ID:', req.user._id);
      // Auto-create minimal doctor profile for existing doctor user account
      const newDoctor = new Doctor({
        user: req.user._id,
        name: req.user.name || 'Doctor',
        specialization: 'General Medicine',
        experience: 0,
        qualification: 'Not specified',
        about: '',
        consultationFee: 500
      });
      const created = await newDoctor.save();
      console.log('Created missing doctor profile for user ID:', req.user._id, 'doctor ID:', created._id);
      return res.json(created);
    }

    res.json(doctor);
  } catch (error) {
    console.error('Error getting doctor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'name email phone');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add doctor (admin only)
router.post('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { userId, name, specialization, experience, qualification, about, image, consultationFee } = req.body;

    const doctor = new Doctor({
      user: userId,
      name,
      specialization,
      experience,
      qualification,
      about,
      image,
      consultationFee
    });

    await doctor.save();
    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update doctor (admin or doctor themselves)
router.put('/:id', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if user is admin or the doctor themselves
    if (req.user.role !== 'admin' && doctor.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        doctor[key] = updates[key];
      }
    });

    await doctor.save();
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update doctor availability (doctor only)
router.put('/:id/availability', auth, requireRole(['doctor']), async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (doctor.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    doctor.availability = req.body.availability;
    await doctor.save();

    res.json(doctor.availability);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;