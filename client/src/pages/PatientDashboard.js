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
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogContent,
  Fab,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PatientChatbot from '../components/PatientChatbot';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatInputs, setChatInputs] = useState({});
  const [chatRecipients, setChatRecipients] = useState({});
  const [selectedChatAppointment, setSelectedChatAppointment] = useState(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await appointmentsAPI.getAppointments();
        setAppointments(response.data);
      } catch (fetchError) {
        console.error('Error fetching appointments:', fetchError);
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getStatusChipSx = (status) => {
    if (status === 'confirmed') {
      return { bgcolor: '#c8ffd9', color: '#0b5d2a', fontWeight: 700 };
    }
    if (status === 'pending') {
      return { bgcolor: '#fff3b8', color: '#7a5200', fontWeight: 700 };
    }
    return {};
  };

  const isAppointmentInBookedSlot = (appointment) => {
    if (!appointment || !appointment.date || !appointment.time) return false;

    const now = new Date();
    const appointmentDate = new Date(appointment.date);
    const [startTime, endTime] = (appointment.time || '').split('-');
    if (!startTime || !endTime) return false;

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startDateTime = new Date(appointmentDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(appointmentDate);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    return now >= startDateTime && now <= endDateTime;
  };

  const isPatientAdminChatEnabled = (appointment) => (
    appointment?.adminInitiatedPatientChat || appointment?.patientAdminChatRequestStatus === 'approved'
  );

  const canPatientSendToDoctor = (appointment) => (
    appointment?.mode === 'chat'
    && appointment?.chatApproved
    && appointment?.status === 'confirmed'
    && isAppointmentInBookedSlot(appointment)
  );

  const canPatientSendMessage = (appointment, recipient) => {
    if (!appointment || !recipient) return false;
    if (recipient === 'doctor') return canPatientSendToDoctor(appointment);
    if (recipient === 'admin') return isPatientAdminChatEnabled(appointment);
    return false;
  };

  const isMessageVisibleToPatient = (msg) => {
    if (!msg) return false;
    if (!msg.recipient) return true;
    return msg.sender === 'patient' || msg.recipient === 'patient';
  };

  const handleSendChatMessage = async (appointmentId) => {
    const text = chatInputs[appointmentId];
    const recipient = chatRecipients[appointmentId] || 'doctor';
    if (!text || !text.trim()) return;

    try {
      const response = await appointmentsAPI.sendChatMessage(appointmentId, text, recipient);
      setAppointments((prev) => prev.map((apt) => (apt._id === response.data._id ? response.data : apt)));
      if (selectedChatAppointment?._id === response.data._id) {
        setSelectedChatAppointment(response.data);
      }
      setChatInputs((prev) => ({ ...prev, [appointmentId]: '' }));
    } catch (err) {
      console.error('Error sending chat message:', err);
      setError(err.response?.data?.message || 'Failed to send chat message');
    }
  };

  const handleRequestAdminChat = async (appointmentId) => {
    try {
      const response = await appointmentsAPI.requestAdminChat(appointmentId);
      setAppointments((prev) => prev.map((apt) => (apt._id === response.data._id ? response.data : apt)));
      if (selectedChatAppointment?._id === response.data._id) {
        setSelectedChatAppointment(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request admin chat');
    }
  };

  const handleBookAppointment = () => {
    navigate('/specializations');
  };

  const confirmedCount = appointments.filter((apt) => apt.status === 'confirmed').length;
  const pendingCount = appointments.filter((apt) => apt.status === 'pending').length;

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      <Box
        sx={{
          background: 'radial-gradient(circle at top right, rgba(236,72,153,0.16), transparent 25%), linear-gradient(180deg, #e6f4ff 0%, #f5fbff 100%)',
          borderRadius: 5,
          p: { xs: 2, md: 3 },
          boxShadow: '0 18px 50px rgba(30, 136, 229, 0.12)'
        }}
      >
        <Card
          sx={{
            mb: 3,
            borderRadius: 4,
            background: 'linear-gradient(120deg, #2563eb 0%, #ec4899 100%)',
            color: '#fff'
          }}
        >
          <CardContent sx={{ py: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                  Hi, {user?.name}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.95 }}>
                  Your care dashboard
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                onClick={handleBookAppointment}
                sx={{
                  bgcolor: '#ffffff',
                  color: '#0f172a',
                  fontWeight: 800,
                  border: '1px solid rgba(148, 163, 184, 0.35)',
                  boxShadow: '0 10px 22px rgba(15, 23, 42, 0.10)',
                  '&:hover': {
                    bgcolor: '#f8fafc',
                    boxShadow: '0 12px 26px rgba(15, 23, 42, 0.14)',
                  }
                }}
              >
                Book Appointment
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 4, bgcolor: '#ffffffcc', boxShadow: '0 10px 24px rgba(15,23,42,0.06)' }}>
              <CardContent sx={{ py: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FavoriteIcon color="primary" />
                  <Typography variant="body2" color="text.secondary">Total Appointments</Typography>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>{appointments.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 4, bgcolor: '#d9ffe6', boxShadow: '0 10px 24px rgba(16,185,129,0.12)' }}>
              <CardContent sx={{ py: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <EventAvailableIcon sx={{ color: '#059669' }} />
                  <Typography variant="body2" color="text.secondary">Confirmed</Typography>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>{confirmedCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 4, bgcolor: '#fff7cc', boxShadow: '0 10px 24px rgba(245,158,11,0.12)' }}>
              <CardContent sx={{ py: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <HourglassBottomIcon sx={{ color: '#d97706' }} />
                  <Typography variant="body2" color="text.secondary">Pending</Typography>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>{pendingCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 800, color: '#0d47a1' }}>
          Appointments
        </Typography>

        {selectedChatAppointment && (
          <Card key={selectedChatAppointment._id} sx={{ mb: 3, p: 2, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Chat: Dr. {selectedChatAppointment.doctor.name}</Typography>
              <Button size="small" onClick={() => setSelectedChatAppointment(null)}>Close</Button>
            </Box>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              {new Date(selectedChatAppointment.date).toLocaleDateString()} - {selectedChatAppointment.time}
            </Typography>
            <Stack spacing={1} sx={{ maxHeight: 280, overflowY: 'auto', mb: 1, bgcolor: '#f8fbff', p: 1, borderRadius: 2 }}>
              {(selectedChatAppointment.chatMessages || []).filter(isMessageVisibleToPatient).map((msg, idx) => (
                <Box key={idx} sx={{ backgroundColor: '#eaf4ff', p: 1, borderRadius: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {msg.sender.toUpperCase()}
                    {msg.recipient ? ` -> ${msg.recipient.toUpperCase()}` : ''}
                    {` @ ${new Date(msg.createdAt).toLocaleTimeString()}`}
                  </Typography>
                  <Typography variant="body2">{msg.text}</Typography>
                </Box>
              ))}
            </Stack>
            <FormControl size="small" fullWidth sx={{ mb: 1 }}>
              <InputLabel id="patient-chat-recipient-label">To</InputLabel>
              <Select
                labelId="patient-chat-recipient-label"
                value={chatRecipients[selectedChatAppointment._id] || 'doctor'}
                label="To"
                onChange={(e) => setChatRecipients((prev) => ({ ...prev, [selectedChatAppointment._id]: e.target.value }))}
              >
                <MenuItem value="doctor">Doctor</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            {(chatRecipients[selectedChatAppointment._id] || 'doctor') === 'admin'
              && !isPatientAdminChatEnabled(selectedChatAppointment) && (
                <Box sx={{ mb: 1, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    onClick={() => handleRequestAdminChat(selectedChatAppointment._id)}
                  >
                    Request Admin Chat
                  </Button>
                  <Chip size="small" label={`Status: ${selectedChatAppointment.patientAdminChatRequestStatus || 'none'}`} />
                </Box>
              )}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type message"
                value={chatInputs[selectedChatAppointment._id] || ''}
                onChange={(e) => setChatInputs((prev) => ({ ...prev, [selectedChatAppointment._id]: e.target.value }))}
              />
              <Button
                variant="contained"
                onClick={() => handleSendChatMessage(selectedChatAppointment._id)}
                disabled={!canPatientSendMessage(selectedChatAppointment, chatRecipients[selectedChatAppointment._id] || 'doctor')}
              >
                Send
              </Button>
            </Box>
          </Card>
        )}

        {appointments.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No appointments yet.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {appointments.map((appointment) => (
              <Grid item xs={12} md={6} key={appointment._id}>
                <Card sx={{ borderRadius: 3, border: '1px solid #d8ecff', boxShadow: '0 6px 20px rgba(33, 150, 243, 0.08)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 700 }}>
                          Dr. {appointment.doctor.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {appointment.doctor.specialization}
                        </Typography>
                      </Box>
                      <Chip
                        label={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        color={getStatusColor(appointment.status)}
                        sx={getStatusChipSx(appointment.status)}
                        size="small"
                      />
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                      <Chip size="small" icon={<CalendarTodayIcon />} label={new Date(appointment.date).toLocaleDateString()} />
                      <Chip size="small" icon={<AccessTimeIcon />} label={appointment.time} />
                      <Chip size="small" label={(appointment.mode || 'video').toUpperCase()} />
                    </Stack>

                    <Divider sx={{ mb: 2 }} />

                    {appointment.mode === 'chat' ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          onClick={() => {
                            setSelectedChatAppointment(appointment);
                            setChatRecipients((prev) => ({ ...prev, [appointment._id]: prev[appointment._id] || 'doctor' }));
                            window.scrollTo(0, 0);
                          }}
                        >
                          Open Chat
                        </Button>
                        {!canPatientSendToDoctor(appointment) && (
                          <Chip size="small" color="warning" label="Slot locked" />
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                        <Chip size="small" label={appointment.meetingId ? 'Video Scheduled' : 'Video Pending'} />
                      </Box>
                    )}

                    {appointment.adminMessage && (
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                        Admin: {appointment.adminMessage}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Tooltip title="Open health assistant" placement="left">
        <Fab
          color="primary"
          onClick={() => setAssistantOpen(true)}
          sx={{
            position: 'fixed',
            right: { xs: 16, md: 28 },
            bottom: { xs: 16, md: 28 },
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #2563eb 0%, #ec4899 100%)',
            boxShadow: '0 16px 30px rgba(37, 99, 235, 0.35)',
            zIndex: 1400,
            '&:hover': {
              background: 'linear-gradient(135deg, #1d4ed8 0%, #db2777 100%)',
            },
          }}
        >
          <SmartToyOutlinedIcon sx={{ fontSize: 32 }} />
        </Fab>
      </Tooltip>

      <Dialog
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        fullWidth
        maxWidth="sm"
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <PatientChatbot />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default PatientDashboard;
