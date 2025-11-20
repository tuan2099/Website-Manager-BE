const app = require('./app');
const { registerSslCheckJob } = require('./cron/sslCheckJob');
const { registerUptimeCheckJob } = require('./cron/uptimeCheckJob');
const { registerDomainExpiryCheckJob } = require('./cron/domainExpiryCheckJob');
const { registerNotificationEmailJob } = require('./cron/notificationEmailJob');

const PORT = process.env.PORT || 3000;

registerSslCheckJob();
registerUptimeCheckJob();
registerDomainExpiryCheckJob();
registerNotificationEmailJob();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
