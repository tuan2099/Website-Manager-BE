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

export function Users({ setStatus }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [assignUserId, setAssignUserId] = useState('');
  const [assignRoleId, setAssignRoleId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    setStatus('Đang tải danh sách users...', 'info');
    try {
      const res = await apiRequest('/users');
      setUsers(res || []);
      setStatus('Đã tải danh sách users', 'success');
    } catch (err) {
      setError(err.message);
      setStatus(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setEditName('');
      setEditActive(true);
      return;
    }
    const u = users.find((x) => x.id === selectedUserId);
    if (u) {
      setEditName(u.name || '');
      setEditActive(u.is_active ?? true);
    }
  }, [selectedUserId, users]);

  const handleAssignRole = async (e) => {
    e.preventDefault();
    if (!assignUserId.trim() || !assignRoleId.trim()) return;
    setAssigning(true);
    setStatus('Đang gán role cho user...', 'info');
    try {
      await apiRequest(`/users/${Number(assignUserId)}/roles`, {
        method: 'POST',
        body: { roleIds: [Number(assignRoleId)] },
      });
      await loadUsers();
      setStatus('Gán role cho user thành công', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    } finally {
      setAssigning(false);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setSavingUser(true);
    setStatus('Đang cập nhật user...', 'info');
    try {
      await apiRequest(`/users/${selectedUserId}`, {
        method: 'PUT',
        body: { name: editName, is_active: editActive },
      });
      await loadUsers();
      setStatus('Cập nhật user thành công', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    } finally {
      setSavingUser(false);
    }
  };

  const handleToggleActive = async () => {
    if (!selectedUserId) return;
    const next = !editActive;
    setSavingUser(true);
    setStatus(next ? 'Đang kích hoạt user...' : 'Đang vô hiệu hoá user...', 'info');
    try {
      await apiRequest(`/users/${selectedUserId}`, {
        method: 'PUT',
        body: { is_active: next },
      });
      await loadUsers();
      setStatus(next ? 'Đã kích hoạt user' : 'Đã vô hiệu hoá user', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    } finally {
      setSavingUser(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) return;
    setCreatingUser(true);
    setStatus('Đang tạo user...', 'info');
    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: { name: newName, email: newEmail, password: newPassword },
      });
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      await loadUsers();
      setStatus('Tạo user thành công', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Users</Typography>
      </Box>

      {loading && <Typography>Đang tải...</Typography>}
      {error && <div className="dashboard-error">Lỗi: {error}</div>}

      <Table size="small" sx={{ mb: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Tên</TableCell>
            <TableCell>Roles</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <span className="muted">Chưa có user nào</span>
              </TableCell>
            </TableRow>
          )}
          {users.map((u) => (
            <TableRow
              key={u.id}
              hover
              sx={{ cursor: 'pointer' }}
              selected={selectedUserId === u.id}
              onClick={() => setSelectedUserId(u.id)}
            >
              <TableCell>{u.id}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.name}</TableCell>
              <TableCell>
                {Array.isArray(u.roles) && u.roles.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {u.roles.map((r) => (
                      <Chip key={r.id || r.name} size="small" label={r.name} />
                    ))}
                  </Box>
                ) : (
                  <span className="muted">Chưa có role</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 2 }}>
        <Box
          component="form"
          onSubmit={handleSaveUser}
          sx={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 1.5 }}
        >
          <Typography variant="subtitle1">Sửa user được chọn</Typography>
          {!selectedUserId && <span className="muted">Chọn một user ở bảng trên để sửa.</span>}
          {selectedUserId && (
            <>
              <TextField
                label="Tên hiển thị"
                size="small"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button type="submit" variant="contained" size="small" disabled={savingUser}>
                  Lưu user
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  color={editActive ? 'error' : 'success'}
                  size="small"
                  disabled={savingUser}
                  onClick={handleToggleActive}
                >
                  {editActive ? 'Vô hiệu hoá' : 'Kích hoạt lại'}
                </Button>
              </Box>
            </>
          )}
        </Box>

        <Box
          component="form"
          onSubmit={handleCreateUser}
          sx={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 1.5 }}
        >
          <Typography variant="subtitle1">Tạo user mới</Typography>
          <TextField
            label="Tên hiển thị"
            size="small"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <TextField
            label="Email"
            type="email"
            size="small"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />
          <TextField
            label="Mật khẩu"
            type="password"
            size="small"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" size="small" disabled={creatingUser}>
            Tạo user
          </Button>
        </Box>

        <Box
          component="form"
          onSubmit={handleAssignRole}
          sx={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 1.5 }}
        >
          <Typography variant="subtitle1">Gán role cho user</Typography>
          <TextField
            label="User ID"
            type="number"
            size="small"
            value={assignUserId}
            onChange={(e) => setAssignUserId(e.target.value)}
            required
          />
          <TextField
            label="Role ID"
            type="number"
            size="small"
            value={assignRoleId}
            onChange={(e) => setAssignRoleId(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" size="small" disabled={assigning}>
            Gán role
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
