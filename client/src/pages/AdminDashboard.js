import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  FormControlLabel,
  Switch,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Stack,
  CardActions
} from '@mui/material';
import { appointmentsAPI, doctorsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addDoctorDialog, setAddDoctorDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [adminMeetingId, setAdminMeetingId] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [editAppointmentDialog, setEditAppointmentDialog] = useState(false);
  const [adminChatText, setAdminChatText] = useState('');
  const [adminChatRecipient, setAdminChatRecipient] = useState('patient');
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    experience: '',
    qualification: '',
    consultationFee: ''
  });

  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsResponse, appointmentsResponse, usersResponse] = await Promise.all([
          doctorsAPI.getDoctors(),
          appointmentsAPI.getAppointments(),
          usersAPI.getUsers()
        ]);
        setDoctors(doctorsResponse.data);
        setAppointments(appointmentsResponse.data);
        setUsers(usersResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddDoctor = () => {
    setAddDoctorDialog(true);
  };

  const handleSaveDoctor = async () => {
    try {
      // First create user, then doctor
      const userData = {
        name: newDoctor.name,
        email: newDoctor.email,
        password: newDoctor.password,
        role: 'doctor'
      };

      // This would need a separate API call to create user first
      // For now, we'll just add the doctor assuming user exists
      const doctorData = {
        userId: 'mock-user-id', // In real app, get from user creation
        name: newDoctor.name,
        specialization: newDoctor.specialization,
        experience: parseInt(newDoctor.experience),
        qualification: newDoctor.qualification,
        consultationFee: parseInt(newDoctor.consultationFee)
      };

      await doctorsAPI.addDoctor(doctorData);
      setAddDoctorDialog(false);
      setNewDoctor({
        name: '',
        email: '',
        password: '',
        specialization: '',
        experience: '',
        qualification: '',
        consultationFee: ''
      });

      // Refresh doctors list
      const response = await doctorsAPI.getDoctors();
      setDoctors(response.data);
    } catch (error) {
      console.error('Error adding doctor:', error);
      setError('Failed to add doctor');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const [chatApproved, setChatApproved] = useState(false);

  const handleOpenEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setAdminMeetingId(appointment.meetingId || '');
    setAdminMessage(appointment.adminMessage || '');
    setChatApproved(appointment.chatApproved || false);
    setAdminChatText('');
    setAdminChatRecipient('patient');
    setEditAppointmentDialog(true);
  };

  const handleSaveAppointmentAdminData = async () => {
    if (!selectedAppointment) return;
    try {
      const payload = {
        adminMessage,
        chatApproved: selectedAppointment?.mode === 'chat' ? chatApproved : undefined
      };

      if (selectedAppointment?.mode !== 'chat') {
        payload.meetingId = adminMeetingId;
      }

      const response = await appointmentsAPI.adminUpdate(selectedAppointment._id, payload);
      setAppointments((prev) => prev.map((apt) => (apt._id === response.data._id ? response.data : apt)));
      setEditAppointmentDialog(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error updating appointment:', error);
      setError('Failed to update appointment details');
    }
  };

  const handleSendAdminChatMessage = async () => {
    if (!selectedAppointment || !adminChatText.trim()) return;

    try {
      const response = await appointmentsAPI.sendChatMessage(
        selectedAppointment._id,
        adminChatText,
        adminChatRecipient
      );
      setAppointments((prev) => prev.map((apt) => (apt._id === response.data._id ? response.data : apt)));
      setSelectedAppointment(response.data);
      setAdminChatText('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send admin chat message');
    }
  };

  const handlePatientAdminRequestDecision = async (approve) => {
    if (!selectedAppointment) return;
    try {
      const response = await appointmentsAPI.respondAdminChatRequest(selectedAppointment._id, approve);
      setAppointments((prev) => prev.map((apt) => (apt._id === response.data._id ? response.data : apt)));
      setSelectedAppointment(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update request');
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 4,
        background: 'radial-gradient(circle at top right, rgba(236,72,153,0.14), transparent 25%), linear-gradient(135deg, #f8fafc 0%, #eef6ff 100%)',
      }}
    >
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
            Admin Dashboard
          </Typography>
          <Typography color="text.secondary">
            Manage the ecosystem, keep appointments flowing, and review all users in one place.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleAddDoctor}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #2563eb 0%, #ec4899 100%)',
          }}
        >
          Add Doctor
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Users" />
          <Tab label="Doctors" />
          <Tab label="Appointments" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 4, boxShadow: '0 12px 30px rgba(15,23,42,0.08)' }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <PeopleIcon color="primary" />
                  <Typography variant="h6">Total Users</Typography>
                </Stack>
                <Typography variant="h3" color="primary" sx={{ fontWeight: 800 }}>
                  {users.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 4, boxShadow: '0 12px 30px rgba(15,23,42,0.08)' }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <LocalHospitalIcon sx={{ color: '#ec4899' }} />
                  <Typography variant="h6">Total Doctors</Typography>
                </Stack>
                <Typography variant="h3" color="secondary" sx={{ fontWeight: 800 }}>
                  {doctors.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 4, boxShadow: '0 12px 30px rgba(15,23,42,0.08)' }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <CalendarTodayIcon sx={{ color: '#10b981' }} />
                  <Typography variant="h6">Appointments</Typography>
                </Stack>
                <Typography variant="h3" color="success.main" sx={{ fontWeight: 800 }}>
                  {appointments.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 4, boxShadow: '0 12px 30px rgba(15,23,42,0.08)' }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <PendingActionsIcon sx={{ color: '#f59e0b' }} />
                  <Typography variant="h6">Pending</Typography>
                </Stack>
                <Typography variant="h3" color="warning.main" sx={{ fontWeight: 800 }}>
                  {appointments.filter(apt => apt.status === 'pending').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Users Tab */}
      {tabValue === 1 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
            Manage Users
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 12px 30px rgba(15,23,42,0.08)' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Registration Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={
                          user.role === 'admin' ? 'error' :
                          user.role === 'doctor' ? 'primary' :
                          'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.phone || 'Not provided'}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Doctors Tab */}
      {tabValue === 2 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
            Manage Doctors
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 12px 30px rgba(15,23,42,0.08)' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Specialization</TableCell>
                  <TableCell>Experience</TableCell>
                  <TableCell>Ratings</TableCell>
                  <TableCell>Consultation Fee</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {doctors.map((doctor) => (
                  <TableRow key={doctor._id}>
                    <TableCell>Dr. {doctor.name}</TableCell>
                    <TableCell>{doctor.specialization}</TableCell>
                    <TableCell>{doctor.experience} years</TableCell>
                    <TableCell>{doctor.ratings} ({doctor.totalReviews})</TableCell>
                    <TableCell>₹{doctor.consultationFee}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Appointments Tab */}
      {tabValue === 3 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
            All Appointments
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 12px 30px rgba(15,23,42,0.08)' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Mode</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Meeting ID</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment._id}>
                    <TableCell>{appointment.patient.name}</TableCell>
                    <TableCell>Dr. {appointment.doctor.name}</TableCell>
                    <TableCell>{new Date(appointment.date).toLocaleDateString()}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>{appointment.mode ? appointment.mode.toUpperCase() : 'VIDEO'}</TableCell>
                    <TableCell>
                      <Chip
                        label={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        color={getStatusColor(appointment.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{appointment.mode === 'chat' ? '-' : (appointment.meetingId || '-')}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenEditAppointment(appointment)}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Edit Appointment Dialog */}
      <Dialog open={editAppointmentDialog} onClose={() => setEditAppointmentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Admin: Manage Appointment</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Patient: {selectedAppointment?.patient?.name || '-'} | Doctor: Dr. {selectedAppointment?.doctor?.name || '-'}
          </Typography>
          {selectedAppointment?.mode !== 'chat' ? (
            <TextField
              fullWidth
              label="Meeting ID"
              variant="outlined"
              value={adminMeetingId}
              onChange={(e) => setAdminMeetingId(e.target.value)}
              sx={{ mb: 2 }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Chat mode does not require a meeting ID. Use approval toggle below to allow patient/doctor chat.
            </Typography>
          )}
          {selectedAppointment?.mode === 'chat' && (
            <FormControlLabel
              control={
                <Switch
                  checked={chatApproved}
                  onChange={(e) => setChatApproved(e.target.checked)}
                  color="primary"
                />
              }
              label="Approve chat for this appointment"
              sx={{ mb: 2 }}
            />
          )}
          <TextField
            fullWidth
            label="Admin message (for doctor & patient)"
            variant="outlined"
            multiline
            minRows={3}
            value={adminMessage}
            onChange={(e) => setAdminMessage(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Patient → Admin request: {selectedAppointment?.patientAdminChatRequestStatus || 'none'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handlePatientAdminRequestDecision(true)}
            >
              Approve Request
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => handlePatientAdminRequestDecision(false)}
            >
              Reject Request
            </Button>
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Appointment Chat
          </Typography>
          <Stack spacing={1} sx={{ maxHeight: 220, overflowY: 'auto', mb: 1, border: '1px solid #e5e7eb', p: 1, borderRadius: 1 }}>
            {(selectedAppointment?.chatMessages || []).map((msg, idx) => (
              <Box key={idx} sx={{ backgroundColor: '#f9fafb', p: 1, borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {msg.sender?.toUpperCase()} {msg.recipient ? `→ ${msg.recipient?.toUpperCase()}` : ''} @ {new Date(msg.createdAt).toLocaleTimeString()}
                </Typography>
                <Typography variant="body2">{msg.text}</Typography>
              </Box>
            ))}
          </Stack>
          <FormControl fullWidth sx={{ mb: 1 }}>
            <InputLabel id="admin-chat-recipient-label">Send To</InputLabel>
            <Select
              labelId="admin-chat-recipient-label"
              value={adminChatRecipient}
              label="Send To"
              onChange={(e) => setAdminChatRecipient(e.target.value)}
            >
              <MenuItem value="patient">Patient</MenuItem>
              <MenuItem value="doctor">Doctor</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Chat message"
            variant="outlined"
            multiline
            minRows={2}
            value={adminChatText}
            onChange={(e) => setAdminChatText(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Button variant="contained" onClick={handleSendAdminChatMessage}>
            Send Chat Message
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditAppointmentDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveAppointmentAdminData} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Add Doctor Dialog */}
      <Dialog open={addDoctorDialog} onClose={() => setAddDoctorDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Doctor</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                value={newDoctor.name}
                onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newDoctor.email}
                onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={newDoctor.password}
                onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Specialization</InputLabel>
                <Select
                  value={newDoctor.specialization}
                  label="Specialization"
                  onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
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
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Experience (years)"
                type="number"
                value={newDoctor.experience}
                onChange={(e) => setNewDoctor({ ...newDoctor, experience: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Qualification"
                value={newDoctor.qualification}
                onChange={(e) => setNewDoctor({ ...newDoctor, qualification: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Consultation Fee"
                type="number"
                value={newDoctor.consultationFee}
                onChange={(e) => setNewDoctor({ ...newDoctor, consultationFee: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDoctorDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveDoctor} variant="contained">
            Add Doctor
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </Box>
  );
};

export default AdminDashboard;
