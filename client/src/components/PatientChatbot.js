import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI, doctorsAPI } from '../services/api';

const SPECIALTY_FALLBACK = [
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
  'Surgery',
  'Urology',
  'Gynecology',
  'Ophthalmology',
  'ENT',
  'Dentistry',
  'General Medicine',
];

const symptomRules = [
  {
    keywords: ['fever', 'temperature'],
    advice:
      'For a mild fever, rest well, drink plenty of fluids, and monitor your temperature. If the fever is high, keeps returning, or comes with weakness or breathing trouble, please get medical help.',
  },
  {
    keywords: ['cough'],
    advice:
      'For a mild cough, warm fluids, rest, and avoiding smoke or dust can help. If the cough lasts a long time, becomes severe, or you have chest pain or breathing difficulty, please see a doctor.',
  },
  {
    keywords: ['cold', 'runny nose', 'sneezing'],
    advice:
      'For a common cold, rest, stay hydrated, and consider steam or saline if it helps you feel better. If symptoms are not improving or are getting worse, a doctor visit is a good idea.',
  },
  {
    keywords: ['headache', 'head ache', 'migraine'],
    advice:
      'For a mild headache, drink water, rest in a quiet room, reduce screen strain, and try to relax. If it is severe, new, or keeps coming back, please speak to a doctor.',
  },
];

const getAvailableDates = (doctor) => {
  const dates = [];
  if (!doctor?.availability?.length) return dates;

  const availableDays = doctor.availability.map((entry) => entry.day);
  const today = new Date();

  for (let i = 0; i < 14; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });

    if (availableDays.includes(weekday)) {
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
      });
    }
  }

  return dates;
};

const getSlotsForSelectedDate = (doctor, selectedDate) => {
  if (!doctor?.availability?.length || !selectedDate) return [];
  const dateObj = new Date(selectedDate);
  if (Number.isNaN(dateObj.getTime())) return [];
  const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const entry = doctor.availability.find((item) => item.day === weekday);
  return entry?.slots?.filter((slot) => slot.available).map((slot) => slot.time) || [];
};

const buildAdvice = (text) => {
  const normalized = text.toLowerCase();
  const matchedRules = symptomRules.filter((rule) =>
    rule.keywords.some((keyword) => normalized.includes(keyword))
  );

  if (matchedRules.length === 0) {
    return '';
  }

  const adviceParts = matchedRules.map((rule) => `- ${rule.advice}`);
  const durationWarning =
    normalized.includes('week') ||
    normalized.includes('7 days') ||
    normalized.includes('more than a week') ||
    normalized.includes('since a week')
      ? '\n\nIf these symptoms have continued for more than a week, please connect with a doctor.'
      : '';

  return `${adviceParts.join('\n')}${durationWarning}`;
};

