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
} from '@mui/material';
import { apiRequest } from '../api';

export function ActivityLogs({ setStatus }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const [methodFilter, setMethodFilter] = useState('');
  const [endpointFilter, setEndpointFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');

  const loadLogs = async (pageToLoad = page) => {
    setLoading(true);
    setError('');
    setStatus('Đang tải activity logs...', 'info');
    try {
      const res = await apiRequest(`/activity-logs?page=${pageToLoad}&limit=${limit}`);
      const data = res?.data || [];
      setLogs(data);
      setTotalPages(res?.pagination?.totalPages || 1);
      setPage(res?.pagination?.page || pageToLoad);
      setStatus('Đã tải activity logs', 'success');
    } catch (err) {
      setError(err.message);
      setStatus(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  const filteredLogs = logs.filter((log) => {
    if (methodFilter && log.method !== methodFilter) return false;
    if (endpointFilter && !log.endpoint.toLowerCase().includes(endpointFilter.toLowerCase())) return false;
    const userLabel = log.user ? `${log.user.email || ''} ${log.user.name || ''}` : '';
    if (userFilter && !userLabel.toLowerCase().includes(userFilter.toLowerCase())) return false;
    return true;
  });

  const handlePrevPage = () => {
    if (page <= 1) return;
    loadLogs(page - 1);
  };

  const handleNextPage = () => {
    if (page >= totalPages) return;
    loadLogs(page + 1);
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Activity Logs
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
        <Select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          size="small"
          displayEmpty
        >
          <MenuItem value="">
            <em>Tất cả methods</em>
          </MenuItem>
          {methods.map((m) => (
            <MenuItem key={m} value={m}>
              {m}
            </MenuItem>
          ))}
        </Select>
        <TextField
          label="Lọc endpoint"
          size="small"
          value={endpointFilter}
          onChange={(e) => setEndpointFilter(e.target.value)}
        />
        <TextField
          label="Lọc theo user (email/tên)"
          size="small"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button variant="outlined" size="small" onClick={() => loadLogs(page)} disabled={loading}>
            Refresh
          </Button>
          <Typography variant="body2">
            Page {page}/{totalPages}
          </Typography>
          <Button size="small" onClick={handlePrevPage} disabled={page <= 1 || loading}>
            Prev
          </Button>
          <Button size="small" onClick={handleNextPage} disabled={page >= totalPages || loading}>
            Next
          </Button>
        </Box>
      </Box>

      {loading && <Typography>Đang tải...</Typography>}
      {error && <div className="dashboard-error">Lỗi: {error}</div>}

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Thời gian</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Method</TableCell>
            <TableCell>Endpoint</TableCell>
            <TableCell>IP</TableCell>
            <TableCell>User Agent</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredLogs.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <span className="muted">Chưa có log hoặc không khớp filter</span>
              </TableCell>
            </TableRow>
          )}
          {filteredLogs.map((log) => (
            <TableRow key={log.id} hover>
              <TableCell>
                {log.created_at ? new Date(log.created_at).toLocaleString() : '-'}
              </TableCell>
              <TableCell>
                {log.user
                  ? `${log.user.email || ''}${log.user.name ? ` (${log.user.name})` : ''}`
                  : 'System'}
              </TableCell>
              <TableCell>{log.method}</TableCell>
              <TableCell>{log.endpoint}</TableCell>
              <TableCell>{log.ip || '-'}</TableCell>
              <TableCell>{log.user_agent || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
