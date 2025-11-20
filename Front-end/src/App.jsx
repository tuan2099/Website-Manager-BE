import React, { useState } from 'react';
import { Routes, Route, NavLink, Navigate, useLocation, useParams, useNavigate } from 'react-router-dom';
import { Box, List, ListItemButton, ListItemText, Divider } from '@mui/material';
import { clearTokens, getAccessToken, apiRequest } from './api';
import { AuthTabs } from './components/AuthTabs';
import { Dashboard } from './components/Dashboard';
import { Websites } from './components/Websites';
import { Teams } from './components/Teams';
import { WebsiteDetail } from './components/WebsiteDetail';
import { Roles } from './components/Roles';
import { Permissions } from './components/Permissions';
import { Users } from './components/Users';
import { ApiTokens } from './components/ApiTokens';
import { Webhooks } from './components/Webhooks';
import { ActivityLogs } from './components/ActivityLogs';
import { Settings } from './components/Settings';

function RequireAuth({ children }) {
  const hasToken = !!getAccessToken();
  const location = useLocation();

  if (!hasToken) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return children;
}

function RequireGuest({ children }) {
  const hasToken = !!getAccessToken();

  if (hasToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function WebsiteDetailRoute({ setStatus }) {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id) {
    return <Navigate to="/websites" replace />;
  }

  return (
    <WebsiteDetail
      websiteId={id}
      onClose={() => navigate('/websites')}
      setStatus={setStatus}
    />
  );
}

export default function App() {
  const [status, setStatusState] = useState({ message: '', type: 'info' });
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();

  const setStatus = (message, type) => {
    setStatusState({ message, type });
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {}
    clearTokens();
    setCurrentUser(null);
    setStatus('Đã logout', 'info');
  };

  const hasToken = !!getAccessToken();

  const path = location.pathname;
  let title = 'Dashboard';
  if (path.startsWith('/auth')) title = 'Authentication';
  else if (path.startsWith('/websites')) title = 'Websites';
  else if (path.startsWith('/teams')) title = 'Teams';
  else if (path.startsWith('/users')) title = 'Users';
  else if (path.startsWith('/roles')) title = 'Roles';
  else if (path.startsWith('/permissions')) title = 'Permissions';
  else if (path.startsWith('/api-tokens')) title = 'API Tokens';
  else if (path.startsWith('/webhooks')) title = 'Webhooks';
  else if (path.startsWith('/activity-logs')) title = 'Activity Logs';
  else if (path.startsWith('/settings')) title = 'Settings';

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-left">
          <span className="app-logo">WM</span>
          <span className="app-title">Website Manager</span>
        </div>
        <div className="app-header-right">
          {hasToken ? (
            <span className="app-user">
              Đã đăng nhập{currentUser ? `: ${currentUser.email}` : ''}
            </span>
          ) : (
            <span className="app-user">Chưa đăng nhập</span>
          )}
          <button type="button" onClick={handleLogout} disabled={!hasToken}>
            Logout
          </button>
        </div>
      </header>

      <div className="app-body">
        <Box component="aside" className="app-sidebar">
          <div className="sidebar-section">Navigation</div>
          <List component="nav" dense>
            <NavLink to="/dashboard">
              {({ isActive }) => (
                <ListItemButton selected={isActive} sx={{ borderRadius: 1 }}>
                  <ListItemText primary="Dashboard" />
                </ListItemButton>
              )}
            </NavLink>
            <NavLink to="/auth">
              {({ isActive }) => (
                <ListItemButton selected={isActive} sx={{ borderRadius: 1 }}>
                  <ListItemText primary="Auth" />
                </ListItemButton>
              )}
            </NavLink>
          </List>
          <Divider sx={{ my: 1 }} />
          <List component="nav" dense>
            <NavLink to="/websites">
              {({ isActive }) => (
                <ListItemButton selected={isActive} sx={{ borderRadius: 1 }}>
                  <ListItemText primary="Websites" />
                </ListItemButton>
              )}
            </NavLink>
            <NavLink to="/teams">
              {({ isActive }) => (
                <ListItemButton selected={isActive} sx={{ borderRadius: 1 }}>
                  <ListItemText primary="Teams" />
                </ListItemButton>
              )}
            </NavLink>
            <NavLink to="/users">
              {({ isActive }) => (
                <ListItemButton selected={isActive} sx={{ borderRadius: 1 }}>
                  <ListItemText primary="Users" />
                </ListItemButton>
              )}
            </NavLink>
            <NavLink to="/roles">
              {({ isActive }) => (
                <ListItemButton selected={isActive} sx={{ borderRadius: 1 }}>
                  <ListItemText primary="Roles" />
                </ListItemButton>
              )}
            </NavLink>
            <NavLink to="/permissions">
              {({ isActive }) => (
                <ListItemButton selected={isActive} sx={{ borderRadius: 1 }}>
                  <ListItemText primary="Permissions" />
                </ListItemButton>
              )}
            </NavLink>
            <NavLink to="/api-tokens">
              {({ isActive }) => (
                <ListItemButton selected={isActive} sx={{ borderRadius: 1 }}>
                  <ListItemText primary="API Tokens" />
                </ListItemButton>
              )}
            </NavLink>
            <NavLink to="/webhooks">
              {({ isActive }) => (
                <ListItemButton selected={isActive} sx={{ borderRadius: 1 }}>
                  <ListItemText primary="Webhooks" />
                </ListItemButton>
              )}
            </NavLink>
            <NavLink to="/activity-logs">
              {({ isActive }) => (
                <ListItemButton selected={isActive} sx={{ borderRadius: 1 }}>
                  <ListItemText primary="Activity Logs" />
                </ListItemButton>
              )}
            </NavLink>
          </List>
          <Divider sx={{ my: 1 }} />
          <List component="nav" dense>
            <NavLink to="/settings">
              {({ isActive }) => (
                <ListItemButton selected={isActive} sx={{ borderRadius: 1 }}>
                  <ListItemText primary="Settings" />
                </ListItemButton>
              )}
            </NavLink>
          </List>
        </Box>

        <main className="app-main">
          <h2 className="main-title">{title}</h2>

          <div className={`status-bar ${status.type}`}>{status.message}</div>

          <Routes>
            <Route
              path="/dashboard"
              element={(
                <RequireAuth>
                  <Dashboard setStatus={setStatus} />
                </RequireAuth>
              )}
            />
            <Route
              path="/websites"
              element={(
                <RequireAuth>
                  <Websites setStatus={setStatus} />
                </RequireAuth>
              )}
            />
            <Route
              path="/websites/:id"
              element={(
                <RequireAuth>
                  <WebsiteDetailRoute setStatus={setStatus} />
                </RequireAuth>
              )}
            />
            <Route
              path="/teams"
              element={(
                <RequireAuth>
                  <Teams setStatus={setStatus} />
                </RequireAuth>
              )}
            />
            <Route
              path="/users"
              element={(
                <RequireAuth>
                  <Users setStatus={setStatus} />
                </RequireAuth>
              )}
            />
            <Route
              path="/roles"
              element={(
                <RequireAuth>
                  <Roles setStatus={setStatus} />
                </RequireAuth>
              )}
            />
            <Route
              path="/permissions"
              element={(
                <RequireAuth>
                  <Permissions setStatus={setStatus} />
                </RequireAuth>
              )}
            />
            <Route
              path="/api-tokens"
              element={(
                <RequireAuth>
                  <ApiTokens setStatus={setStatus} />
                </RequireAuth>
              )}
            />
            <Route
              path="/webhooks"
              element={(
                <RequireAuth>
                  <Webhooks setStatus={setStatus} />
                </RequireAuth>
              )}
            />
            <Route
              path="/settings"
              element={(
                <RequireAuth>
                  <Settings setStatus={setStatus} />
                </RequireAuth>
              )}
            />
            <Route
              path="/auth"
              element={(
                <RequireGuest>
                  <AuthTabs
                    setStatus={setStatus}
                    onUserChange={(user) => {
                      setCurrentUser(user);
                    }}
                  />
                </RequireGuest>
              )}
            />
            <Route
              path="/"
              element={
                hasToken ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
