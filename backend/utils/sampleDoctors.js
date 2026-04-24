const bcrypt = require('bcryptjs');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

const weekdayAvailability = [
  {
    day: 'Monday',
    slots: [
      { time: '09:00-10:00', available: true },
      { time: '10:00-11:00', available: true },
      { time: '11:00-12:00', available: true },
      { time: '14:00-15:00', available: true },
      { time: '15:00-16:00', available: true },
      { time: '16:00-17:00', available: true },
    ],
  },
  {
    day: 'Tuesday',
    slots: [
      { time: '09:00-10:00', available: true },
      { time: '10:00-11:00', available: true },
      { time: '11:00-12:00', available: true },
      { time: '14:00-15:00', available: true },
      { time: '15:00-16:00', available: true },
      { time: '16:00-17:00', available: true },
    ],
  },
  {
    day: 'Wednesday',
    slots: [
      { time: '09:00-10:00', available: true },
      { time: '10:00-11:00', available: true },
      { time: '11:00-12:00', available: true },
      { time: '14:00-15:00', available: true },
      { time: '15:00-16:00', available: true },
      { time: '16:00-17:00', available: true },
    ],
  },
  {
    day: 'Thursday',
    slots: [
      { time: '09:00-10:00', available: true },
      { time: '10:00-11:00', available: true },
      { time: '11:00-12:00', available: true },
      { time: '14:00-15:00', available: true },
      { time: '15:00-16:00', available: true },
      { time: '16:00-17:00', available: true },
    ],
  },
  {
    day: 'Friday',
    slots: [
      { time: '09:00-10:00', available: true },
      { time: '10:00-11:00', available: true },
      { time: '11:00-12:00', available: true },
      { time: '14:00-15:00', available: true },
      { time: '15:00-16:00', available: true },
      { time: '16:00-17:00', available: true },
    ],
  },
];

const sampleDoctors = [
  {
    name: 'Aarav Mehta',
    email: 'aarav.cardiology@example.com',
    specialization: 'Cardiology',
    experience: 12,
    qualification: 'MD, DM Cardiology',
    about: 'Heart health specialist focusing on prevention, diagnostics, and lifestyle care.',
    consultationFee: 900,
  },
  {
    name: 'Ishita Rao',
    email: 'ishita.dermatology@example.com',
    specialization: 'Dermatology',
    experience: 9,
    qualification: 'MD Dermatology',
    about: 'Treats skin, hair, and nail disorders with modern dermatological care.',
    consultationFee: 700,
  },
  {
    name: 'Rohan Iyer',
    email: 'rohan.neurology@example.com',
    specialization: 'Neurology',
    experience: 14,
    qualification: 'DM Neurology',
    about: 'Focused on brain, nerve, headache, and movement disorder management.',
    consultationFee: 1000,
  },
  {
    name: 'Sneha Kapoor',
    email: 'sneha.orthopedics@example.com',
    specialization: 'Orthopedics',
    experience: 11,
    qualification: 'MS Orthopedics',
    about: 'Bone, joint, sports injury, and rehabilitation specialist.',
    consultationFee: 850,
  },
  {
    name: 'Kabir Sharma',
    email: 'kabir.pediatrics@example.com',
    specialization: 'Pediatrics',
    experience: 8,
    qualification: 'MD Pediatrics',
    about: 'Child health expert for infants, children, and adolescents.',
    consultationFee: 650,
  },
  {
    name: 'Meera Nair',
    email: 'meera.psychiatry@example.com',
    specialization: 'Psychiatry',
    experience: 10,
    qualification: 'MD Psychiatry',
    about: 'Mental health care with a patient-first, evidence-based approach.',
    consultationFee: 800,
  },
  {
    name: 'Arjun Bose',
    email: 'arjun.radiology@example.com',
    specialization: 'Radiology',
    experience: 13,
    qualification: 'MD Radiodiagnosis',
    about: 'Diagnostic imaging specialist for accurate and timely reporting.',
    consultationFee: 750,
  },
  {
    name: 'Nandini Gupta',
    email: 'nandini.surgery@example.com',
    specialization: 'Surgery',
    experience: 15,
    qualification: 'MS General Surgery',
    about: 'General and advanced surgical consultations with strong follow-up care.',
    consultationFee: 1200,
  },
  {
    name: 'Vikram Das',
    email: 'vikram.urology@example.com',
    specialization: 'Urology',
    experience: 10,
    qualification: 'MCh Urology',
    about: 'Kidney, bladder, and urinary tract specialist.',
    consultationFee: 950,
  },
  {
    name: 'Pooja Menon',
    email: 'pooja.gynecology@example.com',
    specialization: 'Gynecology',
    experience: 11,
    qualification: 'MS Obstetrics & Gynecology',
    about: 'Women’s health specialist for preventive and reproductive care.',
    consultationFee: 850,
  },
  {
    name: 'Dev Patel',
    email: 'dev.ophthalmology@example.com',
    specialization: 'Ophthalmology',
    experience: 9,
    qualification: 'MS Ophthalmology',
    about: 'Eye specialist for vision screening, cataracts, and eye care.',
    consultationFee: 800,
  },
  {
    name: 'Ananya Sethi',
    email: 'ananya.ent@example.com',
    specialization: 'ENT',
    experience: 8,
    qualification: 'MS ENT',
    about: 'Ear, nose, and throat specialist for adult and child care.',
    consultationFee: 700,
  },
  {
    name: 'Rahul Jain',
    email: 'rahul.dentistry@example.com',
    specialization: 'Dentistry',
    experience: 7,
    qualification: 'BDS, MDS',
    about: 'Oral health expert for dental care, cleaning, and preventive treatments.',
    consultationFee: 500,
  },
  {
    name: 'Priya Singh',
    email: 'priya.generalmedicine@example.com',
    specialization: 'General Medicine',
    experience: 16,
    qualification: 'MD General Medicine',
    about: 'Primary care physician for diagnosis, medication, and health planning.',
    consultationFee: 600,
  },
];

