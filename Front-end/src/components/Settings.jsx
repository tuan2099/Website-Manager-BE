import React, { useEffect, useState } from 'react';
import { Paper, Box, Typography, TextField, Button } from '@mui/material';
import { apiRequest } from '../api';

export function Settings({ setStatus }) {
  const [alertEmail, setAlertEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setStatus('Đang tải cấu hình...', 'info');
    try {
      const res = await apiRequest('/settings/alerts');
      setAlertEmail(res?.alertEmail || '');
      setStatus('Đã tải cấu hình', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus('Đang lưu cấu hình...', 'info');
    try {
      await apiRequest('/settings/alerts', {
        method: 'PUT',
        body: { alertEmail },
      });
      setStatus('Đã lưu cấu hình', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, maxWidth: 480 }}>
      <Typography variant="h6" gutterBottom>
        Settings
      </Typography>

      <Box
        component="form"
        onSubmit={handleSave}
        sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
      >
        <TextField
          label="Alert email (mọi cảnh báo sẽ gửi về đây)"
          size="small"
          type="email"
          value={alertEmail}
          onChange={(e) => setAlertEmail(e.target.value)}
          disabled={loading}
          fullWidth
        />
        <Typography variant="body2" className="muted">
          Nếu để trống, hệ thống sẽ cố gắng gửi cho owner của website hoặc email cấu hình trong ALERT_EMAIL.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Button type="submit" variant="contained" size="small" disabled={saving}>
            Lưu
          </Button>
          <Button type="button" size="small" disabled={loading || saving} onClick={load}>
            Reload
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
