import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { appointmentsAPI } from '../services/api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CelebrationIcon from '@mui/icons-material/Celebration';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';

const AppointmentConfirmation = () => {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        // In a real app, you'd have an endpoint to get a single appointment
        // For now, we'll simulate this by getting all appointments and finding the one we need
        const response = await appointmentsAPI.getAppointments();
        const foundAppointment = response.data.find(apt => apt._id === appointmentId);
        if (foundAppointment) {
          setAppointment(foundAppointment);
        } else {
          setError('Appointment not found');
        }
      } catch (error) {
        console.error('Error fetching appointment:', error);
        setError('Failed to load appointment details');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  const handleGoToDashboard = () => {
    navigate('/patient-dashboard');
  };

  const handleBookAnother = () => {
    navigate('/specializations');
  };

  const handleBackToHome = () => {
    navigate('/');
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

  if (error || !appointment) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
          py: 6,
        }}
      >
        <Container maxWidth="xl">
          <Alert severity="error" sx={{ borderRadius: '12px' }}>{error || 'Appointment not found'}</Alert>
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
                  to="/"
                  sx={{
                    textDecoration: 'none',
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  Home
                </MuiLink>
                <Typography color="text.primary" fontWeight={600}>
                  Appointment Confirmation
                </Typography>
              </Breadcrumbs>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBackToHome}
                  sx={{
                    mr: 3,
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main', backgroundColor: 'transparent' }
                  }}
                >
                  Back to Home
                </Button>
              </Box>
            </Box>
          </Fade>
        </Box>

        {/* Success Message */}
        <Fade in={true} timeout={1200}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Zoom in={true} timeout={1400}>
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '50%',
                  width: 120,
                  height: 120,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 4,
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 60, color: 'white' }} />
              </Box>
            </Zoom>

            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 800,
                mb: 3,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Appointment Booked Successfully!
            </Typography>

            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.6, mb: 2 }}
            >
              Your appointment has been confirmed. You will receive a confirmation email and SMS shortly.
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <CelebrationIcon sx={{ color: 'warning.main' }} />
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                We're excited to help you on your journey to better health!
              </Typography>
              <CelebrationIcon sx={{ color: 'warning.main' }} />
            </Box>
          </Box>
        </Fade>

        {/* Appointment Details Card */}
        <Fade in={true} timeout={1600}>
          <Card
            sx={{
              background: 'white',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              mb: 4,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  textAlign: 'center',
                  mb: 4
                }}
              >
                Appointment Details
              </Typography>

              <Grid container spacing={4}>
                {/* Doctor Info */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 3, backgroundColor: 'grey.50', borderRadius: '16px', height: '100%' }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        display: 'flex',
                        alignItems: 'center',
                        mb: 3
                      }}
                    >
                      <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                      Doctor Information
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        Dr. {appointment.doctor.name}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocalHospitalIcon sx={{ mr: 2, color: 'text.secondary' }} />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {appointment.doctor.specialization}
                      </Typography>
                    </Box>

                    <Chip
                      label={`â‚¹${appointment.doctor.consultationFee}`}
                      sx={{
                        backgroundColor: 'primary.main',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        px: 2,
                        py: 1,
                      }}
                    />
                  </Box>
                </Grid>

                {/* Appointment Info */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 3, backgroundColor: 'grey.50', borderRadius: '16px', height: '100%' }}>
                    <Typography
                      variant="h6"
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
                      Appointment Schedule
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <CalendarTodayIcon sx={{ mr: 2, color: 'success.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Date
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {new Date(appointment.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <AccessTimeIcon sx={{ mr: 2, color: 'success.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Time
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {appointment.time}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Status
                        </Typography>
                        <Chip
                          label={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          sx={{
                            backgroundColor: appointment.status === 'confirmed' ? 'success.main' : 'warning.main',
                            color: 'white',
                            fontWeight: 700,
                            mt: 1,
                          }}
                        />
                      </Box>

                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Appointment ID
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            backgroundColor: 'grey.200',
                            px: 2,
                            py: 1,
                            borderRadius: '8px',
                            mt: 1
                          }}
                        >
                          {appointment._id.slice(-8).toUpperCase()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                {/* Additional Details */}
                {(appointment.symptoms || appointment.notes) && (
                  <Grid item xs={12}>
                    <Box sx={{ p: 3, backgroundColor: 'grey.50', borderRadius: '16px' }}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                          mb: 3
                        }}
                      >
                        Additional Information
                      </Typography>

                      {appointment.symptoms && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                            Symptoms
                          </Typography>
                          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                            {appointment.symptoms}
                          </Typography>
                        </Box>
                      )}

                      {appointment.notes && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                            Additional Notes
                          </Typography>
                          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                            {appointment.notes}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Fade>

        {/* Important Notice */}
        <Fade in={true} timeout={1800}>
          <Alert
            severity="info"
            sx={{
              borderRadius: '12px',
              py: 3,
              mb: 4,
              '& .MuiAlert-icon': {
                fontSize: '2rem'
              }
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Important Reminders
            </Typography>
            <Typography variant="body1">
              â€¢ Please arrive 15 minutes before your appointment time<br />
              â€¢ Bring any relevant medical records, test results, or previous prescriptions<br />
              â€¢ If you need to reschedule or cancel, please contact us at least 24 hours in advance<br />
              â€¢ For emergencies, please call our emergency hotline immediately
            </Typography>
          </Alert>
        </Fade>

        {/* Action Buttons */}
        <Fade in={true} timeout={2000}>
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleGoToDashboard}
              startIcon={<HomeIcon />}
              sx={{
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563eb 0%, #ec4899 100%)',
                boxShadow: 'none',
                minWidth: 200,
                '&:hover': {
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #db2777 100%)',
                  boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              View My Appointments
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={handleBookAnother}
              startIcon={<AddIcon />}
              sx={{
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: '12px',
                borderColor: 'primary.main',
                color: 'primary.main',
                minWidth: 200,
                '&:hover': {
                  borderColor: 'primary.dark',
                  backgroundColor: 'primary.light',
                  color: 'primary.dark',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(37, 99, 235, 0.15)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Book Another Appointment
            </Button>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default AppointmentConfirmation;
