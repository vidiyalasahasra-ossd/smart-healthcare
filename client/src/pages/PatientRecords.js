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
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import { recordsAPI } from '../services/api';

const initialForm = {
  title: '',
  recordType: '',
  recordDate: '',
  doctorName: '',
  hospitalName: '',
  notes: '',
  attachmentName: '',
  attachmentType: '',
  attachmentData: '',
};

const toInputDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
};

const toStoragePayload = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    resolve({
      attachmentName: file.name,
      attachmentType: file.type || '',
      attachmentData: reader.result,
    });
  };
  reader.onerror = () => reject(new Error('Failed to read file'));
  reader.readAsDataURL(file);
});

const shortHash = (value) => {
  if (!value) return '-';
  if (value.length <= 16) return value;
  return `${value.slice(0, 10)}...${value.slice(-6)}`;
};

const PatientRecords = () => {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedPreview, setSelectedPreview] = useState('');
  const [chainStatus, setChainStatus] = useState({
    checked: false,
    ok: true,
    message: '',
    count: 0,
  });

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
      const [recordsResponse, chainResponse] = await Promise.all([
        recordsAPI.getMyRecords(),
        recordsAPI.verifyChain().catch((err) => err?.response),
      ]);

      setRecords(recordsResponse.data || []);

      if (chainResponse?.status === 409) {
        setChainStatus({
          checked: true,
          ok: false,
          message: chainResponse.data?.message || 'Record chain validation failed.',
          count: chainResponse.data?.count || 0,
        });
      } else {
        setChainStatus({
          checked: true,
          ok: true,
          message: chainResponse?.data?.message || 'Record chain is valid.',
          count: chainResponse?.data?.count || 0,
        });
      }
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

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const payload = await toStoragePayload(file);
      setForm((prev) => ({
        ...prev,
        ...payload,
      }));
      setSelectedFileName(file.name);
      setSelectedPreview(file.type?.startsWith('image/') ? URL.createObjectURL(file) : '');
    } catch (err) {
      setError(err.message || 'Failed to attach file');
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId('');
    setSelectedFileName('');
    setSelectedPreview('');
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
      attachmentName: record.attachmentName || '',
      attachmentType: record.attachmentType || '',
      attachmentData: record.attachmentData || '',
    });
    setSelectedFileName(record.attachmentName || '');
    setSelectedPreview(record.attachmentType?.startsWith('image/') ? record.attachmentData : '');
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
    <Box
      sx={{
        minHeight: '100vh',
        py: 5,
        background: 'radial-gradient(circle at top left, rgba(37,99,235,0.12), transparent 30%), linear-gradient(135deg, #f8fafc 0%, #eef6ff 50%, #f8fafc 100%)',
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
            My Medical Records
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
            Upload images or files such as lab reports, prescriptions, prescriptions scans, and consultation notes.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            {success}
          </Alert>
        )}
        {chainStatus.checked && (
          <Alert severity={chainStatus.ok ? 'info' : 'warning'} sx={{ mb: 2, borderRadius: 2 }}>
            Blockchain chain status: {chainStatus.message} ({chainStatus.count} blocks)
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card sx={{ borderRadius: 4, boxShadow: '0 18px 45px rgba(37, 99, 235, 0.08)' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <CloudUploadIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {editingId ? 'Edit Record' : 'Add Record'}
                  </Typography>
                </Stack>

                <Box component="form" onSubmit={handleSave}>
                  <Stack spacing={2}>
                    <input
                      id="record-attachment"
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      hidden
                      onChange={handleFileChange}
                    />
                    <Button
                      component="label"
                      htmlFor="record-attachment"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      fullWidth
                      sx={{ justifyContent: 'flex-start', py: 1.2 }}
                    >
                      {selectedFileName ? `Attached: ${selectedFileName}` : 'Attach image or file'}
                    </Button>

                    {selectedPreview && (
                      <Box
                        sx={{
                          border: '1px solid rgba(148,163,184,0.3)',
                          borderRadius: 3,
                          p: 1.5,
                          background: '#fff',
                        }}
                      >
                        <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'text.secondary' }}>
                          Preview
                        </Typography>
                        <Box
                          component="img"
                          src={selectedPreview}
                          alt="Attachment preview"
                          sx={{ width: '100%', borderRadius: 2, maxHeight: 240, objectFit: 'cover' }}
                        />
                      </Box>
                    )}

                    <input type="hidden" value={form.attachmentName} readOnly />
                    <input type="hidden" value={form.attachmentType} readOnly />
                    <input type="hidden" value={form.attachmentData} readOnly />

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
                      label="Record Type"
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
                      name="notes"
                      label="Notes"
                      value={form.notes}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      minRows={4}
                    />

                    <Stack direction="row" spacing={1}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={saving}
                        startIcon={editingId ? <SaveIcon /> : <AddIcon />}
                        sx={{ flex: 1 }}
                      >
                        {saving ? 'Saving...' : editingId ? 'Update Record' : 'Save Record'}
                      </Button>
                      {editingId && (
                        <Button variant="outlined" onClick={resetForm}>
                          Cancel
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card sx={{ borderRadius: 4, boxShadow: '0 18px 45px rgba(15, 23, 42, 0.08)' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Stored Records
                  </Typography>
                  <Chip label={`${sortedRecords.length} items`} color="primary" variant="outlined" />
                </Stack>

                {loading && <Typography color="text.secondary">Loading records...</Typography>}
                {!loading && sortedRecords.length === 0 && (
                  <Typography color="text.secondary">No records saved yet.</Typography>
                )}

                <Stack spacing={2}>
                  {sortedRecords.map((record) => {
                    const isImage = record.attachmentType?.startsWith('image/') && record.attachmentData;
                    return (
                      <Card key={record._id} variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {record.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(record.recordDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={0.5}>
                              <IconButton size="small" onClick={() => startEdit(record)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDelete(record._id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Stack>

                          <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 1.5, flexWrap: 'wrap' }}>
                            <Chip label={record.recordType} size="small" color="primary" />
                            <Chip label={`Block #${record.chainIndex || 0}`} size="small" variant="outlined" />
                            <Chip
                              label={`Hash ${shortHash(record.recordHash)}`}
                              size="small"
                              variant="outlined"
                            />
                            {record.doctorName && <Chip label={`Dr. ${record.doctorName}`} size="small" />}
                            {record.hospitalName && <Chip label={record.hospitalName} size="small" />}
                          </Stack>

                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Prev: {shortHash(record.previousHash)} | Payload: {shortHash(record.payloadHash)}
                          </Typography>

                          {record.notes && (
                            <Typography variant="body2" sx={{ mb: 1.5, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                              {record.notes}
                            </Typography>
                          )}

                          {record.attachmentData && (
                            <Box
                              sx={{
                                border: '1px solid rgba(148,163,184,0.25)',
                                borderRadius: 3,
                                p: 1.5,
                                background: '#fafcff',
                              }}
                            >
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                {isImage ? <ImageIcon fontSize="small" /> : <InsertDriveFileIcon fontSize="small" />}
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {record.attachmentName || 'Attachment'}
                                </Typography>
                              </Stack>
                              {isImage ? (
                                <Box
                                  component="img"
                                  src={record.attachmentData}
                                  alt={record.attachmentName || 'Attachment'}
                                  sx={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 2 }}
                                />
                              ) : (
                                <Button
                                  component="a"
                                  href={record.attachmentData}
                                  download={record.attachmentName || 'attachment'}
                                  target="_blank"
                                  rel="noreferrer"
                                  variant="outlined"
                                  size="small"
                                >
                                  Open File
                                </Button>
                              )}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PatientRecords;
