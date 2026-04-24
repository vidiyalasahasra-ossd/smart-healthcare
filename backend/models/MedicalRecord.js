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
    attachmentName: {
      type: String,
      trim: true,
      default: '',
    },
    attachmentType: {
      type: String,
      trim: true,
      default: '',
    },
    attachmentData: {
      type: String,
      default: '',
    },
    chainIndex: {
      type: Number,
      default: 0,
      index: true,
    },
    previousHash: {
      type: String,
      default: 'GENESIS',
      trim: true,
    },
    payloadHash: {
      type: String,
      default: '',
      trim: true,
    },
    recordHash: {
      type: String,
      default: '',
      trim: true,
    },
    isChainVerified: {
      type: Boolean,
      default: false,
    },
    lastVerifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

medicalRecordSchema.index({ patient: 1, chainIndex: 1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
