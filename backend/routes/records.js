const express = require('express');
const { body, param, validationResult } = require('express-validator');
const MedicalRecord = require('../models/MedicalRecord');
const { auth, requireRole } = require('../middleware/auth');
const {
  rebuildPatientRecordChain,
  verifyPatientRecordChain,
} = require('../utils/recordBlockchain');

const router = express.Router();

const recordValidators = [
  body('title').trim().isLength({ min: 2, max: 120 }).withMessage('Title must be between 2 and 120 characters'),
  body('recordType').trim().isLength({ min: 2, max: 60 }).withMessage('Record type is required'),
  body('recordDate').isISO8601().withMessage('Valid record date is required'),
  body('doctorName').optional({ checkFalsy: true }).trim().isLength({ max: 120 }).withMessage('Doctor name is too long'),
  body('hospitalName').optional({ checkFalsy: true }).trim().isLength({ max: 120 }).withMessage('Hospital name is too long'),
  body('notes').optional({ checkFalsy: true }).trim().isLength({ max: 4000 }).withMessage('Notes are too long'),
  body('attachmentName').optional({ checkFalsy: true }).trim().isLength({ max: 255 }).withMessage('Attachment name is too long'),
  body('attachmentType').optional({ checkFalsy: true }).trim().isLength({ max: 120 }).withMessage('Attachment type is too long'),
  body('attachmentData').optional({ checkFalsy: true }).isString().withMessage('Attachment data must be a string'),
];

router.get('/', auth, requireRole(['patient']), async (req, res) => {
  try {
    let records = await MedicalRecord.find({ patient: req.user._id }).sort({ recordDate: -1, createdAt: -1 });
    const requiresInit = records.some((entry) => !entry.recordHash || !entry.chainIndex);

    if (requiresInit) {
      await rebuildPatientRecordChain(req.user._id);
      records = await MedicalRecord.find({ patient: req.user._id }).sort({ recordDate: -1, createdAt: -1 });
    }

    return res.json(records);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch records' });
  }
});

router.post('/', auth, requireRole(['patient']), recordValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const record = new MedicalRecord({
      patient: req.user._id,
      title: req.body.title,
      recordType: req.body.recordType,
      recordDate: req.body.recordDate,
      doctorName: req.body.doctorName || '',
      hospitalName: req.body.hospitalName || '',
      notes: req.body.notes || '',
      attachmentUrl: req.body.attachmentUrl || '',
      attachmentName: req.body.attachmentName || '',
      attachmentType: req.body.attachmentType || '',
      attachmentData: req.body.attachmentData || '',
    });

    await record.save();
    await rebuildPatientRecordChain(req.user._id);
    const created = await MedicalRecord.findById(record._id);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create record' });
  }
});

router.put(
  '/:id',
  auth,
  requireRole(['patient']),
  [param('id').isMongoId().withMessage('Invalid record id'), ...recordValidators],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const record = await MedicalRecord.findOneAndUpdate(
        { _id: req.params.id, patient: req.user._id },
        {
          title: req.body.title,
          recordType: req.body.recordType,
          recordDate: req.body.recordDate,
          doctorName: req.body.doctorName || '',
          hospitalName: req.body.hospitalName || '',
          notes: req.body.notes || '',
          attachmentUrl: req.body.attachmentUrl || '',
          attachmentName: req.body.attachmentName || '',
          attachmentType: req.body.attachmentType || '',
          attachmentData: req.body.attachmentData || '',
        },
        { new: true }
      );

      if (!record) {
        return res.status(404).json({ message: 'Record not found' });
      }

      await rebuildPatientRecordChain(req.user._id);
      const updated = await MedicalRecord.findById(record._id);
      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update record' });
    }
  }
);

router.delete(
  '/:id',
  auth,
  requireRole(['patient']),
  [param('id').isMongoId().withMessage('Invalid record id')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const deleted = await MedicalRecord.findOneAndDelete({ _id: req.params.id, patient: req.user._id });
      if (!deleted) {
        return res.status(404).json({ message: 'Record not found' });
      }
      await rebuildPatientRecordChain(req.user._id);
      return res.json({ message: 'Record deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to delete record' });
    }
  }
);

router.get('/verify-chain', auth, requireRole(['patient']), async (req, res) => {
  try {
    const result = await verifyPatientRecordChain(req.user._id);
    if (!result.ok) {
      return res.status(409).json(result);
    }
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to verify record chain' });
  }
});

module.exports = router;
