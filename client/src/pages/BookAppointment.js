import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Fade,
  Breadcrumbs,
  Link as MuiLink,
  Avatar,
  Divider,
} from '@mui/material';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { doctorsAPI, appointmentsAPI } from '../services/api';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const BookAppointment = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationMode, setConsultationMode] = useState('video');
  const [formData, setFormData] = useState({
    symptoms: '',
    notes: ''
  });

  useEffect(() => {
    if (!doctor) return;

    const dates = getAvailableDates();
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0].value);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctor]);

  useEffect(() => {
    setSelectedTime('');
  }, [selectedDate]);

  const navigate = useNavigate();
  const { doctorId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await doctorsAPI.getDoctor(doctorId);
        setDoctor(response.data);
      } catch (error) {
        console.error('Error fetching doctor:', error);
        setError('Failed to load doctor information');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select a valid date and time slot');
      return;
    }

    if (!timeSlots.includes(selectedTime)) {
      setError('Selected time slot is not available for the chosen date');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      const appointmentData = {
        doctorId,
        date: selectedDate,
        time: selectedTime,
        mode: consultationMode,
        symptoms: formData.symptoms,
        notes: formData.notes
      };

      const response = await appointmentsAPI.bookAppointment(appointmentData);
      navigate(`/appointment-confirmation/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  // Get available dates for next 14 days where doctor has matching weekday availability
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    const availableDays = (doctor?.availability || []).map(entry => entry.day);

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });

      if (availableDays.includes(weekday)) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        });
      }
    }

    return dates;
  };

  const getSlotsForSelectedDate = () => {
    if (!doctor?.availability || !selectedDate) return [];
    const dateObj = new Date(selectedDate);
    if (Number.isNaN(dateObj.getTime())) return [];
    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const entry = doctor.availability.find(av => av.day === weekday);
    return entry?.slots?.filter(s => s.available).map(s => s.time) || [];
  };

  const timeSlots = getSlotsForSelectedDate();

  const handleBackToProfile = () => {
    navigate(`/doctor/${doctorId}`);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  if (error && !doctor) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
          py: 6,
        }}
      >
        <Container maxWidth="xl">
          <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
        py: 6,
      }}
    >
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ mb: 6 }}>
          <Fade in={true} timeout={1000}>
            <Box>
              {/* Breadcrumbs */}
              <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                sx={{ mb: 3 }}
              >
                <MuiLink
                  component={Link}
                  to="/specializations"
                  sx={{
                    textDecoration: 'none',
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  Specializations
                </MuiLink>
                <MuiLink
                  component={Link}
                  to={`/doctors?specialization=${doctor.specialization}`}
                  sx={{
                    textDecoration: 'none',
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  {doctor.specialization}
                </MuiLink>
                <MuiLink
                  component={Link}
                  to={`/doctor/${doctorId}`}
                  sx={{
                    textDecoration: 'none',
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  Dr. {doctor.name}
                </MuiLink>
                <Typography color="text.primary" fontWeight={600}>
                  Book Appointment
                </Typography>
              </Breadcrumbs>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBackToProfile}
                  sx={{
                    mr: 3,
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main', backgroundColor: 'transparent' }
                  }}
                >
                  Back to Profile
                </Button>
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #2563eb 0%, #ec4899 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Book Your Appointment
                </Typography>
              </Box>

              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 600, lineHeight: 1.6 }}
              >
                Schedule an appointment with Dr. {doctor.name} and take the first step towards better health.
              </Typography>
            </Box>
          </Fade>
        </Box>

        {/* Doctor Info Card */}
        <Fade in={true} timeout={1200}>
          <Card
            sx={{
              background: 'white',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: '20px',
              mb: 4,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
                <Avatar
                  src={doctor.image}
                  sx={{
                    width: 80,
                    height: 80,
                    border: '4px solid',
                    borderColor: 'primary.light',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {doctor.name.charAt(0)}
                  </Typography>
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography
                    variant="h4"
                    component="h2"
                    gutterBottom
                    sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}
                  >
                    Dr. {doctor.name}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      mb: 2
                    }}
                  >
                    {doctor.specialization}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={`₹${doctor.consultationFee}`}
                      sx={{
                        backgroundColor: 'primary.main',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1rem',
                        px: 2,
                        py: 1,
                        borderRadius: '20px',
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {doctor.experience} years experience
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Fade>

        {error && (
          <Fade in={true} timeout={1400}>
            <Alert severity="error" sx={{ borderRadius: '12px', mb: 4 }}>
              {error}
            </Alert>
          </Fade>
        )}

        <Grid container spacing={4}>
          {/* Date Selection */}
          <Grid item xs={12} lg={6}>
            <Fade in={true} timeout={1600}>
              <Card
                sx={{
                  background: 'white',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  borderRadius: '20px',
                  height: '100%',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      display: 'flex',
                      alignItems: 'center',
                      mb: 3
                    }}
                  >
                    <CalendarTodayIcon sx={{ mr: 2, color: 'primary.main' }} />
                    Select Date
                  </Typography>

                  <FormControl fullWidth>
                    <InputLabel sx={{ fontWeight: 600 }}>Choose your preferred date</InputLabel>
                    <Select
                      value={selectedDate}
                      label="Choose your preferred date"
                      onChange={(e) => setSelectedDate(e.target.value)}
                      sx={{
                        borderRadius: '12px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(148, 163, 184, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      {getAvailableDates().map((date) => (
                        <MenuItem key={date.value} value={date.value} sx={{ py: 2 }}>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {date.label.split(',')[0]}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {date.label.split(',')[1]}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          {/* Time Selection */}
          <Grid item xs={12} lg={6}>
            <Fade in={true} timeout={1800}>
              <Card
                sx={{
                  background: 'white',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  borderRadius: '20px',
                  height: '100%',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      display: 'flex',
                      alignItems: 'center',
                      mb: 3
                    }}
                  >
                    <AccessTimeIcon sx={{ mr: 2, color: 'primary.main' }} />
                    Select Time Slot
                  </Typography>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel sx={{ fontWeight: 600 }}>Consultation Mode</InputLabel>
                    <Select
                      value={consultationMode}
                      label="Consultation Mode"
                      onChange={(e) => setConsultationMode(e.target.value)}
                      sx={{
                        borderRadius: '12px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(148, 163, 184, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      <MenuItem value="video">Video Call</MenuItem>
                      <MenuItem value="chat">Chat</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel sx={{ fontWeight: 600 }}>Choose your preferred time</InputLabel>
                    <Select
                      value={selectedTime}
                      label="Choose your preferred time"
                      onChange={(e) => setSelectedTime(e.target.value)}
                      sx={{
                        borderRadius: '12px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(148, 163, 184, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      {timeSlots.map((slot) => (
                        <MenuItem key={slot} value={slot} sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CheckCircleIcon sx={{ mr: 2, color: 'success.main', fontSize: 20 }} />
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {slot}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          {/* Additional Details */}
          <Grid item xs={12}>
            <Fade in={true} timeout={2000}>
              <Card
                sx={{
                  background: 'white',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  borderRadius: '20px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      mb: 3
                    }}
                  >
                    Appointment Details
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Symptoms (Optional)"
                        name="symptoms"
                        multiline
                        rows={4}
                        value={formData.symptoms}
                        onChange={handleFormChange}
                        placeholder="Please describe your symptoms, when they started, and any relevant medical history..."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Additional Notes (Optional)"
                        name="notes"
                        multiline
                        rows={4}
                        value={formData.notes}
                        onChange={handleFormChange}
                        placeholder="Any additional information, allergies, medications, or special requirements..."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          {/* Book Button */}
          <Grid item xs={12}>
            <Fade in={true} timeout={2200}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleBookAppointment}
                  disabled={bookingLoading || !selectedDate || !selectedTime}
                  sx={{
                    px: 6,
                    py: 2,
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    borderRadius: '12px',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid rgba(148, 163, 184, 0.35)',
                    boxShadow: '0 8px 22px rgba(15, 23, 42, 0.08)',
                    minWidth: 250,
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                      color: '#0f172a',
                      boxShadow: '0 10px 26px rgba(15, 23, 42, 0.12)',
                      transform: 'translateY(-2px)',
                    },
                    '&:disabled': {
                      backgroundColor: '#e2e8f0',
                      color: '#64748b',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {bookingLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress size={24} sx={{ mr: 2, color: 'white' }} />
                      Booking Appointment...
                    </Box>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              </Box>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default BookAppointment;
