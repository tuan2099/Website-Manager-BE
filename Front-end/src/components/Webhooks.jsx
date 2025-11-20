import React, { useEffect, useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Button,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import { apiRequest } from '../api';

export function Webhooks({ setStatus }) {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ website_id: '', url: '', event: '', secret: '' });
  const [saving, setSaving] = useState(false);

  const loadWebhooks = async () => {
    setLoading(true);
    setError('');
    setStatus('Đang tải webhooks...', 'info');
    try {
      const res = await apiRequest('/webhooks');
      setWebhooks(res || []);
      setStatus('Đã tải webhooks', 'success');
    } catch (err) {
      setError(err.message);
      setStatus(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWebhooks();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({ website_id: '', url: '', event: '', secret: '' });
  };

  const startEdit = (hook) => {
    setEditingId(hook.id);
    setForm({
      website_id: hook.website_id || '',
      url: hook.url || '',
      event: hook.event || '',
      secret: hook.secret || '',
    });
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.url.trim() || !form.event.trim()) return;
    setSaving(true);
    const isEdit = !!editingId;
    setStatus(isEdit ? 'Đang cập nhật webhook...' : 'Đang tạo webhook...', 'info');
    try {
      const body = {
        website_id: form.website_id ? Number(form.website_id) : null,
        url: form.url,
        event: form.event,
        secret: form.secret || undefined,
      };
      if (isEdit) {
        await apiRequest(`/webhooks/${editingId}`, {
          method: 'PUT',
          body,
        });
      } else {
        await apiRequest('/webhooks', {
          method: 'POST',
          body,
        });
      }
      await loadWebhooks();
      setStatus(isEdit ? 'Cập nhật webhook thành công' : 'Tạo webhook thành công', 'success');
      resetForm();
    } catch (err) {
      setStatus(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xoá webhook này?')) return;
    setSaving(true);
    setStatus('Đang xoá webhook...', 'info');
    try {
      await apiRequest(`/webhooks/${id}`, {
        method: 'DELETE',
      });
      await loadWebhooks();
      setStatus('Đã xoá webhook', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const eventOptions = [
    'website.offline',
    'website.online',
    'ssl.expiringSoon',
    'domain.expiringSoon',
  ];

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Webhooks
      </Typography>

      {loading && <Typography>Đang tải...</Typography>}
      {error && <div className="dashboard-error">Lỗi: {error}</div>}

      <Table size="small" sx={{ mb: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Website ID</TableCell>
            <TableCell>URL</TableCell>
            <TableCell>Event</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell>Created</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {webhooks.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <span className="muted">Chưa có webhook nào</span>
              </TableCell>
            </TableRow>
          )}
          {webhooks.map((h) => (
            <TableRow key={h.id} hover>
              <TableCell>{h.id}</TableCell>
              <TableCell>{h.website_id || '-'}</TableCell>
              <TableCell sx={{ maxWidth: 260, fontSize: 12 }}>{h.url}</TableCell>
              <TableCell>{h.event}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={h.is_active ? 'active' : 'inactive'}
                  color={h.is_active ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell>{h.created_at ? new Date(h.created_at).toLocaleString() : '-'}</TableCell>
              <TableCell>
                <Button type="button" size="small" onClick={() => startEdit(h)} sx={{ mr: 1 }}>
                  Sửa
                </Button>
                <Button
                  type="button"
                  size="small"
                  color="error"
                  variant="outlined"
                  onClick={() => handleDelete(h.id)}
                  disabled={saving}
                >
                  Xoá
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2, maxWidth: 520 }}
      >
        <Typography variant="subtitle1">
          {editingId ? 'Sửa webhook' : 'Tạo webhook mới'}
        </Typography>
        <TextField
          label="Website ID (optional)"
          size="small"
          type="number"
          value={form.website_id}
          onChange={handleChange('website_id')}
        />
        <TextField
          label="URL nhận webhook"
          size="small"
          value={form.url}
          onChange={handleChange('url')}
          required
        />
        <Select
          value={form.event}
          onChange={handleChange('event')}
          size="small"
          displayEmpty
          required
        >
          <MenuItem value="" disabled>
            Chọn event
          </MenuItem>
          {eventOptions.map((ev) => (
            <MenuItem key={ev} value={ev}>
              {ev}
            </MenuItem>
          ))}
        </Select>
        <TextField
          label="Secret (optional)"
          size="small"
          value={form.secret}
          onChange={handleChange('secret')}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button type="submit" variant="contained" size="small" disabled={saving}>
            {editingId ? 'Lưu webhook' : 'Tạo webhook'}
          </Button>
          {editingId && (
            <Button type="button" size="small" onClick={resetForm} disabled={saving}>
              Huỷ sửa
            </Button>
          )}
        </Box>
      </Box>

      <Typography variant="body2" className="muted" sx={{ mt: 2 }}>
        Webhook sẽ được gọi khi các sự kiện tương ứng xảy ra (ví dụ website offline, SSL/Domain sắp hết
        hạn...). Backend của bạn cần implement việc bắn webhook cho từng event.
      </Typography>
    </Paper>
  );
}
