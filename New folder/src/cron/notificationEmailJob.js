const cron = require('node-cron');
const db = require('../database/models');
const { sendMail } = require('../utils/emailService');
const { getAlertSettings } = require('../services/alertSettingService');

async function runNotificationEmailJob() {
  const settings = await getAlertSettings();

  const pending = await db.Notification.findAll({
    where: {
      channel: 'email',
      status: 'pending',
    },
    limit: 20,
  });

  for (const notif of pending) {
    try {
      const payload = notif.payload ? JSON.parse(notif.payload) : {};

      // Ưu tiên email global từ Settings
      let to = settings.alertEmail || payload.to;
      let subject = payload.subject || '[Website Manager] Alert';
      let body = payload.body || payload.message;

      if (!to && notif.website_id) {
        const website = await db.Website.findByPk(notif.website_id, {
          include: [{ model: db.User, as: 'owner', attributes: ['email', 'name'] }],
        });
        if (website && website.owner && website.owner.email) {
          to = website.owner.email;
        }
      }

      if (!to && process.env.ALERT_EMAIL) {
        to = process.env.ALERT_EMAIL;
      }

      if (!to) {
        // Không có email đích, skip và đánh dấu failed
        notif.status = 'failed';
        await notif.save();
        continue;
      }

      await sendMail({
        to,
        subject,
        text: body,
      });

      notif.status = 'sent';
      notif.sent_at = new Date();
      await notif.save();
    } catch (err) {
      console.error('Failed to send alert email', err.message);
      notif.status = 'failed';
      await notif.save();
    }
  }
}

function registerNotificationEmailJob() {
  // chạy mỗi phút
  cron.schedule('* * * * *', async () => {
    try {
      await runNotificationEmailJob();
    } catch (err) {
      console.error('notificationEmailJob failed', err.message);
    }
  });
}

module.exports = { registerNotificationEmailJob };
