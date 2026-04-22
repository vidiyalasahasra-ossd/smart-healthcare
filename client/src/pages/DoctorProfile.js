import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Rating,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  useTheme,
  useMediaQuery,
  Fade,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { doctorsAPI } from '../services/api';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const DoctorProfile = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await doctorsAPI.getDoctor(id);
        setDoctor(response.data);
      } catch (error) {
        console.error('Error fetching doctor:', error);
        setError('Failed to load doctor profile');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  const handleBookAppointment = () => {
    navigate(`/book-appointment/${id}`);
  };

  const handleBackToDoctors = () => {
    navigate(-1);
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

  if (error || !doctor) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
          py: 6,
        }}
      >
        <Container maxWidth="xl">
          <Alert severity="error" sx={{ borderRadius: '12px' }}>{error || 'Doctor not found'}</Alert>
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
                <Typography color="text.primary" fontWeight={600}>
                  Dr. {doctor.name}
                </Typography>
              </Breadcrumbs>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBackToDoctors}
                  sx={{
                    mr: 3,
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main', backgroundColor: 'transparent' }
                  }}
                >
                  Back
                </Button>
              </Box>
            </Box>
          </Fade>
        </Box>

        <Grid container spacing={4}>
          {/* Doctor Info Card */}
          <Grid item xs={12} lg={4}>
            <Fade in={true} timeout={1200}>
              <Card
                sx={{
                  background: 'white',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  borderRadius: '20px',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                  position: 'sticky',
                  top: 24,
                }}
              >
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #ec4899 100%)',
                    height: 120,
                    position: 'relative',
                  }}
                />
                <CardContent sx={{ textAlign: 'center', pt: 0, pb: 4, px: 4 }}>
                  <Avatar
                    src={doctor.image}
                    sx={{
                      width: 120,
                      height: 120,
                      mx: 'auto',
                      mt: -6,
                      mb: 3,
                      border: '6px solid white',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                    }}
                  >
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {doctor.name.charAt(0)}
                    </Typography>
                  </Avatar>

                  <Typography
                    variant="h4"
                    component="h1"
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

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                    <Rating
                      value={doctor.ratings}
                      readOnly
                      precision={0.5}
                      size="medium"
                      sx={{ mr: 1 }}
                    />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {doctor.ratings}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ({doctor.totalReviews} reviews)
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Chip
                      label={`₹${doctor.consultationFee}`}
                      sx={{
                        backgroundColor: 'primary.main',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        px: 3,
                        py: 1.5,
                        borderRadius: '25px',
                        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                      }}
                    />
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleBookAppointment}
                    sx={{
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #2563eb 0%, #ec4899 100%)',
                      boxShadow: 'none',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1d4ed8 0%, #db2777 100%)',
                        boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <CalendarTodayIcon sx={{ mr: 1 }} />
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          {/* Doctor Details */}
          <Grid item xs={12} lg={8}>
            <Fade in={true} timeout={1400}>
              <Box>
                {/* Experience & Qualifications */}
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
                      Experience & Qualifications
                    </Typography>

                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ p: 3, backgroundColor: 'grey.50', borderRadius: '12px' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Experience
                            </Typography>
                          </Box>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {doctor.experience} years
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ p: 3, backgroundColor: 'grey.50', borderRadius: '12px' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Qualification
                            </Typography>
                          </Box>
                          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {doctor.qualification}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* About Doctor */}
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
                      <LocalHospitalIcon sx={{ mr: 2, color: 'primary.main' }} />
                      About Doctor
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        lineHeight: 1.7,
                        fontSize: '1.1rem',
                        color: 'text.secondary'
                      }}
                    >
                      {doctor.about || 'Dr. ' + doctor.name + ' is a highly experienced ' + doctor.specialization.toLowerCase() + ' specialist with ' + doctor.experience + ' years of practice. They are committed to providing exceptional healthcare services and maintaining the highest standards of patient care.'}
                    </Typography>
                  </CardContent>
                </Card>

                {/* Available Time Slots */}
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
                        display: 'flex',
                        alignItems: 'center',
                        mb: 3
                      }}
                    >
                      <CalendarTodayIcon sx={{ mr: 2, color: 'primary.main' }} />
                      Available Time Slots
                    </Typography>

                    {doctor.availability && doctor.availability.length > 0 ? (
                      <Grid container spacing={2}>
                        {doctor.availability.map((daySchedule, index) => (
                          <Grid item xs={12} sm={6} key={index}>
                            <Box
                              sx={{
                                p: 3,
                                backgroundColor: 'grey.50',
                                borderRadius: '12px',
                                border: '1px solid rgba(148, 163, 184, 0.1)',
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 600,
                                  color: 'text.primary',
                                  mb: 2
                                }}
                              >
                                {daySchedule.day}
                              </Typography>
                              {daySchedule.slots && daySchedule.slots.filter(slot => slot.available).length > 0 ? (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {daySchedule.slots
                                    .filter(slot => slot.available)
                                    .map((slot, slotIndex) => (
                                      <Chip
                                        key={slotIndex}
                                        label={slot.time}
                                        size="small"
                                        sx={{
                                          backgroundColor: 'success.light',
                                          color: 'success.dark',
                                          fontWeight: 500,
                                          borderRadius: '8px',
                                        }}
                                      />
                                    ))}
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  No slots available
                                </Typography>
                              )}
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Alert
                        severity="info"
                        sx={{
                          borderRadius: '12px',
                          py: 2
                        }}
                      >
                        Availability information will be updated soon. Please contact the clinic for current schedules.
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DoctorProfile;