function cloneAvailability() {
  return weekdayAvailability.map((entry) => ({
    day: entry.day,
    slots: entry.slots.map((slot) => ({ ...slot })),
  }));
}

async function ensureSampleDoctors() {
  const created = [];
  for (const sample of sampleDoctors) {
    let user = await User.findOne({ email: sample.email });
    if (!user) {
      const password = await bcrypt.hash('Password123!', 10);
      user = await User.create({
        name: sample.name,
        email: sample.email,
        password,
        role: 'doctor',
        phone: '',
      });
    }

    let doctor = await Doctor.findOne({ specialization: sample.specialization });
    if (!doctor) {
      doctor = await Doctor.create({
        user: user._id,
        name: sample.name,
        specialization: sample.specialization,
        experience: sample.experience,
        qualification: sample.qualification,
        about: sample.about,
        consultationFee: sample.consultationFee,
        ratings: 4.6,
        totalReviews: 120,
        availability: cloneAvailability(),
      });
      created.push(doctor);
      continue;
    }

    let needsSave = false;
    if (!doctor.availability || doctor.availability.length === 0) {
      doctor.availability = cloneAvailability();
      needsSave = true;
    }
    if (!doctor.about) {
      doctor.about = sample.about;
      needsSave = true;
    }
    if (!doctor.consultationFee) {
      doctor.consultationFee = sample.consultationFee;
      needsSave = true;
    }
    if (!doctor.ratings) {
      doctor.ratings = 4.6;
      needsSave = true;
    }
    if (!doctor.totalReviews) {
      doctor.totalReviews = 120;
      needsSave = true;
    }
    if (doctor.user.toString() !== user._id.toString()) {
      doctor.user = user._id;
      needsSave = true;
    }

    if (needsSave) {
      await doctor.save();
    }
  }

  return created;
}

module.exports = { ensureSampleDoctors, sampleDoctors, cloneAvailability };
