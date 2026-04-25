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
  Link,
  Avatar,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'patient'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(formData);
      navigate(`/${loggedInUser.role}-dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    {
      value: 'patient',
      label: 'Patient',
      icon: <PersonIcon sx={{ fontSize: 24 }} />,
      description: 'Book appointments and manage health records',
      color: '#2563eb'
    },
    {
      value: 'doctor',
      label: 'Doctor',
      icon: <MedicalServicesIcon sx={{ fontSize: 24 }} />,
      description: 'Manage appointments and patient care',
      color: '#10b981'
    },
    {
      value: 'admin',
      label: 'Admin',
      icon: <AdminPanelSettingsIcon sx={{ fontSize: 24 }} />,
      description: 'System administration and management',
      color: '#f59e0b'
    }
  ];

  const selectedRole = roleOptions.find(role => role.value === formData.role);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container component="main" maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Left Side - Branding */}
          {!isMobile && (
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center', color: 'white' }}>
                <Box
                  sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    p: 4,
                    display: 'inline-block',
                    mb: 4,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <LocalHospitalIcon sx={{ fontSize: 80, color: 'white' }} />
                </Box>
                <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                  Welcome to Smart Health Care 
                </Typography>
                <Typography variant="h5" sx={{ opacity: 0.9, mb: 4 }}>
                  Your trusted healthcare companion
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: 400, mx: 'auto' }}>
                  Experience world-class healthcare with our advanced appointment booking system,
                  expert doctors, and personalized care.
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Right Side - Login Form */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={24}
              sx={{
                p: 4,
                borderRadius: '24px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography component="h1" variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                  Sign In
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Access your healthcare dashboard
                </Typography>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: '12px',
                    '& .MuiAlert-icon': {
                      color: theme.palette.error.main,
                    },
                  }}
                >
                  {error}
                </Alert>
              )}

              {/* Role Selection Cards */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                  Select your role to continue
                </Typography>
                <Grid container spacing={2}>
                  {roleOptions.map((role) => (
                    <Grid item xs={4} key={role.value}>
                      <Card
                        onClick={() => setFormData({ ...formData, role: role.value })}
                        sx={{
                          cursor: 'pointer',
                          border: formData.role === role.value ? `2px solid ${role.color}` : '2px solid transparent',
                          backgroundColor: formData.role === role.value ? `${role.color}10` : 'transparent',
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                          <Avatar
                            sx={{
                              bgcolor: role.color,
                              width: 48,
                              height: 48,
                              mx: 'auto',
                              mb: 1,
                            }}
                          >
                            {role.icon}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {role.label}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  sx={{ mb: 3 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 2,
                    mb: 3,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${selectedRole?.color} 0%, ${selectedRole?.color}dd 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${selectedRole?.color}dd 0%, ${selectedRole?.color} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : `Sign In as ${selectedRole?.label}`}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Link
                    href="#"
                    variant="body2"
                    onClick={() => navigate('/register')}
                    sx={{
                      color: selectedRole?.color,
                      textDecoration: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {"Don't have an account? Create one"}
                  </Link>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Login;
