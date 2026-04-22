const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    recordType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    recordDate: {
      type: Date,
      required: true,
    },
    doctorName: {
      type: String,
      trim: true,
      maxlength: 120,
      default: '',
    },
    hospitalName: {
      type: String,
      trim: true,
      maxlength: 120,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 4000,
      default: '',
    },
    attachmentUrl: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
