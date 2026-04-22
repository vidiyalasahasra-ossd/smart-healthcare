import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { recordsAPI } from '../services/api';

const initialForm = {
  title: '',
  recordType: '',
  recordDate: '',
  doctorName: '',
  hospitalName: '',
  notes: '',
  attachmentUrl: '',
};

const toInputDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const PatientRecords = () => {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const sortedRecords = useMemo(
    () =>
      [...records].sort(
        (a, b) =>
          new Date(b.recordDate || b.createdAt).getTime() -
          new Date(a.recordDate || a.createdAt).getTime()
      ),
    [records]
  );

  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await recordsAPI.getMyRecords();
      setRecords(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId('');
  };

  const startEdit = (record) => {
    setError('');
    setSuccess('');
    setEditingId(record._id);
    setForm({
      title: record.title || '',
      recordType: record.recordType || '',
      recordDate: toInputDate(record.recordDate),
      doctorName: record.doctorName || '',
      hospitalName: record.hospitalName || '',
      notes: record.notes || '',
      attachmentUrl: record.attachmentUrl || '',
    });
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        const response = await recordsAPI.updateRecord(editingId, form);
        setRecords((prev) =>
          prev.map((entry) => (entry._id === editingId ? response.data : entry))
        );
        setSuccess('Record updated successfully');
      } else {
        const response = await recordsAPI.createRecord(form);
        setRecords((prev) => [response.data, ...prev]);
        setSuccess('Record saved successfully');
      }
      resetForm();
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.map((entry) => entry.msg).join(', '));
      } else {
        setError(err.response?.data?.message || 'Failed to save record');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setSuccess('');
    try {
      await recordsAPI.deleteRecord(id);
      setRecords((prev) => prev.filter((entry) => entry._id !== id));
      if (editingId === id) resetForm();
      setSuccess('Record deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete record');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        My Medical Records
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Save your reports, consultation notes, and treatment history in one place.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                {editingId ? 'Edit Record' : 'Add Record'}
              </Typography>

              <Box component="form" onSubmit={handleSave}>
                <Stack spacing={2}>
                  <TextField
                    name="title"
                    label="Title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                  <TextField
                    name="recordType"
                    label="Record Type (e.g. Blood Test, Prescription)"
                    value={form.recordType}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                  <TextField
                    name="recordDate"
                    label="Record Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={form.recordDate}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                  <TextField
                    name="doctorName"
                    label="Doctor Name"
                    value={form.doctorName}
                    onChange={handleChange}
                    fullWidth
                  />
                  <TextField
                    name="hospitalName"
                    label="Hospital / Clinic"
                    value={form.hospitalName}
                    onChange={handleChange}
                    fullWidth
                  />
                  <TextField
                    name="attachmentUrl"
                    label="Attachment URL"
                    value={form.attachmentUrl}
                    onChange={handleChange}
                    fullWidth
                  />
                  <TextField
                    name="notes"
                    label="Notes"
                    value={form.notes}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={4}
                  />

                  <Stack direction="row" spacing={1}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={saving}
                      startIcon={editingId ? <SaveIcon /> : <AddIcon />}
                    >
                      {saving ? 'Saving...' : editingId ? 'Update Record' : 'Save Record'}
                    </Button>
                    {editingId && (
                      <Button variant="outlined" onClick={resetForm}>
                        Cancel Edit
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Stored Records
              </Typography>

              {loading && <Typography color="text.secondary">Loading records...</Typography>}
              {!loading && sortedRecords.length === 0 && (
                <Typography color="text.secondary">No records saved yet.</Typography>
              )}

              <Stack spacing={2}>
                {sortedRecords.map((record) => (
                  <Card key={record._id} variant="outlined">
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {record.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(record.recordDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <IconButton size="small" onClick={() => startEdit(record)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(record._id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>

                      <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 1, flexWrap: 'wrap' }}>
                        <Chip label={record.recordType} size="small" color="primary" />
                        {record.doctorName && <Chip label={`Dr: ${record.doctorName}`} size="small" />}
                        {record.hospitalName && <Chip label={record.hospitalName} size="small" />}
                      </Stack>

                      {record.notes && (
                        <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
                          {record.notes}
                        </Typography>
                      )}
                      {record.attachmentUrl && (
                        <Button
                          component="a"
                          href={record.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          size="small"
                          sx={{ px: 0 }}
                        >
                          Open Attachment
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PatientRecords;
