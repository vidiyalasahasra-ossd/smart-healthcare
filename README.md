# AI Healthcare System

A comprehensive healthcare web application with role-based authentication and appointment booking, inspired by Apollo Hospitals.

## Features

### Role-Based Authentication
- **Patient**: Browse doctors, book appointments, view medical history
- **Doctor**: Manage appointments, update availability, view patient details
- **Admin**: Manage doctors, patients, and appointments

### Patient Flow (Apollo-like Experience)
1. **Browse Specializations**: Choose from 14 medical specializations
2. **View Doctors**: Filter doctors by specialization with ratings and experience
3. **Doctor Profile**: Detailed doctor information with qualifications and availability
4. **Book Appointment**: Select date and time slots with confirmation
5. **Appointment Management**: View and manage all appointments

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** for database
- **JWT** for authentication
- **bcrypt** for password hashing

### Frontend
- **React.js** with Material-UI
- **React Router** for navigation
- **Axios** for API calls

## Project Structure

```
ai-healthcare-system/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   └── Appointment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── doctors.js
│   │   └── appointments.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── .env
│   └── package.json
└── client/
    └── frontend/
        ├── src/
        │   ├── components/
        │   │   └── Navbar.js
        │   ├── pages/
        │   │   ├── Login.js
        │   │   ├── Register.js
        │   │   ├── Specializations.js
        │   │   ├── DoctorsList.js
        │   │   ├── DoctorProfile.js
        │   │   ├── BookAppointment.js
        │   │   ├── AppointmentConfirmation.js
        │   │   ├── PatientDashboard.js
        │   │   ├── DoctorDashboard.js
        │   │   └── AdminDashboard.js
        │   ├── services/
        │   │   └── api.js
        │   ├── context/
        │   │   └── AuthContext.js
        │   ├── App.js
        │   └── index.js
        └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   MONGODB_URI=mongodb://localhost:27017/healthcare-system
   PORT=5000
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@example.com
   SMTP_PASS=your_email_app_password
   SMTP_FROM=your_email@example.com
   ```

   OTP emails for registration are sent to the email entered by the user, so the SMTP settings above must be configured for signup to work.

4. Start MongoDB service (if using local MongoDB)

5. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

### Database Setup

The application will automatically create collections when you first run it. To seed some initial data:

1. Register as an admin user
2. Use the admin dashboard to add doctors

### Default Credentials

Create accounts using the registration form with different roles:
- **Admin**: Register with role "Admin"
- **Doctor**: Register with role "Doctor"
- **Patient**: Register with role "Patient" (default)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Doctors
- `GET /api/doctors/specializations` - Get all specializations
- `GET /api/doctors` - Get doctors (with optional specialization filter)
- `GET /api/doctors/:id` - Get doctor by ID
- `POST /api/doctors` - Add new doctor (admin only)
- `PUT /api/doctors/:id/availability` - Update doctor availability

### Appointments
- `POST /api/appointments` - Book new appointment
- `GET /api/appointments` - Get user appointments
- `PUT /api/appointments/:id/status` - Update appointment status
- `PUT /api/appointments/:id/cancel` - Cancel appointment

## Features Overview

### Patient Experience
1. **Registration/Login**: Choose role during registration
2. **Browse Specializations**: Visual cards for each medical specialty
3. **Doctor Discovery**: Filter by specialization, view ratings and experience
4. **Detailed Profiles**: Complete doctor information and availability
5. **Appointment Booking**: Calendar-style slot selection
6. **Confirmation**: Detailed booking confirmation with all details

### Doctor Experience
1. **Dashboard**: View all appointments
2. **Appointment Management**: Accept/reject pending appointments
3. **Availability Management**: Set time slots for each day
4. **Patient Details**: View patient information and appointment history

### Admin Experience
1. **Overview Dashboard**: Statistics and key metrics
2. **Doctor Management**: Add/remove doctors, view all doctors
3. **Appointment Oversight**: Monitor all appointments across the system

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API routes
- Input validation and sanitization

## Future Enhancements

- Email/SMS notifications for appointments
- Doctor profile images upload
- Advanced search and filtering
- Appointment reminders
- Medical records management
- Payment integration
- Video consultation integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
