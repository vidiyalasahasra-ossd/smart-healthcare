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
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { doctorsAPI } from '../services/api';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const specialization = searchParams.get('specialization');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const getNextSlot = (doctor) => {
    if (!doctor?.availability || doctor.availability.length === 0) return null;
    const slots = doctor.availability
      .flatMap((d) => d.slots?.map((s) => ({ day: d.day, ...s })) || [])
      .filter((s) => s.available && s.time);

    if (slots.length === 0) return null;
    return `${slots[0].day} ${slots[0].time}`;
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await doctorsAPI.getDoctors(specialization);
        setDoctors(response.data);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setError('Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [specialization]);

  const handleDoctorClick = (doctorId) => {
    navigate(`/doctor/${doctorId}`);
  };

  const handleBackToSpecializations = () => {
    navigate('/specializations');
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

  if (error) {
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
                <Typography color="text.primary" fontWeight={600}>
                  {specialization || 'All Doctors'}
                </Typography>
              </Breadcrumbs>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBackToSpecializations}
                  sx={{
                    mr: 3,
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main', backgroundColor: 'transparent' }
                  }}
                >
                  Back
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
                  {specialization ? `${specialization} Specialists` : 'Our Expert Doctors'}
                </Typography>
              </Box>

              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 600, lineHeight: 1.6 }}
              >
                {specialization
                  ? `Find experienced ${specialization.toLowerCase()} specialists with excellent patient reviews`
                  : 'Connect with our network of highly qualified healthcare professionals'
                }
              </Typography>
            </Box>
          </Fade>
        </Box>

        {/* Doctors Grid */}
        {doctors.length === 0 ? (
          <Fade in={true} timeout={1000}>
            <Alert
              severity="info"
              sx={{
                borderRadius: '12px',
                py: 4,
                textAlign: 'center',
                fontSize: '1.1rem'
              }}
            >
              No doctors found for this specialization. Try selecting a different specialty.
            </Alert>
          </Fade>
        ) : (
          <Grid container spacing={4}>
            {doctors.map((doctor, index) => (
              <Grid item xs={12} sm={6} lg={4} key={doctor._id}>
                <Zoom in={true} style={{ transitionDelay: `${index * 150}ms` }}>
                  <Card
                    sx={{
                      height: '100%',
                      background: 'white',
                      border: '1px solid rgba(148, 163, 184, 0.1)',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.02)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                    onClick={() => handleDoctorClick(doctor._id)}
                  >
                    <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {/* Doctor Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar
                          src={doctor.image}
                          sx={{
                            width: 80,
                            height: 80,
                            mr: 3,
                            border: '4px solid',
                            borderColor: 'primary.light',
                            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                          }}
                        >
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {doctor.name.charAt(0)}
                          </Typography>
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="h5"
                            component="h2"
                            gutterBottom
                            sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}
                          >
                            Dr. {doctor.name}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: 'primary.main',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                              fontSize: '0.875rem'
                            }}
                          >
                            {doctor.specialization}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Rating and Experience */}
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Rating
                            value={doctor.ratings}
                            readOnly
                            precision={0.5}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
                            {doctor.ratings}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ({doctor.totalReviews} reviews)
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary">
                            {doctor.experience} years experience
                          </Typography>
                        </Box>
                      </Box>

                      {/* Fee and Availability */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Chip
                          label={`₹${doctor.consultationFee}`}
                          sx={{
                            backgroundColor: 'primary.main',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            px: 2,
                            py: 1,
                            borderRadius: '20px',
                          }}
                        />
                        <Chip
                          label={getNextSlot(doctor) ? `Next: ${getNextSlot(doctor)}` : 'No slots set'}
                          sx={{
                            backgroundColor: getNextSlot(doctor) ? 'success.light' : 'warning.light',
                            color: getNextSlot(doctor) ? 'success.dark' : 'warning.dark',
                            fontWeight: 600,
                            borderRadius: '20px',
                          }}
                        />
                      </Box>

                      {/* Action Button */}
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        sx={{
                          mt: 'auto',
                          py: 1.5,
                          fontSize: '1rem',
                          fontWeight: 600,
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #2563eb 0%, #ec4899 100%)',
                          boxShadow: 'none',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #1d4ed8 0%, #db2777 100%)',
                            boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)',
                          },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDoctorClick(doctor._id);
                        }}
                      >
                        View Profile & Book Appointment
                      </Button>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default DoctorsList;