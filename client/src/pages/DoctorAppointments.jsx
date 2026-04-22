import React, { useEffect, useState } from "react";
import { appointmentsAPI } from "../services/api";
import { Container, Typography, Card, Chip, Stack } from "@mui/material";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await appointmentsAPI.getAppointments();
      setAppointments(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const pending = appointments.filter(a => a.status === "pending");
  const confirmed = appointments.filter(a => a.status === "confirmed");

  return (
    <Container sx={{ mt: 4 }}>
  <Typography variant="h4" gutterBottom>
    Doctor Appointments
  </Typography>

  <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>
    Pending Appointments
  </Typography>

  <Stack spacing={2}>
    {pending.map((a) => (
      <Card key={a._id} sx={{ p: 2 }}>
        <Typography sx={{ fontWeight: 600 }}>
          Patient: {a.patient?.name}
        </Typography>

        <Typography>
          {new Date(a.date).toLocaleDateString()} | {a.time}
        </Typography>

        <Chip label="Pending" color="warning" sx={{ mt: 1 }} />
      </Card>
    ))}
  </Stack>

  <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
    Confirmed Appointments
  </Typography>

  <Stack spacing={2}>
    {confirmed.map((a) => (
      <Card key={a._id} sx={{ p: 2 }}>
        <Typography sx={{ fontWeight: 600 }}>
          Patient: {a.patient?.name}
        </Typography>

        <Typography>
          {new Date(a.date).toLocaleDateString()} | {a.time}
        </Typography>

        <Chip label="Confirmed" color="success" sx={{ mt: 1 }} />
      </Card>
    ))}
  </Stack>
</Container>
  );
};

export default DoctorAppointments;