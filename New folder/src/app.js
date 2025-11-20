require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const roleRoutes = require('./modules/roles/role.routes');
const permissionRoutes = require('./modules/permissions/permission.routes');
const activityLogRoutes = require('./modules/activityLogs/activityLog.routes');
const websiteRoutes = require('./modules/websites/website.routes');
const teamRoutes = require('./modules/teams/team.routes');
const apiTokenRoutes = require('./modules/apiTokens/apiToken.routes');
const webhookRoutes = require('./modules/webhooks/webhook.routes');
const settingsRoutes = require('./modules/settings/setting.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/roles', roleRoutes);
app.use('/permissions', permissionRoutes);
app.use('/activity-logs', activityLogRoutes);
app.use('/websites', websiteRoutes);
app.use('/teams', teamRoutes);
app.use('/api-tokens', apiTokenRoutes);
app.use('/webhooks', webhookRoutes);
app.use('/settings', settingsRoutes);
app.use('/dashboard', dashboardRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
