const express = require('express');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Book appointment (patients only)
router.post('/', auth, requireRole(['patient']), async (req, res) => {
  try {
    const { doctorId, date, time, mode, symptoms, notes } = req.body;

    // Check if slot is available
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if appointment already exists for this slot
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      time,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Slot already booked' });
    }

    const appointment = new Appointment({
      patient: req.user._id,
      doctor: doctorId,
      date: new Date(date),
      time,
      mode: mode || 'video',
      symptoms,
      notes
    });

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization');

    res.status(201).json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get appointments for current user
router.get('/', auth, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      // Find doctor's appointments
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (doctor) {
        query.doctor = doctor._id;
      } else {
        return res.json([]);
      }
    } else if (req.user.role === 'admin') {
      // Admin can see all appointments
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization')
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin add meeting info / message (admin only)
router.put('/:id/admin', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { meetingId, adminMessage, chatApproved } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.mode === 'chat') {
      appointment.meetingId = undefined;
    } else if (meetingId !== undefined) {
      appointment.meetingId = meetingId;
    }

    if (adminMessage !== undefined) appointment.adminMessage = adminMessage;
    if (typeof chatApproved === 'boolean') {
      appointment.chatApproved = chatApproved;
      if (chatApproved && appointment.mode === 'chat') {
        appointment.status = 'confirmed';
      }
    }

    if (appointment.status === 'pending' && appointment.mode !== 'chat') {
      appointment.status = 'confirmed';
    }

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization');

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add chat message to appointment (doctors/patients/admin)
router.post('/:id/chat', auth, async (req, res) => {
  try {
    const { text, recipient } = req.body;
    const normalizedText = typeof text === 'string' ? text.trim() : '';

    if (!normalizedText) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    if (!['admin', 'doctor', 'patient'].includes(recipient)) {
      return res.status(400).json({ message: 'Valid recipient is required' });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    let sender;
    if (req.user.role === 'admin') sender = 'admin';
    else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor || doctor._id.toString() !== normalizeId(appointment.doctor)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      sender = 'doctor';
    } else if (req.user.role === 'patient') {
      if (normalizeId(appointment.patient) !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      sender = 'patient';
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (sender === recipient) {
      return res.status(400).json({ message: 'Sender and recipient cannot be the same' });
    }

    const isWithinBookedTime = () => {
      const now = new Date();
      const appointmentDate = new Date(appointment.date);

      const [startTime, endTime] = (appointment.time || '').split('-');
      if (!startTime || !endTime) return false;

      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      if ([startHour, startMinute, endHour, endMinute].some((v) => Number.isNaN(v))) return false;

      const startDateTime = new Date(appointmentDate);
      startDateTime.setHours(startHour, startMinute, 0, 0);

      const endDateTime = new Date(appointmentDate);
      endDateTime.setHours(endHour, endMinute, 0, 0);

      return now >= startDateTime && now <= endDateTime;
    };

    const validatePatientDoctorChat = () => {
      if (appointment.mode !== 'chat') {
        return { ok: false, message: 'Doctor-patient chat is available only for chat-mode appointments' };
      }
      if (!appointment.chatApproved) {
        return { ok: false, message: 'Chat not approved yet' };
      }
      if (appointment.status !== 'confirmed') {
        return { ok: false, message: 'Chat is allowed only for confirmed appointments' };
      }
      if (!isWithinBookedTime()) {
        return { ok: false, message: 'Chat is only allowed during the booked appointment time' };
      }
      return { ok: true };
    };

    if (sender === 'patient') {
      if (recipient === 'doctor') {
        const validation = validatePatientDoctorChat();
        if (!validation.ok) return res.status(403).json({ message: validation.message });
      } else if (recipient === 'admin') {
        const canPatientMessageAdmin =
          appointment.adminInitiatedPatientChat || appointment.patientAdminChatRequestStatus === 'approved';
        if (!canPatientMessageAdmin) {
          return res.status(403).json({ message: 'Admin chat request is not approved yet' });
        }
      } else {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    if (sender === 'doctor') {
      if (recipient === 'patient') {
        const validation = validatePatientDoctorChat();
        if (!validation.ok) return res.status(403).json({ message: validation.message });
      } else if (recipient !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    if (sender === 'admin') {
      if (!['patient', 'doctor'].includes(recipient)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      if (recipient === 'patient') {
        appointment.adminInitiatedPatientChat = true;
        if (appointment.patientAdminChatRequestStatus !== 'approved') {
          appointment.patientAdminChatRequestStatus = 'approved';
        }
      }
    }

    appointment.chatMessages.push({ sender, recipient, text: normalizedText });
    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization');

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Patient requests admin chat access
router.post('/:id/chat/request-admin', auth, requireRole(['patient']), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const patientId = appointment.patient?._id ? appointment.patient._id.toString() : appointment.patient.toString();
    if (patientId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (appointment.adminInitiatedPatientChat || appointment.patientAdminChatRequestStatus === 'approved') {
      return res.status(400).json({ message: 'Admin chat is already enabled' });
    }

    appointment.patientAdminChatRequestStatus = 'pending';
    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization');

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin approves/rejects patient admin-chat request
router.put('/:id/chat/request-admin', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { approve } = req.body;
    if (typeof approve !== 'boolean') {
      return res.status(400).json({ message: 'approve must be boolean' });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.patientAdminChatRequestStatus = approve ? 'approved' : 'rejected';
    if (approve) {
      appointment.adminInitiatedPatientChat = true;
    }
    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization');

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update appointment status (doctors and admin)
router.put('/:id/status', auth, requireRole(['doctor', 'admin']), async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user is the doctor for this appointment or admin
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor || doctor._id.toString() !== appointment.doctor.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    appointment.status = status;
    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization');

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel appointment (patients and doctors)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user is the patient or doctor for this appointment
    let canCancel = false;

    if (req.user.role === 'patient' && appointment.patient.toString() === req.user._id.toString()) {
      canCancel = true;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (doctor && doctor._id.toString() === appointment.doctor.toString()) {
        canCancel = true;
      }
    } else if (req.user.role === 'admin') {
      canCancel = true;
    }

    if (!canCancel) {
      return res.status(403).json({ message: 'Access denied' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization');

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
    const normalizeId = (value) => (value && value._id ? value._id.toString() : value?.toString());
