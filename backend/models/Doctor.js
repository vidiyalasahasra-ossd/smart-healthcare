const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  specialization: {
    type: String,
    required: true,
    enum: ['Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Psychiatry', 'Radiology', 'Surgery', 'Urology', 'Gynecology', 'Ophthalmology', 'ENT', 'Dentistry', 'General Medicine']
  },
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  qualification: {
    type: String,
    required: true,
    trim: true
  },
  about: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: '/default-doctor.jpg'
  },
  ratings: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    slots: [{
      time: String, // e.g., "09:00-10:00"
      available: {
        type: Boolean,
        default: true
      }
    }]
  }],
  consultationFee: {
    type: Number,
    default: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);