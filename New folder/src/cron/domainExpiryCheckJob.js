const cron = require('node-cron');
const db = require('../database/models');

async function runDomainExpiryCheck() {
  const now = new Date();

  const websites = await db.Website.findAll({
    where: {
      domain_expiry_date: { [db.Sequelize.Op.ne]: null },
      monitoring_enabled: true,
    },
  });

  for (const website of websites) {
    if (!website.domain_expiry_date) continue;

    const diffMs = website.domain_expiry_date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 15) {
      const message = `Domain will expire in ${diffDays} days`;

      await db.WebsiteCheck.create({
        website_id: website.id,
        check_type: 'domain',
        status: 'warning',
        response_time_ms: null,
        message,
        raw_data: null,
        checked_at: now,
      });

      const existingAlert = await db.WebsiteAlert.findOne({
        where: {
          website_id: website.id,
          type: 'domain_expiry',
          status: 'open',
        },
      });

      if (!existingAlert) {
        await db.WebsiteAlert.create({
          website_id: website.id,
          type: 'domain_expiry',
          status: 'open',
          message: `Domain ${website.domain} will expire in ${diffDays} days`,
        });

        await db.Notification.create({
          website_id: website.id,
          type: 'domain_expiry',
          channel: 'system',
          payload: JSON.stringify({
            domain: website.domain,
            days: diffDays,
          }),
          status: 'pending',
        });

        await db.Notification.create({
          website_id: website.id,
          type: 'domain_expiry',
          channel: 'email',
          payload: JSON.stringify({
            subject: `[Website Manager] Domain expiring: ${website.domain}`,
            message: `Domain ${website.domain} will expire in ${diffDays} days`,
          }),
          status: 'pending',
        });

        const webhooks = await db.Webhook.findAll({
          where: {
            is_active: true,
            event: 'domain_expiry',
          },
        });

        for (const hook of webhooks) {
          await db.Notification.create({
            website_id: website.id,
            type: 'domain_expiry',
            channel: 'webhook',
            payload: JSON.stringify({
              webhook_id: hook.id,
              url: hook.url,
              event: hook.event,
              domain: website.domain,
              days: diffDays,
            }),
            status: 'pending',
          });
        }
      }

      await db.ActivityLog.create({
        user_id: null,
        endpoint: 'cron:domain-expiry-check',
        method: 'SYSTEM',
        payload: JSON.stringify({ domain: website.domain, days: diffDays }).slice(0, 1000),
        ip: null,
        user_agent: 'cron-job',
      });
    }
  }
}

function registerDomainExpiryCheckJob() {
  cron.schedule('0 2 * * *', async () => {
    try {
      await runDomainExpiryCheck();
    } catch (err) {
      console.error('Domain expiry job failed', err.message);
    }
  });
}

module.exports = { registerDomainExpiryCheckJob };