const PatientChatbot = ({ startToken = 0 }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text:
        'Hi, I am your healthcare assistant. I can give basic symptom advice and help you book an appointment.',
    },
    {
      id: 2,
      sender: 'bot',
      text:
        'Try typing fever, cough, cold, headache, or say "book appointment" to start booking.',
    },
  ]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState('idle');
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [latestSymptomText, setLatestSymptomText] = useState('');
  const [loadingSpecializations, setLoadingSpecializations] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const stepSpecializations = useMemo(() => specializations.length ? specializations : SPECIALTY_FALLBACK, [specializations]);
  const availableDates = useMemo(() => getAvailableDates(selectedDoctor), [selectedDoctor]);
  const timeSlots = useMemo(() => getSlotsForSelectedDate(selectedDoctor, selectedDate), [selectedDoctor, selectedDate]);

  useEffect(() => {
    const fetchSpecializations = async () => {
      setLoadingSpecializations(true);
      try {
        const response = await doctorsAPI.getSpecializations();
        setSpecializations(Array.isArray(response.data) ? response.data : SPECIALTY_FALLBACK);
      } catch (err) {
        setSpecializations(SPECIALTY_FALLBACK);
      } finally {
        setLoadingSpecializations(false);
      }
    };

    fetchSpecializations();
  }, []);

  useEffect(() => {
    if (startToken > 0) {
      startBookingFlow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startToken]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, step, doctors, selectedDoctor, selectedDate, selectedTime, error]);

  const addBotMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        sender: 'bot',
        text,
      },
    ]);
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        sender: 'user',
        text,
      },
    ]);
  };

  const resetBookingState = () => {
    setSelectedSpecialization('');
    setDoctors([]);
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedTime('');
    setError('');
  };

  const startBookingFlow = () => {
    resetBookingState();
    setStep('specialization');
    addBotMessage('Let us book an appointment. First, choose a specialization.');
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    addUserMessage(text);
    setInput('');
    setError('');

    const lower = text.toLowerCase();
    const isBookingIntent = /(book|appointment|doctor|specialist|specialization)/i.test(text);
    const advice = buildAdvice(text);

    if (isBookingIntent) {
      startBookingFlow();
      return;
    }

    if (advice) {
      setLatestSymptomText(text);
      addBotMessage(advice);
      addBotMessage('If your symptoms have lasted more than a week, please book an appointment with a doctor.');
      addBotMessage('If you want, I can help you book one now.');
      return;
    }

    if (lower.includes('help')) {
      addBotMessage('I can help with symptom guidance or booking. Try saying fever, cough, cold, headache, or book appointment.');
      return;
    }

    addBotMessage('Please describe a symptom like fever, cough, cold, or headache, or say "book appointment" to begin booking.');
  };

  const handleQuickSymptom = (symptom) => {
    addUserMessage(symptom);
    const advice = buildAdvice(symptom);
    if (advice) {
      setLatestSymptomText(symptom);
      addBotMessage(advice);
      addBotMessage('If this has been continuing for more than a week, please connect with a doctor.');
    }
  };

  const handleSpecializationSelect = async (specialization) => {
    setSelectedSpecialization(specialization);
    setLoadingDoctors(true);
    setError('');
    setStep('doctor');
    addBotMessage(`Great choice. Here are doctors in ${specialization}. Pick one to continue.`);
    try {
      const response = await doctorsAPI.getDoctors(specialization);
      setDoctors(Array.isArray(response.data) ? response.data : []);
      if (!response.data?.length) {
        addBotMessage(`I could not find any doctors for ${specialization} right now.`);
      }
    } catch (err) {
      setDoctors([]);
      setError('Failed to load doctors for the selected specialization.');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate('');
    setSelectedTime('');
    setStep('date');
    addBotMessage(`Selected Dr. ${doctor.name}. Now choose an available date.`);
  };

  const handleDateSelect = (dateValue) => {
    setSelectedDate(dateValue);
    setSelectedTime('');
    setStep('time');
    const dateLabel = availableDates.find((date) => date.value === dateValue)?.label || dateValue;
    addBotMessage(`Good. Now choose a time slot for ${dateLabel}.`);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setStep('confirm');
    addBotMessage(
      `Please confirm booking with Dr. ${selectedDoctor?.name} on ${selectedDate} at ${time}.`
    );
  };

  const handleConfirmBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;

    setBookingLoading(true);
    setError('');

    try {
      const response = await appointmentsAPI.bookAppointment({
        doctorId: selectedDoctor._id,
        date: selectedDate,
        time: selectedTime,
        mode: 'video',
        symptoms: latestSymptomText,
        notes: 'Booked through chatbot assistant',
      });

      addBotMessage('Your appointment has been booked successfully. Redirecting to confirmation...');
      navigate(`/appointment-confirmation/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <Card
      sx={{
        borderRadius: 4,
        border: '1px solid rgba(148, 163, 184, 0.18)',
        boxShadow: '0 18px 50px rgba(15, 23, 42, 0.08)',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: '#2563eb' }}>
            <SmartToyOutlinedIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Smart Health Assistant
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Basic symptom guidance and guided appointment booking
            </Typography>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mb: 2, borderRadius: 3 }}>
          I can give basic advice for common symptoms. If symptoms continue for more than a week, please see a doctor.
        </Alert>

        <Box
          sx={{
            maxHeight: 420,
            overflowY: 'auto',
            pr: 1,
            mb: 2,
          }}
        >
          <Stack spacing={1.5}>
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '90%',
                  px: 2,
                  py: 1.25,
                  borderRadius: 3,
                  backgroundColor: message.sender === 'user' ? '#2563eb' : '#edf4ff',
                  color: message.sender === 'user' ? '#fff' : '#0f172a',
                  boxShadow: '0 6px 16px rgba(15, 23, 42, 0.06)',
                }}
              >
                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                  {message.text}
                </Typography>
              </Box>
            ))}
            <div ref={bottomRef} />
          </Stack>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            Quick symptom checks
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {['Fever', 'Cough', 'Cold', 'Headache', 'Book appointment'].map((item) => (
              <Chip
                key={item}
                label={item}
                onClick={() => {
                  if (item === 'Book appointment') {
                    startBookingFlow();
                    return;
                  }
                  handleQuickSymptom(item);
                }}
                icon={item === 'Book appointment' ? <CalendarMonthOutlinedIcon /> : <MedicationOutlinedIcon />}
                sx={{
                  bgcolor: item === 'Book appointment' ? '#ffffff' : '#f8fbff',
                  border: '1px solid rgba(148, 163, 184, 0.35)',
                  fontWeight: 600,
                }}
              />
            ))}
          </Stack>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {step === 'specialization' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Choose a specialization
            </Typography>
            {loadingSpecializations ? (
              <CircularProgress size={24} />
            ) : (
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {stepSpecializations.map((specialization) => (
                  <Chip
                    key={specialization}
                    label={specialization}
                    onClick={() => handleSpecializationSelect(specialization)}
                    icon={<LocalHospitalOutlinedIcon />}
                    sx={{
                      bgcolor: selectedSpecialization === specialization ? '#dbeafe' : '#ffffff',
                      border: '1px solid rgba(148, 163, 184, 0.35)',
                      fontWeight: 600,
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        )}

        {step === 'doctor' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Choose a doctor
            </Typography>
            {loadingDoctors ? (
              <CircularProgress size={24} />
            ) : doctors.length === 0 ? (
              <Alert severity="warning">No doctors found for this specialization.</Alert>
            ) : (
              <Stack spacing={1.25}>
                {doctors.map((doctor) => (
                  <Paper
                    key={doctor._id}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      borderColor: 'rgba(148, 163, 184, 0.35)',
                    }}
                  >
                    <Box
                      sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}
                    >
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          Dr. {doctor.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {doctor.experience} years experience | Fee: Rs {doctor.consultationFee}
                        </Typography>
                      </Box>
                      <Button variant="contained" onClick={() => handleDoctorSelect(doctor)}>
                        Select
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        )}

        {step === 'date' && selectedDoctor && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Choose a date for Dr. {selectedDoctor.name}
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {availableDates.map((date) => (
                <Chip
                  key={date.value}
                  label={date.label}
                  onClick={() => handleDateSelect(date.value)}
                  icon={<CalendarMonthOutlinedIcon />}
                  sx={{
                    bgcolor: selectedDate === date.value ? '#dbeafe' : '#ffffff',
                    border: '1px solid rgba(148, 163, 184, 0.35)',
                    fontWeight: 600,
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {step === 'time' && selectedDoctor && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Choose a time slot
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {timeSlots.map((slot) => (
                <Chip
                  key={slot}
                  label={slot}
                  onClick={() => handleTimeSelect(slot)}
                  icon={<AccessTimeOutlinedIcon />}
                  sx={{
                    bgcolor: selectedTime === slot ? '#dbeafe' : '#ffffff',
                    border: '1px solid rgba(148, 163, 184, 0.35)',
                    fontWeight: 600,
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {step === 'confirm' && selectedDoctor && selectedDate && selectedTime && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 3,
              mb: 2,
              bgcolor: '#f8fbff',
              borderColor: 'rgba(148, 163, 184, 0.35)',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Confirm booking
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Dr. {selectedDoctor.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Date: {selectedDate}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Time: {selectedTime}
            </Typography>
            {latestSymptomText && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Symptoms: {latestSymptomText}
              </Typography>
            )}
            <Button
              variant="contained"
              onClick={handleConfirmBooking}
              disabled={bookingLoading}
              startIcon={<CheckCircleOutlineOutlinedIcon />}
            >
              {bookingLoading ? 'Booking...' : 'Confirm and Book'}
            </Button>
          </Paper>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type a symptom or say book appointment"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <IconButton
            onClick={handleSend}
            sx={{
              bgcolor: '#2563eb',
              color: '#fff',
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          This assistant gives basic guidance only and does not replace medical care.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PatientChatbot;
