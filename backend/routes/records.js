const express = require('express');
const { body, param, validationResult } = require('express-validator');
const MedicalRecord = require('../models/MedicalRecord');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

const recordValidators = [
  body('title').trim().isLength({ min: 2, max: 120 }).withMessage('Title must be between 2 and 120 characters'),
  body('recordType').trim().isLength({ min: 2, max: 60 }).withMessage('Record type is required'),
  body('recordDate').isISO8601().withMessage('Valid record date is required'),
  body('doctorName').optional({ checkFalsy: true }).trim().isLength({ max: 120 }).withMessage('Doctor name is too long'),
  body('hospitalName').optional({ checkFalsy: true }).trim().isLength({ max: 120 }).withMessage('Hospital name is too long'),
  body('notes').optional({ checkFalsy: true }).trim().isLength({ max: 4000 }).withMessage('Notes are too long'),
  body('attachmentUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Attachment URL must be a valid http/https URL'),
];

router.get('/', auth, requireRole(['patient']), async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.user._id }).sort({ recordDate: -1, createdAt: -1 });
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
    });

    await record.save();
    return res.status(201).json(record);
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
        },
        { new: true }
      );

      if (!record) {
        return res.status(404).json({ message: 'Record not found' });
      }

      return res.json(record);
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
      return res.json({ message: 'Record deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to delete record' });
    }
  }
);

module.exports = router;
