import React, { useEffect, useState } from 'react';
import { Paper, Grid, Typography, Box } from '@mui/material';
import { apiRequest } from '../api';

export function Dashboard({ setStatus }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      setStatus('Đang tải dashboard...', 'info');
      try {
        const res = await apiRequest('/dashboard/summary');
        if (!cancelled) {
          setData(res);
          setStatus('Đã tải dashboard', 'success');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setStatus(err.message, 'error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading && !data) {
    return <div>Đang tải...</div>;
  }

  if (error && !data) {
    return <div className="dashboard-error">Lỗi: {error}</div>;
  }

  if (!data) return null;

  const cards = [
    {
      label: 'Total Websites',
      value: data.totalWebsites,
    },
    {
      label: 'Offline Websites',
      value: data.offlineWebsites,
      highlight: 'red',
    },
    {
      label: 'SSL Expiring (≤15d)',
      value: data.sslExpiring,
      highlight: 'amber',
    },
    {
      label: 'Domain Expiring (≤15d)',
      value: data.domainExpiring,
      highlight: 'amber',
    },
    {
      label: 'Open Alerts',
      value: data.openAlerts,
      highlight: 'red',
    },
    {
      label: 'Checks last 24h',
      value: data.checksLast24h,
    },
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((c) => (
        <Grid item xs={12} sm={6} md={4} key={c.label}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" className="muted">
              {c.label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color:
                    c.highlight === 'red'
                      ? '#dc2626'
                      : c.highlight === 'amber'
                        ? '#d97706'
                        : 'inherit',
                }}
              >
                {c.value}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
