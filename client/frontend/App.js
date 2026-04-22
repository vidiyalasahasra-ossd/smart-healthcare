import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Specializations from './pages/Specializations';
import DoctorsList from './pages/DoctorsList';
import DoctorProfile from './pages/DoctorProfile';
import BookAppointment from './pages/BookAppointment';
import AppointmentConfirmation from './pages/AppointmentConfirmation';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
  },
});

function AppRoutes() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={`/${user?.role}-dashboard`} />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={`/${user?.role}-dashboard`} />} />

      {/* Protected routes */}
      <Route path="/" element={isAuthenticated ? <Navigate to={`/${user?.role}-dashboard`} /> : <Navigate to="/login" />} />
      <Route path="/specializations" element={isAuthenticated ? <Specializations /> : <Navigate to="/login" />} />
      <Route path="/doctors" element={isAuthenticated ? <DoctorsList /> : <Navigate to="/login" />} />
      <Route path="/doctor/:id" element={isAuthenticated ? <DoctorProfile /> : <Navigate to="/login" />} />
      <Route path="/book-appointment/:doctorId" element={isAuthenticated ? <BookAppointment /> : <Navigate to="/login" />} />
      <Route path="/appointment-confirmation/:appointmentId" element={isAuthenticated ? <AppointmentConfirmation /> : <Navigate to="/login" />} />

      {/* Role-based dashboards */}
      <Route path="/patient-dashboard" element={isAuthenticated && user?.role === 'patient' ? <PatientDashboard /> : <Navigate to="/login" />} />
      <Route path="/doctor-dashboard" element={isAuthenticated && user?.role === 'doctor' ? <DoctorDashboard /> : <Navigate to="/login" />} />
      <Route path="/admin-dashboard" element={isAuthenticated && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />

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
        <Router>
          <Navbar />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
