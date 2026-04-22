import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

// Doctors API
export const doctorsAPI = {
  getSpecializations: () => api.get('/doctors/specializations'),
  getDoctors: (specialization) => api.get('/doctors', { params: { specialization } }),
  getDoctor: (id) => api.get(`/doctors/${id}`),
  getDoctorProfile: () => api.get('/doctors/profile/me'),
  addDoctor: (doctorData) => api.post('/doctors', doctorData),
  updateDoctor: (id, doctorData) => api.put(`/doctors/${id}`, doctorData),
  updateAvailability: (id, availability) => api.put(`/doctors/${id}/availability`, { availability }),
};

// Appointments API
export const appointmentsAPI = {
  bookAppointment: (appointmentData) => api.post('/appointments', appointmentData),
  getAppointments: () => api.get('/appointments'),
  updateStatus: (id, status) => api.put(`/appointments/${id}/status`, { status }),
  cancelAppointment: (id) => api.put(`/appointments/${id}/cancel`),
  adminUpdate: (id, data) => api.put(`/appointments/${id}/admin`, data),
  sendChatMessage: (id, text, recipient) => api.post(`/appointments/${id}/chat`, { text, recipient }),
  requestAdminChat: (id) => api.post(`/appointments/${id}/chat/request-admin`),
  respondAdminChatRequest: (id, approve) => api.put(`/appointments/${id}/chat/request-admin`, { approve }),
};

// Users API
export const usersAPI = {
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Medical Records API
export const recordsAPI = {
  getMyRecords: () => api.get('/records'),
  createRecord: (payload) => api.post('/records', payload),
  updateRecord: (id, payload) => api.put(`/records/${id}`, payload),
  deleteRecord: (id) => api.delete(`/records/${id}`),
};

// OTP API
export const otpAPI = {
  sendOtp: (email) => api.post('/otp/send-otp', { email }),
  verifyOtp: (email, otp) => api.post('/otp/verify-otp', { email, otp }),
};

export default api;
