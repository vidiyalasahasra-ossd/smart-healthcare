import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Grid,
  Card,
  TextField
} from '@mui/material';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { doctorsAPI, appointmentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const parseSlotRange = (slotTime) => {
  const match = String(slotTime || '').trim().match(/^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;

  const [, startHour, startMinute, endHour, endMinute] = match;
  const startMinutes = (Number(startHour) * 60) + Number(startMinute);
  const endMinutes = (Number(endHour) * 60) + Number(endMinute);

  if (startMinutes >= endMinutes) return null;

  return { startMinutes, endMinutes };
};

const slotsOverlap = (firstSlotTime, secondSlotTime) => {
  const first = typeof firstSlotTime === 'string' ? parseSlotRange(firstSlotTime) : firstSlotTime;
  const second = typeof secondSlotTime === 'string' ? parseSlotRange(secondSlotTime) : secondSlotTime;

  if (!first || !second) return false;

  return first.startMinutes < second.endMinutes && second.startMinutes < first.endMinutes;
};

const sortSlots = (slots = []) => (
  [...slots].sort((left, right) => {
    const leftRange = parseSlotRange(left.time);
    const rightRange = parseSlotRange(right.time);

    if (!leftRange && !rightRange) return String(left.time || '').localeCompare(String(right.time || ''));
    if (!leftRange) return 1;
    if (!rightRange) return -1;
    if (leftRange.startMinutes !== rightRange.startMinutes) {
      return leftRange.startMinutes - rightRange.startMinutes;
    }

    return leftRange.endMinutes - rightRange.endMinutes;
  })
);

const slotContainerSx = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  columnGap: 1.25,
  rowGap: 1.5,
};

const slotChipSx = {
  m: 0,
  minHeight: 38,
  flex: '0 0 auto',
  '& .MuiChip-label': {
    display: 'block',
    py: 0.75,
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
  },
};

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [chatInputs, setChatInputs] = useState({});
  const [chatRecipients, setChatRecipients] = useState({});
  const [selectedChatAppointment, setSelectedChatAppointment] = useState(null);
  const [selectedVideoAppointment, setSelectedVideoAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState('');
  const [saving, setSaving] = useState(false);
  const [customSlot, setCustomSlot] = useState('');
  const { user } = useAuth();

  const slotOptions = [
    '08:00-08:30', '08:30-09:00', '09:00-09:30', '09:30-10:00', '10:00-10:30', '10:30-11:00',
    '11:00-11:30', '11:30-12:00', '12:00-12:30', '12:30-13:00', '13:00-13:30', '13:30-14:00',
    '14:00-14:30', '14:30-15:00', '15:00-15:30', '15:30-16:00', '16:00-16:30', '16:30-17:00',
    '17:00-17:30', '17:30-18:00'
  ];

  console.log('DoctorDashboard rendering, user:', user);

  // Load doctor profile on component mount
  useEffect(() => {
    const loadDoctorProfile = async () => {
      console.log('Loading doctor profile for user:', user);
      try {
        const response = await doctorsAPI.getDoctorProfile();
        console.log('Doctor profile loaded:', response.data);
        setDoctor(response.data);
        setAvailability(response.data.availability || []);

        const appointmentsResponse = await appointmentsAPI.getAppointments();
        setAppointments(appointmentsResponse.data);
      } catch (error) {
        console.error('Error loading doctor profile:', error.response || error);
        const message = error.response?.data?.message || error.message || 'Failed to load doctor profile';
        const status = error.response?.status;
        setError(`${status ? `(${status}) ` : ''}${message}`);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'doctor') {
      console.log('User is doctor, loading profile...');
      loadDoctorProfile();
    } else {
      console.log('User is not doctor or not loaded:', user);
      setLoading(false);
    }
  }, [user]);

  const selectedDayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getDayAvailability = (dayName) => {
    const entry = availability.find((item) => item.day === dayName);
    if (!entry) return { day: dayName, slots: [] };

    return {
      ...entry,
      slots: sortSlots(entry.slots || [])
    };
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

  const toggleSlotAvailability = (dayName, slotTime) => {
    setAvailability(prev => prev.map(entry => {
      if (entry.day !== dayName) return entry;
      return {
        ...entry,
        slots: sortSlots(entry.slots.map(slot =>
          slot.time === slotTime ? { ...slot, available: !slot.available } : slot
        ))
      };
    }));
  };

  const getOverlappingSlot = (slots, candidateSlot) => {
    const normalizedCandidate = String(candidateSlot || '').trim();
    return (slots || []).find((slot) => slotsOverlap(slot.time, normalizedCandidate));
  };

  const addSlotForSelectedDay = (slotTime) => {
    const normalizedSlot = String(slotTime || '').trim();
    let updated = false;

    setAvailability((prev) => {
      const dayEntry = prev.find((entry) => entry.day === selectedDayName);

      if (dayEntry) {
        if (dayEntry.slots.some((slot) => slot.time === normalizedSlot)) {
          setError('This timeslot already exists for the selected day.');
          return prev;
        }

        const overlappingSlot = getOverlappingSlot(dayEntry.slots, normalizedSlot);
        if (overlappingSlot) {
          setError(`This slot overlaps with ${overlappingSlot.time}. Remove or adjust that slot first.`);
          return prev;
        }

        updated = true;
        return prev.map((entry) => (
          entry.day === selectedDayName
            ? { ...entry, slots: sortSlots([...(entry.slots || []), { time: normalizedSlot, available: true }]) }
            : entry
        ));
      }

      updated = true;
      return [...prev, { day: selectedDayName, slots: [{ time: normalizedSlot, available: true }] }];
    });

    if (updated) {
      setError('');
      return true;
    }

    return false;
  };

  const handleAddSlot = () => {
    if (!selectedSlot) {
      setError('Please choose a time slot to add.');
      return;
    }

    if (addSlotForSelectedDay(selectedSlot)) {
      setSelectedSlot('');
    }
  };

  const handleAddCustomSlot = () => {
    if (!customSlot) {
      setError('Please enter a custom timeslot (HH:MM-HH:MM).');
      return;
    }

    const slotPattern = /^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/;
    if (!slotPattern.test(customSlot)) {
      setError('Custom slot must be in HH:MM-HH:MM format.');
      return;
    }

    if (!parseSlotRange(customSlot)) {
      setError('End time must be after start time.');
      return;
    }

    if (addSlotForSelectedDay(customSlot)) {
      setCustomSlot('');
    }
  };

  const handleRemoveSlot = (day, slotTime) => {
    setAvailability(prev =>
      prev.map(entry => {
        if (entry.day !== day) return entry;
        return {
          ...entry,
          slots: sortSlots(entry.slots.filter(slot => slot.time !== slotTime))
        };
      }).filter(entry => entry.slots.length > 0)
    );
  };

  const handleSaveAvailability = async () => {
    if (!doctor?._id) {
      setError('Doctor profile not loaded.');
      return;
    }

    try {
      setError('');
      setSaving(true);
      const response = await doctorsAPI.updateAvailability(doctor._id, availability);
      setAvailability(response.data);
      setDoctor(prev => ({ ...prev, availability: response.data }));
    } catch (err) {
      console.error('Error updating availability:', err);
      setError(err.response?.data?.message || 'Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  const handleSendChatMessage = async (appointmentId) => {
    const text = chatInputs[appointmentId];
    const recipient = chatRecipients[appointmentId] || 'patient';
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

  const isMessageVisibleToDoctor = (msg) => {
    if (!msg) return false;
    if (!msg.recipient) return true;
    return msg.sender === 'doctor' || msg.recipient === 'doctor';
  };

  const canDoctorSendToPatient = (appointment) => (
    appointment?.mode === 'chat'
    && appointment?.chatApproved
    && appointment?.status === 'confirmed'
    && isAppointmentInBookedSlot(appointment)
  );

  const canDoctorSendMessage = (appointment, recipient) => {
    if (!appointment || !recipient) return false;
    if (recipient === 'patient') return canDoctorSendToPatient(appointment);
    if (recipient === 'admin') return true;
    return false;
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading your dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!user || user.role !== 'doctor') {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          Access denied. This page is only for doctors.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Doctor Dashboard
      </Typography>
      <Button 
  variant="contained" 
  sx={{ mt: 2 }} 
  onClick={() => navigate('/doctor-appointments')}
>
  View Appointments
</Button>
      <Typography variant="body1">
        Welcome, Dr. {user?.name}!
      </Typography>
      {doctor && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2">
            Specialization: {doctor.specialization}
          </Typography>

          <Box sx={{ mt: 3, p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Manage Availability Time Slots
            </Typography>

            <Grid container spacing={4}>
              <Grid item xs={12} sm={5}>
                <Typography variant="subtitle1" sx={{mb:2}}>
                  Select date (calendar):
                </Typography>
                <Calendar
                  value={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                />
              </Grid>

              <Grid item xs={12} sm={7}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Selected date: {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                </Typography>

                <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={8}>
                    <Select
                      fullWidth
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>Select slot to add</MenuItem>
                      {slotOptions.map((slot) => (
                        <MenuItem key={slot} value={slot}>{slot}</MenuItem>
                      ))}
                    </Select>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleAddSlot}
                    >
                      Add Slot
                    </Button>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, p: 2, border: '1px dashed', borderColor: 'grey.300', borderRadius: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Customize your available time (custom slot)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Add any timeslot, excluding ones already set for this day.
                  </Typography>

                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                      <TextField
                        fullWidth
                        label="Custom timeslot (HH:MM-HH:MM)"
                        value={customSlot}
                        onChange={(e) => setCustomSlot(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleAddCustomSlot}
                      >
                        Add Custom Slot
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                <Typography variant="body2" sx={{ mb: 1 }}>
                  Click slot to toggle availability status.
                </Typography>

                <Box sx={{ ...slotContainerSx, mb: 3 }}>
                  {getDayAvailability(selectedDayName).slots.length > 0 ? (
                    getDayAvailability(selectedDayName).slots.map((slot) => (
                      <Chip
                        key={slot.time}
                        label={`${slot.time} ${slot.available ? '✅' : '❌'}`}
                        color={slot.available ? 'success' : 'default'}
                        onClick={() => toggleSlotAvailability(selectedDayName, slot.time)}
                        onDelete={() => handleRemoveSlot(selectedDayName, slot.time)}
                        sx={slotChipSx}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No slots configured for this date. Add one above.
                    </Typography>
                  )}
                </Box>

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Weekly availability summary:
                </Typography>

                {availability.length > 0 ? (
                  <Stack spacing={1.5}>
                    {availability.map((dayEntry) => (
                        <Box
                          key={dayEntry.day}
                          sx={{
                            p: 1.5,
                            border: '1px solid',
                            borderColor: 'grey.200',
                            borderRadius: 2,
                            backgroundColor: 'grey.50'
                          }}
                        >
                          <Typography sx={{ fontWeight: 700, mb: 1.25 }}>{dayEntry.day}</Typography>
                          <Box sx={slotContainerSx}>
                          {sortSlots(dayEntry.slots).map((slot) => (
                            <Chip
                              key={slot.time}
                              label={`${slot.time} ${slot.available ? '✅' : '❌'}`}
                              color={slot.available ? 'success' : 'default'}
                              onClick={() => toggleSlotAvailability(dayEntry.day, slot.time)}
                              onDelete={() => handleRemoveSlot(dayEntry.day, slot.time)}
                                sx={slotChipSx}
                              />
                            ))}
                          </Box>
                        </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No weekly availability slots set yet.
                  </Typography>
                )}
              </Grid>
            </Grid>

            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={handleSaveAvailability}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Availability'}
            </Button>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Your Upcoming Appointments
            </Typography>

            {selectedVideoAppointment && (
              <Card key={selectedVideoAppointment._id} sx={{ mb: 3, p: 2, bgcolor: 'background.paper' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">Video Call: {selectedVideoAppointment.patient.name}</Typography>
                  <Button size="small" onClick={() => setSelectedVideoAppointment(null)}>Close Video</Button>
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {new Date(selectedVideoAppointment.date).toLocaleDateString()} {selectedVideoAppointment.time}
                </Typography>
                <Box sx={{ height: 400 }}>
                  <JitsiMeeting
                    roomName={selectedVideoAppointment._id}
                    configOverwrite={{
                      startWithAudioMuted: true,
                      disableModeratorIndicator: true,
                      startScreenSharing: false,
                      enableEmailInStats: false
                    }}
                    interfaceConfigOverwrite={{
                      DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
                    }}
                    userInfo={{
                      displayName: user?.name || 'Doctor'
                    }}
                    onApiReady={(externalApi) => {
                      // You can use the externalApi here if needed
                    }}
                    getIFrameRef={(iframeRef) => { iframeRef.style.height = '400px'; }}
                  />
                </Box>
              </Card>
            )}

            {selectedChatAppointment && (
              <Card key={selectedChatAppointment._id} sx={{ mb: 3, p: 2, bgcolor: 'background.paper' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">Live Chat: {selectedChatAppointment.patient.name}</Typography>
                  <Button size="small" onClick={() => setSelectedChatAppointment(null)}>Close Chat</Button>
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {new Date(selectedChatAppointment.date).toLocaleDateString()} {selectedChatAppointment.time}
                </Typography>
                <Stack spacing={1} sx={{ maxHeight: 280, overflowY: 'auto', mb: 1 }}>
                  {(selectedChatAppointment.chatMessages || []).filter(isMessageVisibleToDoctor).map((msg, idx) => (
                    <Box key={idx} sx={{ border: '1px solid #d1d5db', borderRadius: 1, p: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {msg.sender.toUpperCase()}
                        {msg.recipient ? ` → ${msg.recipient.toUpperCase()}` : ''}
                        {` @ ${new Date(msg.createdAt).toLocaleTimeString()}`}
                      </Typography>
                      <Typography variant="body2">{msg.text}</Typography>
                    </Box>
                  ))}
                </Stack>
                <FormControl size="small" fullWidth sx={{ mb: 1 }}>
                  <InputLabel id="doctor-chat-recipient-label">Message To</InputLabel>
                  <Select
                    labelId="doctor-chat-recipient-label"
                    value={chatRecipients[selectedChatAppointment._id] || 'patient'}
                    label="Message To"
                    onChange={(e) => setChatRecipients((prev) => ({ ...prev, [selectedChatAppointment._id]: e.target.value }))}
                  >
                    <MenuItem value="patient">Patient</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
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
                    onClick={() => {
                      handleSendChatMessage(selectedChatAppointment._id);
                    }}
                    disabled={!canDoctorSendMessage(selectedChatAppointment, chatRecipients[selectedChatAppointment._id] || 'patient')}
                  >
                    Send
                  </Button>
                </Box>
                {!canDoctorSendMessage(selectedChatAppointment, chatRecipients[selectedChatAppointment._id] || 'patient') && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    Doctor-patient chat is allowed only in booked slot after admin approval.
                  </Typography>
                )}
              </Card>
            )}

            {appointments.length === 0 ? (
              <Alert severity="info">No appointments scheduled.</Alert>
            ) : (
              <Stack spacing={2}>
                {appointments.map((appointment) => (
                  <Card key={appointment._id} sx={{ p: 2 }}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Patient: {appointment.patient.name} | {new Date(appointment.date).toLocaleDateString()} {appointment.time}
                      </Typography>
                      <Chip label={appointment.mode?.toUpperCase() || 'VIDEO'} size="small" sx={{ mr: 1 }} />
                      <Chip label={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)} color={getStatusColor(appointment.status)} size="small" />
                    </Box>
                    {appointment.mode === 'chat' ? (
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Chat mode; admin approval is required to enable messaging.
                        </Typography>

                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => {
                            setSelectedChatAppointment(appointment);
                            setChatRecipients((prev) => ({ ...prev, [appointment._id]: prev[appointment._id] || 'patient' }));
                            window.scrollTo(0, 0);
                          }}
                          sx={{ mb: 1 }}
                        >
                          Open Chat Tab
                        </Button>
                        {((!appointment.chatApproved && appointment.mode === 'chat') || !isAppointmentInBookedSlot(appointment)) && (
                          <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                            {appointment.mode === 'chat' ? 'Chat is available only after admin approval and during the booked appointment time slot.' : 'Chat is available only during the booked appointment time slot.'}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Video call (Meeting ID: {appointment.meetingId || 'Pending'}).
                        </Typography>

                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => {
                            setSelectedVideoAppointment(appointment);
                            window.scrollTo(0, 0);
                          }}
                          sx={{ mb: 1 }}
                          disabled={!isAppointmentInBookedSlot(appointment) || appointment.status !== 'confirmed'}
                        >
                          Join Video Call
                        </Button>
                        {(!isAppointmentInBookedSlot(appointment) || appointment.status !== 'confirmed') && (
                          <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                            Video call is available only during the booked appointment time slot and when confirmed.
                          </Typography>
                        )}
                      </Box>
                    )}
                    {appointment.adminMessage && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Admin note: {appointment.adminMessage}
                      </Typography>
                    )}

                    {appointment.mode === 'chat' ? (
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Chat (text consultations enabled).
                        </Typography>

                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => setSelectedChatAppointment(appointment)}
                          sx={{ mb: 1 }}
                          
                        >
                          Open Chat Tab
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => {
                            setSelectedChatAppointment(appointment);
                            setChatRecipients((prev) => ({ ...prev, [appointment._id]: 'admin' }));
                            window.scrollTo(0, 0);
                          }}

                        >
                          Chat with Admin
                        </Button>
                        {((!appointment.chatApproved && appointment.mode === 'chat') || !isAppointmentInBookedSlot(appointment)) && (
                          <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                            {appointment.mode === 'chat' ? 'Chat is available only after admin approval and during the booked time slot.' : 'Chat is available only during the booked time slot.'}
                          </Typography>
                        )}

                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Video call selected (use Meeting ID at appointment time).
                      </Typography>
                    )}
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Container>
  );
};

export default DoctorDashboard;
