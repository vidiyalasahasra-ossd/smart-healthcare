const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true // e.g., "09:00-10:00"
  },
  mode: {
    type: String,
    enum: ['video', 'chat'],
    default: 'video'
  },
  meetingId: {
    type: String,
    default: ''
  },
  adminMessage: {
    type: String,
    default: ''
  },
  chatMessages: [{
    sender: {
      type: String,
      enum: ['admin', 'doctor', 'patient'],
      required: true
    },
    recipient: {
      type: String,
      enum: ['admin', 'doctor', 'patient'],
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  chatApproved: {
    type: Boolean,
    default: false
  },
  patientAdminChatRequestStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none'
  },
  adminInitiatedPatientChat: {
    type: Boolean,
    default: false
  },
  symptoms: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
