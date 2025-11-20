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
  Chip,
} from '@mui/material';
import { apiRequest } from '../api';

export function ApiTokens({ setStatus }) {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [revokingId, setRevokingId] = useState(null);

  const loadTokens = async () => {
    setLoading(true);
    setError('');
    setStatus('Đang tải API tokens...', 'info');
    try {
      const res = await apiRequest('/api-tokens');
      setTokens(res || []);
      setStatus('Đã tải API tokens', 'success');
    } catch (err) {
      setError(err.message);
      setStatus(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTokens();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setStatus('Đang tạo API token...', 'info');
    try {
      const token = await apiRequest('/api-tokens', {
        method: 'POST',
        body: { description: description || undefined },
      });
      setDescription('');
      // Backend trả token đầy đủ, ta ưu tiên prepend để dễ thấy token mới
      setTokens((prev) => [token, ...(prev || [])]);
      setStatus('Tạo API token thành công', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Revoke token này? Nó sẽ không dùng được nữa.')) return;
    setRevokingId(id);
    setStatus('Đang revoke token...', 'info');
    try {
      await apiRequest(`/api-tokens/${id}`, {
        method: 'DELETE',
      });
      await loadTokens();
      setStatus('Đã revoke token', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">API Tokens</Typography>
      </Box>

      <Box
        component="form"
        onSubmit={handleCreate}
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}
      >
        <TextField
          label="Mô tả (để nhớ token dùng làm gì)"
          size="small"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ minWidth: 260, flex: 1 }}
        />
        <Button type="submit" variant="contained" size="small" disabled={creating}>
          Tạo token
        </Button>
      </Box>

      {loading && <Typography>Đang tải...</Typography>}
      {error && <div className="dashboard-error">Lỗi: {error}</div>}

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Token</TableCell>
            <TableCell>Mô tả</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tokens.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <span className="muted">Chưa có API token nào</span>
              </TableCell>
            </TableRow>
          )}
          {tokens.map((t) => (
            <TableRow key={t.id}>
              <TableCell>{t.id}</TableCell>
              <TableCell sx={{ maxWidth: 260, fontFamily: 'monospace', fontSize: 12 }}>
                {t.token}
              </TableCell>
              <TableCell>{t.description || '-'}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={t.is_active ? 'active' : 'revoked'}
                  color={t.is_active ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell>
                {t.created_at ? new Date(t.created_at).toLocaleString() : '-'}
              </TableCell>
              <TableCell>
                {t.is_active && (
                  <Button
                    type="button"
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => handleRevoke(t.id)}
                    disabled={revokingId === t.id}
                  >
                    Revoke
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Typography variant="body2" className="muted" sx={{ mt: 2 }}>
        Lưu ý: API token hoạt động như mật khẩu. Hãy lưu token mới ngay sau khi tạo, và revoke nếu nghi
        ngờ bị lộ.
      </Typography>
    </Paper>
  );
}
