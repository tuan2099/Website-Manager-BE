import React, { useState } from 'react';
import { Box, Tabs, Tab, TextField, Button, Paper, Typography } from '@mui/material';
import { apiRequest, saveTokens, clearTokens, getAccessToken } from '../api';

function LoginForm({ onSuccess, setStatus }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Đang đăng nhập...', 'info');
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      setStatus('Đăng nhập thành công', 'success');
      onSuccess?.(data.user);
    } catch (err) {
      setStatus(err.message, 'error');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
        size="small"
      />
      <TextField
        label="Mật khẩu"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
        size="small"
      />
      <Button type="submit" variant="contained" sx={{ mt: 1 }}>
        Login
      </Button>
    </Box>
  );
}

function RegisterForm({ setStatus }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Đang đăng ký...', 'info');
    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: { name, email, password },
      });
      setStatus('Đăng ký thành công. Hãy đăng nhập.', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Tên hiển thị"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        fullWidth
        size="small"
      />
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
        size="small"
      />
      <TextField
        label="Mật khẩu"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
        size="small"
      />
      <Button type="submit" variant="contained" sx={{ mt: 1 }}>
        Register
      </Button>
    </Box>
  );
}

function ChangePasswordForm({ setStatus }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Đang đổi mật khẩu...', 'info');
    try {
      await apiRequest('/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
      });
      setStatus('Đổi mật khẩu thành công', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setStatus(err.message, 'error');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Mật khẩu hiện tại"
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        required
        fullWidth
        size="small"
      />
      <TextField
        label="Mật khẩu mới"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        fullWidth
        size="small"
      />
      <Button type="submit" variant="contained" sx={{ mt: 1 }}>
        Đổi mật khẩu
      </Button>
    </Box>
  );
}

export function AuthTabs({ setStatus, onUserChange }) {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 420 }}>
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        variant="fullWidth"
        sx={{ mb: 2 }}
      >
        <Tab label="Login" value="login" />
        <Tab label="Change Password" value="changePassword" />
      </Tabs>

      {activeTab === 'login' && (
        <LoginForm
          setStatus={setStatus}
          onSuccess={(user) => {
            onUserChange?.(user);
          }}
        />
      )}
      {activeTab === 'changePassword' && <ChangePasswordForm setStatus={setStatus} />}
    </Paper>
  );
}

export function useAuthInfo() {
  const token = getAccessToken();
  const isAuthenticated = !!token;
  return { isAuthenticated, token, clearTokens, apiRequest };
}
