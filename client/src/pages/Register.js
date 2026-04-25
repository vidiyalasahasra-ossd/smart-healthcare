import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { otpAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    phone: '',
    // Doctor specific fields
    specialization: '',
    experience: '',
    qualification: '',
    about: ''
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const normalizedEmail = formData.email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError('Email is required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.role === 'doctor') {
      if (!formData.specialization || !formData.experience || !formData.qualification) {
        setError('Please complete all doctor profile fields (specialization, experience, qualification)');
        return;
      }
    }

    setLoading(true);

    // If OTP hasn't been sent yet, request it
    if (!otpSent) {
      try {
        const response = await otpAPI.sendOtp(normalizedEmail);
        const responseMessage = response.data?.message || `OTP sent to ${normalizedEmail}. Please check your inbox.`;
        const devOtpMessage = !response.data?.delivered && response.data?.devOtp
          ? ` OTP for local testing: ${response.data.devOtp}`
          : '';

        setFormData((prev) => ({
          ...prev,
          email: normalizedEmail
        }));
        setOtpSent(true);
        setOtpEmail(normalizedEmail);
        if (!response.data?.delivered && response.data?.devOtp) {
          setOtp(String(response.data.devOtp));
        }
        setSuccess(`${responseMessage}${devOtpMessage}`);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to send OTP. Please check your email address.');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      // Pass OTP directly so the backend can verify it securely
      await register({ ...registerData, email: normalizedEmail, otp });
      navigate(`/${formData.role}-dashboard`);
    } catch (err) {
      const errorMsg = err.response?.data?.message;
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.map((e) => e.msg).join(', '));
      } else if (errorMsg) {
        setError(errorMsg);
        // Allow the user to resend the OTP if it expired or wasn't found
        if (errorMsg === 'OTP expired' || errorMsg === 'No OTP found') {
          setOtpSent(false);
          setOtp('');
          setOtpEmail('');
        }
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Register for Healthcare System
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={formData.name}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            disabled={otpSent}
          />

          <TextField
            margin="normal"
            fullWidth
            id="phone"
            label="Phone Number"
            name="phone"
            autoComplete="tel"
            value={formData.phone}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Register as</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              name="role"
              value={formData.role}
              label="Register as"
              onChange={handleChange}
            >
              <MenuItem value="patient">Patient</MenuItem>
              <MenuItem value="doctor">Doctor</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>

          {formData.role === 'doctor' && (
            <>
              <FormControl fullWidth margin="normal">
                <InputLabel id="specialization-label">Specialization</InputLabel>
                <Select
                  labelId="specialization-label"
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  label="Specialization"
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="Cardiology">Cardiology</MenuItem>
                  <MenuItem value="Dermatology">Dermatology</MenuItem>
                  <MenuItem value="Neurology">Neurology</MenuItem>
                  <MenuItem value="Orthopedics">Orthopedics</MenuItem>
                  <MenuItem value="Pediatrics">Pediatrics</MenuItem>
                  <MenuItem value="Psychiatry">Psychiatry</MenuItem>
                  <MenuItem value="Radiology">Radiology</MenuItem>
                  <MenuItem value="Surgery">Surgery</MenuItem>
                  <MenuItem value="Urology">Urology</MenuItem>
                  <MenuItem value="Gynecology">Gynecology</MenuItem>
                  <MenuItem value="Ophthalmology">Ophthalmology</MenuItem>
                  <MenuItem value="ENT">ENT</MenuItem>
                  <MenuItem value="Dentistry">Dentistry</MenuItem>
                  <MenuItem value="General Medicine">General Medicine</MenuItem>
                </Select>
              </FormControl>

              <TextField
                margin="normal"
                required
                fullWidth
                id="experience"
                label="Years of Experience"
                name="experience"
                type="number"
                value={formData.experience}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                id="qualification"
                label="Qualification (e.g., MD, MBBS)"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
              />

              <TextField
                margin="normal"
                fullWidth
                id="about"
                label="About (Brief description)"
                name="about"
                multiline
                rows={3}
                value={formData.about}
                onChange={handleChange}
                placeholder="Tell patients about your expertise and approach to care..."
              />
            </>
          )}

          {otpSent && (
            <>
              <Alert severity="info" sx={{ mt: 2 }}>
                Enter the OTP sent to {otpEmail || formData.email}.
              </Alert>
              <TextField
                margin="normal"
                required
                fullWidth
                id="otp"
                label="Enter 4-digit OTP"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Check your email for the 4-digit OTP"
                inputProps={{ maxLength: 4, inputMode: 'numeric', pattern: '[0-9]*' }}
                autoFocus
              />
            </>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Processing...' : (otpSent ? 'Verify OTP & Register' : 'Send OTP')}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link href="#" variant="body2" onClick={() => navigate('/login')}>
              {"Already have an account? Sign In"}
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
