const fs = require('fs');
const path = require('path');

const SETTINGS_PATH = path.join(__dirname, '..', 'config', 'alertSettings.json');

function readFileSafe() {
  try {
    const raw = fs.readFileSync(SETTINGS_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return {};
  }
}

function writeFileSafe(data) {
  const dir = path.dirname(SETTINGS_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(data, null, 2), 'utf8');
}

async function getAlertSettings() {
  const json = readFileSafe();
  return {
    alertEmail: json.alertEmail || '',
  };
}

async function updateAlertSettings(payload) {
  const current = readFileSafe();
  const next = { ...current, alertEmail: payload.alertEmail || '' };
  writeFileSafe(next);
  return next;
}

module.exports = {
  getAlertSettings,
  updateAlertSettings,
};
