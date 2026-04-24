const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./config/db');
const { router: otpRoutes } = require('./routes/otp');
const { ensureSampleDoctors } = require('./utils/sampleDoctors');
const { ensureAdminUser } = require('./utils/seedAdmin');

const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const userRoutes = require('./routes/users');
const recordRoutes = require('./routes/records');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/otp', otpRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);

app.get('/', (req, res) => {
  res.send('AI Healthcare System Backend');
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    await ensureAdminUser();
    await ensureSampleDoctors();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

startServer();
