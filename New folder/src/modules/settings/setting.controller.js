const { getAlertSettings, updateAlertSettings } = require('../../services/alertSettingService');

async function getAlerts(req, res) {
  const settings = await getAlertSettings();
  res.json(settings);
}

async function updateAlerts(req, res) {
  const { alertEmail } = req.body;
  const updated = await updateAlertSettings({ alertEmail });
  res.json(updated);
}

module.exports = {
  getAlerts,
  updateAlerts,
};
