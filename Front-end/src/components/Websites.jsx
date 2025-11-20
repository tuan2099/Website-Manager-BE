import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Box,
  TextField,
  Select,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Typography,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { apiRequest } from '../api';

export function Websites({ setStatus }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tag, setTag] = useState('');
  const navigate = useNavigate();
  const [newName, setNewName] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newRegistrar, setNewRegistrar] = useState('');
  const [newHostingProvider, setNewHostingProvider] = useState('');
  const [newHostingPlan, setNewHostingPlan] = useState('');
  const [newServerIp, setNewServerIp] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newMonitoringEnabled, setNewMonitoringEnabled] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = async (params = {}) => {
    setLoading(true);
    setError('');
    setStatus('Đang tải danh sách websites...', 'info');

    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    if (params.search) qs.set('search', params.search);
    if (params.tag) qs.set('tag', params.tag);

    try {
      const res = await apiRequest(`/websites${qs.toString() ? `?${qs.toString()}` : ''}`);
      setItems(res || []);
      setStatus('Đã tải danh sách websites', 'success');
    } catch (err) {
      setError(err.message);
      setStatus(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load({ status: statusFilter, search, tag });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = () => {
    load({ status: statusFilter, search, tag });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newDomain.trim()) return;
    setCreating(true);
    setStatus('Đang tạo website...', 'info');
    try {
      await apiRequest('/websites', {
        method: 'POST',
        body: {
          name: newName,
          domain: newDomain,
          monitoring_enabled: newMonitoringEnabled,
          registrar: newRegistrar || undefined,
          hosting_provider: newHostingProvider || undefined,
          hosting_plan: newHostingPlan || undefined,
          server_ip: newServerIp || undefined,
          notes: newNotes || undefined,
        },
      });
      setNewName('');
      setNewDomain('');
      setNewRegistrar('');
      setNewHostingProvider('');
      setNewHostingPlan('');
      setNewServerIp('');
      setNewNotes('');
      setNewMonitoringEnabled(true);
      await load({ status: statusFilter, search, tag });
      setStatus('Tạo website thành công', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box
        component="form"
        onSubmit={handleCreate}
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}
      >
        <TextField
          label="Tên website mới"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
          size="small"
        />
        <TextField
          label="Registrar (vd: Namecheap)"
          value={newRegistrar}
          onChange={(e) => setNewRegistrar(e.target.value)}
          size="small"
        />
        <TextField
          label="Hosting provider"
          value={newHostingProvider}
          onChange={(e) => setNewHostingProvider(e.target.value)}
          size="small"
        />
        <TextField
          label="Hosting plan"
          value={newHostingPlan}
          onChange={(e) => setNewHostingPlan(e.target.value)}
          size="small"
        />
        <TextField
          label="Server IP"
          value={newServerIp}
          onChange={(e) => setNewServerIp(e.target.value)}
          size="small"
        />
        <TextField
          label="Domain (vd: example.com)"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          required
          size="small"
        />
        <FormControlLabel
          control={(
            <Switch
              size="small"
              checked={newMonitoringEnabled}
              onChange={(e) => setNewMonitoringEnabled(e.target.checked)}
            />
          )}
          label="Enable monitoring"
          sx={{ alignSelf: 'center', ml: 1 }}
        />
        <Button type="submit" variant="contained" disabled={creating} sx={{ alignSelf: 'center' }}>
          Thêm website
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
        <TextField
          label="Tìm theo tên hoặc domain"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
          displayEmpty
        >
          <MenuItem value="">
            <em>Tất cả status</em>
          </MenuItem>
          <MenuItem value="online">Online</MenuItem>
          <MenuItem value="degraded">Degraded</MenuItem>
          <MenuItem value="offline">Offline</MenuItem>
          <MenuItem value="unknown">Unknown</MenuItem>
        </Select>
        <TextField
          label="Tag (ví dụ: prod, staging)"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          size="small"
        />
        <Button type="button" variant="outlined" onClick={handleApplyFilters} disabled={loading}>
          Lọc
        </Button>
      </Box>

      {loading && <Typography>Đang tải...</Typography>}
      {error && <div className="dashboard-error">Lỗi: {error}</div>}

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Tên</TableCell>
            <TableCell>Domain</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Monitoring</TableCell>
            <TableCell>Registrar</TableCell>
            <TableCell>Hosting</TableCell>
            <TableCell>Tags</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <span className="muted">Không có website nào</span>
              </TableCell>
            </TableRow>
          )}
          {items.map((w) => (
            <TableRow
              key={w.id}
              hover
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate(`/websites/${w.id}`)}
            >
              <TableCell>{w.name}</TableCell>
              <TableCell>{w.domain}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={w.status}
                  className={`status-chip status-${w.status}`}
                />
              </TableCell>
              <TableCell>
                {w.monitoring_enabled ? (
                  <Chip size="small" label="On" color="success" />
                ) : (
                  <Chip size="small" label="Off" color="default" />
                )}
              </TableCell>
              <TableCell>{w.registrar || '-'}</TableCell>
              <TableCell>{w.hosting_provider || '-'}</TableCell>
              <TableCell>
                {Array.isArray(w.tags) && w.tags.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {w.tags.map((t) => (
                      <Chip key={t.id || t.name} size="small" label={t.name} className="tag-chip" />
                    ))}
                  </Box>
                ) : (
                  <span className="muted">Không có</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
