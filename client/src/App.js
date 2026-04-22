import DoctorAppointments from './pages/DoctorAppointments';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import HomePage from './pages/HomePage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Specializations from './pages/Specializations';
import DoctorsList from './pages/DoctorsList';
import DoctorProfile from './pages/DoctorProfile';
import BookAppointment from './pages/BookAppointment';
import AppointmentConfirmation from './pages/AppointmentConfirmation';
import Messages from './pages/Messages';
import PatientRecords from './pages/PatientRecords';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb', // Modern blue
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ec4899', // Modern pink
      light: '#f9a8d4',
      dark: '#db2777',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981', // Modern green
      light: '#34d399',
      dark: '#059669',
    },
    error: {
      main: '#ef4444', // Modern red
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b', // Modern amber
      light: '#fbbf24',
      dark: '#d97706',
    },
    background: {
      default: '#f8fafc', // Light gray background
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b', // Dark slate
      secondary: '#64748b', // Medium slate
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      background: 'linear-gradient(135deg, #2563eb 0%, #ec4899 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      borderRadius: '8px',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '12px 24px',
          fontSize: '0.95rem',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            transition: 'all 0.3s ease-in-out',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2563eb',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
        },
      },
    },
  },
});

function AppRoutes() {
  const { isAuthenticated, user, loading } = useAuth();

  console.log('AppRoutes - isAuthenticated:', isAuthenticated, 'user:', user, 'loading:', loading);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={`/${user?.role}-dashboard`} />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={`/${user?.role}-dashboard`} />} />
      <Route path="/specializations" element={<Specializations />} />
      <Route path="/doctors" element={<DoctorsList />} />
      <Route path="/doctor/:id" element={<DoctorProfile />} />

      {/* Protected routes */}
      <Route path="/book-appointment/:doctorId" element={isAuthenticated ? <BookAppointment /> : <Navigate to="/login" />} />
      <Route path="/appointment-confirmation/:appointmentId" element={isAuthenticated ? <AppointmentConfirmation /> : <Navigate to="/login" />} />
      <Route path="/messages" element={isAuthenticated ? <Messages /> : <Navigate to="/login" />} />
      <Route path="/patient-records" element={isAuthenticated && user?.role === 'patient' ? <PatientRecords /> : <Navigate to="/login" />} />

      {/* Role-based dashboards */}
      <Route path="/patient-dashboard" element={isAuthenticated && user?.role === 'patient' ? <PatientDashboard /> : <Navigate to="/login" />} />
      <Route path="/doctor-dashboard" element={isAuthenticated && user?.role === 'doctor' ? <DoctorDashboard /> : <Navigate to="/login" />} />
      <Route path="/admin-dashboard" element={isAuthenticated && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
      <Route 
  path="/doctor-appointments" 
  element={
    isAuthenticated && user?.role === 'doctor'
      ? <DoctorAppointments />
      : <Navigate to="/login" />
  } 
/>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router future={{ v7_relativeSplatPath: true }}>
          <Navbar />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
