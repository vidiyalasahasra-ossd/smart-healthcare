const express = require('express');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const Otp = require('../models/Otp');

const router = express.Router();
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const isProduction = process.env.NODE_ENV === 'production';

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const getTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true' || Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const buildOtp = () => String(Math.floor(Math.random() * 10000)).padStart(4, '0');

const buildOtpResponse = ({ email, otp, delivered }) => {
  const response = {
    message: delivered
      ? `OTP sent successfully to ${email}`
      : `OTP generated for ${email}. Email delivery is unavailable in this environment.`,
    email,
    delivered,
  };

  if (!isProduction && !delivered) {
    response.devOtp = otp;
    response.note = 'Development mode: use the returned OTP directly because email delivery is unavailable.';
  }

  return response;
};

router.post(
  '/send-otp',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const email = normalizeEmail(req.body.email);
      const otp = buildOtp();
      const otpHash = await bcrypt.hash(otp, 10);
      const transporter = getTransporter();

      await Otp.findOneAndUpdate(
        { email },
        {
          email,
          otpHash,
          expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      if (!transporter) {
        if (isProduction) {
          return res.status(500).json({
            message: 'OTP email service is not configured on the server.',
          });
        }

        return res.json(buildOtpResponse({ email, otp, delivered: false }));
      }

      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: email,
          subject: 'Your Smart Health Care OTP',
          text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
        });
      } catch (mailError) {
        console.error('OTP email delivery error:', mailError);

        if (isProduction) {
          return res.status(500).json({ message: 'Failed to send OTP email' });
        }

        return res.json(buildOtpResponse({ email, otp, delivered: false }));
      }

      return res.json(buildOtpResponse({ email, otp, delivered: true }));
    } catch (error) {
      console.error('OTP send error:', error);
      return res.status(500).json({ message: 'Failed to send OTP' });
    }
  }
);

router.post(
  '/verify-otp',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('otp').matches(/^\d{4}$/).withMessage('Valid 4-digit OTP required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp).trim();
    const otpData = await Otp.findOne({ email });

    if (!otpData) {
      return res.status(400).json({ message: 'No OTP found' });
    }

    if (Date.now() > new Date(otpData.expiresAt).getTime()) {
      await Otp.deleteOne({ email });
      return res.status(400).json({ message: 'OTP expired' });
    }

    const isValidOtp = await bcrypt.compare(otp, otpData.otpHash);
    if (!isValidOtp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    return res.json({ message: 'OTP verified successfully' });
  }
);

module.exports = { router };
