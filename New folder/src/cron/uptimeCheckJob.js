const cron = require('node-cron');
const http = require('http');
const https = require('https');
const db = require('../database/models');

function httpPing(url) {
  return new Promise((resolve) => {
    const start = Date.now();

    const lib = url.startsWith('https') ? https : http;

    const req = lib.get(url, (res) => {
      const responseTime = Date.now() - start;
      // We only need headers/status, destroy body early
      res.resume();
      res.on('end', () => {
        resolve({
          ok: res.statusCode && res.statusCode < 500,
          statusCode: res.statusCode,
          responseTime,
          error: null,
        });
      });
    });

    req.on('error', (err) => {
      const responseTime = Date.now() - start;
      resolve({ ok: false, statusCode: null, responseTime, error: err.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      const responseTime = Date.now() - start;
      resolve({ ok: false, statusCode: null, responseTime, error: 'timeout' });
    });
  });
}

async function runUptimeCheck() {
  const now = new Date();

  const websites = await db.Website.findAll({
    where: {
      monitoring_enabled: true,
    },
  });

  const consecutiveDownThreshold = 3;

  for (const website of websites) {
    const domain = website.domain;
    if (!domain) continue;

    const url = domain.startsWith('http') ? domain : `https://${domain}`;

    const result = await httpPing(url);

    let status = 'ok';
    let message = 'Uptime OK';

    if (!result.ok) {
      status = 'error';
      message = `Uptime check failed: ${result.error || result.statusCode}`;
    }

    await db.WebsiteCheck.create({
      website_id: website.id,
      check_type: 'uptime',
      status,
      response_time_ms: result.responseTime,
      message,
      raw_data: {
        statusCode: result.statusCode,
        error: result.error,
      },
      checked_at: now,
    });

    // Update website status based on latest uptime
    if (status === 'ok') website.status = 'online';
    if (status === 'error') website.status = 'offline';
    await website.save();

    // Logic: down X lần liên tiếp -> tạo WebsiteAlert + Notification (stub)
    if (status === 'error') {
      const recentChecks = await db.WebsiteCheck.findAll({
        where: {
          website_id: website.id,
          check_type: 'uptime',
        },
        order: [['checked_at', 'DESC']],
        limit: consecutiveDownThreshold,
      });

      const allErrors =
        recentChecks.length === consecutiveDownThreshold &&
        recentChecks.every((c) => c.status === 'error');

      if (allErrors) {
        const existingOpenAlert = await db.WebsiteAlert.findOne({
          where: {
            website_id: website.id,
            type: 'uptime_down',
            status: 'open',
          },
        });

        const alertMessage = `Website ${website.domain} is down ${consecutiveDownThreshold} times in a row`;

        // Chỉ tạo WebsiteAlert nếu chưa có alert đang mở
        if (!existingOpenAlert) {
          await db.WebsiteAlert.create({
            website_id: website.id,
            type: 'uptime_down',
            status: 'open',
            message: alertMessage,
          });
        }

        // Luôn tạo Notification mới để đảm bảo gửi mail / webhook
        await db.Notification.create({
          website_id: website.id,
          type: 'uptime_down',
          channel: 'system',
          payload: JSON.stringify({
            domain: website.domain,
            message: alertMessage,
          }),
          status: 'pending',
        });

        await db.Notification.create({
          website_id: website.id,
          type: 'uptime_down',
          channel: 'email',
          payload: JSON.stringify({
            subject: `[Website Manager] Website down: ${website.domain}`,
            message: alertMessage,
          }),
          status: 'pending',
        });

        const webhooks = await db.Webhook.findAll({
          where: {
            is_active: true,
            event: 'uptime_down',
          },
        });

        for (const hook of webhooks) {
          await db.Notification.create({
            website_id: website.id,
            type: 'uptime_down',
            channel: 'webhook',
            payload: JSON.stringify({
              webhook_id: hook.id,
              url: hook.url,
              event: hook.event,
              domain: website.domain,
              message: alertMessage,
            }),
            status: 'pending',
          });
        }
      }
    }
  }
}

function registerUptimeCheckJob() {
  // Chạy mỗi 6 tiếng
  cron.schedule('0 */6 * * *', async () => {
    try {
      await runUptimeCheck();
    } catch (err) {
      console.error('Uptime check job failed', err.message);
    }
  });
}

module.exports = { registerUptimeCheckJob };
