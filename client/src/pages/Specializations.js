import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  Chip,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { doctorsAPI } from '../services/api';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PsychologyIcon from '@mui/icons-material/Psychology';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BuildIcon from '@mui/icons-material/Build';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import ScienceIcon from '@mui/icons-material/Science';
import HealingIcon from '@mui/icons-material/Healing';
import HearingIcon from '@mui/icons-material/Hearing';
import SearchIcon from '@mui/icons-material/Search';

const specializationIcons = {
  'Cardiology': <FavoriteIcon sx={{ fontSize: 48 }} />,
  'Dermatology': <HealingIcon sx={{ fontSize: 48 }} />,
  'Neurology': <PsychologyIcon sx={{ fontSize: 48 }} />,
  'Orthopedics': <BuildIcon sx={{ fontSize: 48 }} />,
  'Pediatrics': <ChildCareIcon sx={{ fontSize: 48 }} />,
  'Psychiatry': <PsychologyIcon sx={{ fontSize: 48 }} />,
  'Radiology': <ScienceIcon sx={{ fontSize: 48 }} />,
  'Surgery': <LocalHospitalIcon sx={{ fontSize: 48 }} />,
  'Urology': <HealingIcon sx={{ fontSize: 48 }} />,
  'Gynecology': <FavoriteIcon sx={{ fontSize: 48 }} />,
  'Ophthalmology': <VisibilityIcon sx={{ fontSize: 48 }} />,
  'ENT': <HearingIcon sx={{ fontSize: 48 }} />,
  'Dentistry': <HealingIcon sx={{ fontSize: 48 }} />,
  'General Medicine': <LocalHospitalIcon sx={{ fontSize: 48 }} />
};

const specializationColors = {
  'Cardiology': '#ef4444',
  'Dermatology': '#8b5cf6',
  'Neurology': '#06b6d4',
  'Orthopedics': '#f59e0b',
  'Pediatrics': '#10b981',
  'Psychiatry': '#ec4899',
  'Radiology': '#6366f1',
  'Surgery': '#dc2626',
  'Urology': '#7c3aed',
  'Gynecology': '#be185d',
  'Ophthalmology': '#0891b2',
  'ENT': '#059669',
  'Dentistry': '#ea580c',
  'General Medicine': '#2563eb'
};

const specializationDescriptions = {
  'Cardiology': 'Heart and cardiovascular health',
  'Dermatology': 'Skin, hair and nail care',
  'Neurology': 'Brain and nervous system',
  'Orthopedics': 'Bones, joints and muscles',
  'Pediatrics': 'Child and adolescent care',
  'Psychiatry': 'Mental health and wellness',
  'Radiology': 'Medical imaging and diagnosis',
  'Surgery': 'Surgical procedures and care',
  'Urology': 'Urinary tract and male reproductive health',
  'Gynecology': 'Women\'s health and reproductive care',
  'Ophthalmology': 'Eye care and vision health',
  'ENT': 'Ear, nose and throat care',
  'Dentistry': 'Oral health and dental care',
  'General Medicine': 'Primary healthcare and wellness'
};

const Specializations = () => {
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const response = await doctorsAPI.getSpecializations();
        setSpecializations(response.data);
      } catch (error) {
        console.error('Error fetching specializations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecializations();
  }, []);

  const handleSpecializationClick = (specialization) => {
    navigate(`/doctors?specialization=${encodeURIComponent(specialization)}`);
  };

  const filteredSpecializations = specializations.filter(spec =>
    spec.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
      </Container>
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
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Fade in={true} timeout={1000}>
            <Box>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  background: 'linear-gradient(135deg, #2563eb 0%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Choose Your Specialty
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ mb: 4, maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
              >
                Connect with expert healthcare professionals across all medical specializations
              </Typography>
            </Box>
          </Fade>

          {/* Search Bar */}
          <Box sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
            <Box
              sx={{
                position: 'relative',
                backgroundColor: 'white',
                borderRadius: '50px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                p: 1,
              }}
            >
              <SearchIcon sx={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'text.secondary' }} />
              <input
                type="text"
                placeholder="Search specializations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  padding: '12px 20px 12px 60px',
                  fontSize: '16px',
                  borderRadius: '50px',
                  backgroundColor: 'transparent',
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Specializations Grid */}
        <Grid container spacing={4}>
          {filteredSpecializations.map((specialization, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={specialization}>
              <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    background: 'white',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.02)',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                      borderColor: specializationColors[specialization] || theme.palette.primary.main,
                    },
                  }}
                  onClick={() => handleSpecializationClick(specialization)}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Icon */}
                    <Box
                      sx={{
                        background: `linear-gradient(135deg, ${specializationColors[specialization] || '#2563eb'}20, ${specializationColors[specialization] || '#2563eb'}10)`,
                        borderRadius: '50%',
                        width: 100,
                        height: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                        color: specializationColors[specialization] || theme.palette.primary.main,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      {specializationIcons[specialization] || <LocalHospitalIcon sx={{ fontSize: 48 }} />}
                    </Box>

                    {/* Content */}
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography
                          variant="h5"
                          component="h2"
                          gutterBottom
                          sx={{
                            fontWeight: 700,
                            mb: 2,
                            color: 'text.primary',
                          }}
                        >
                          {specialization}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 3, lineHeight: 1.6 }}
                        >
                          {specializationDescriptions[specialization] || 'Expert medical care and treatment'}
                        </Typography>
                      </Box>

                      {/* Stats */}
                      <Box sx={{ mb: 3 }}>
                        <Chip
                          label="Available Now"
                          size="small"
                          sx={{
                            backgroundColor: `${specializationColors[specialization] || '#2563eb'}20`,
                            color: specializationColors[specialization] || theme.palette.primary.main,
                            fontWeight: 600,
                            borderRadius: '20px',
                          }}
                        />
                      </Box>

                      {/* Button */}
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
                          background: `linear-gradient(135deg, ${specializationColors[specialization] || '#2563eb'} 0%, ${specializationColors[specialization] || '#2563eb'}dd 100%)`,
                          boxShadow: 'none',
                          '&:hover': {
                            background: `linear-gradient(135deg, ${specializationColors[specialization] || '#2563eb'}dd 0%, ${specializationColors[specialization] || '#2563eb'} 100%)`,
                            boxShadow: `0 8px 25px ${specializationColors[specialization] || '#2563eb'}40`,
                          },
                        }}
                      >
                        View Doctors
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        {/* Empty State */}
        {filteredSpecializations.length === 0 && searchTerm && (
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No specializations found matching "{searchTerm}"
            </Typography>
            <Button
              onClick={() => setSearchTerm('')}
              variant="outlined"
              sx={{ mt: 2 }}
            >
              Clear Search
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Specializations;