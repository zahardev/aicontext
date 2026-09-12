#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const FREQUENCY_DAYS = {
  daily: 1,
  weekly: 7,
  biweekly: 14,
  monthly: 30,
};

function readYamlValue(filePath, section, key) {
  try {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    let inSection = false;

    for (const line of lines) {
      if (new RegExp(`^${section}:\\s*(?:#.*)?$`).test(line)) {
        inSection = true;
        continue;
      }
      if (inSection && /^\S[^:]*:/.test(line)) break;
      if (!inSection || /^\s*#/.test(line)) continue;

      const match = line.match(new RegExp(`^\\s+${key}:\\s*([^#\\s]+)`));
      if (match) return match[1].replace(/^['"]|['"]$/g, '');
    }
  } catch {
    // Missing or unreadable config uses the default.
  }

  return null;
}

function readUpdateFrequency(projectRoot) {
  const configDir = path.join(projectRoot, '.aicontext');
  const shared = readYamlValue(path.join(configDir, 'config.yml'), 'update_check', 'frequency');
  const local = readYamlValue(path.join(configDir, 'config.local.yml'), 'update_check', 'frequency');
  const frequency = local || shared || 'weekly';
  return frequency === 'never' || FREQUENCY_DAYS[frequency] ? frequency : 'weekly';
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

function writeJson(filePath, data) {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
  } catch {
    // Update checks must never block startup.
  }
}

function addDays(date, days) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function isNewerVersion(candidate, current) {
  if (!candidate || !current) return false;
  const candidateParts = candidate.split(/[.-]/).slice(0, 3).map(Number);
  const currentParts = current.split(/[.-]/).slice(0, 3).map(Number);
  if (candidateParts.some(Number.isNaN) || currentParts.some(Number.isNaN)) return false;

  for (let index = 0; index < 3; index += 1) {
    if (candidateParts[index] > currentParts[index]) return true;
    if (candidateParts[index] < currentParts[index]) return false;
  }
  return false;
}

function formatUpdateNotice({ cliVersion, currentVersion, latestVersion }) {
  if (!cliVersion || !currentVersion || !latestVersion) return '';
  if (isNewerVersion(latestVersion, cliVersion)) {
    return `AIContext update available: CLI v${cliVersion} is behind v${latestVersion}. Run \`aicontext upgrade\`, then \`aicontext update\`.`;
  }
  if (isNewerVersion(cliVersion, currentVersion)) {
    return `AIContext update available: project v${currentVersion} is behind CLI v${cliVersion}. Run \`aicontext update\`.`;
  }
  return '';
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function executeVersionCheck(projectRoot) {
  const result = spawnSync('aicontext', ['version', projectRoot], {
    stdio: 'ignore',
    timeout: 10000,
  });
  return !result.error && result.status === 0;
}

function runUpdateCheck({
  projectRoot = path.resolve(__dirname, '..', '..'),
  today = new Date().toISOString().slice(0, 10),
  executeVersionCheck: check = executeVersionCheck,
} = {}) {
  try {
    const frequency = readUpdateFrequency(projectRoot);
    if (frequency === 'never') return '';

    const cacheFile = path.join(projectRoot, '.aicontext', 'data', 'version.json');
    const existing = readJson(cacheFile);
    if (isValidDate(existing.nextCheck) && today < existing.nextCheck) return '';

    let succeeded = false;
    try {
      succeeded = check(projectRoot) !== false;
    } catch {
      succeeded = false;
    }

    const refreshed = readJson(cacheFile);
    refreshed.nextCheck = addDays(today, FREQUENCY_DAYS[frequency]);
    writeJson(cacheFile, refreshed);

    return succeeded ? formatUpdateNotice(refreshed) : '';
  } catch {
    return '';
  }
}

module.exports = {
  addDays,
  formatUpdateNotice,
  isNewerVersion,
  readUpdateFrequency,
  runUpdateCheck,
};

if (require.main === module) {
  const notice = runUpdateCheck({
    projectRoot: process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, '..', '..'),
  });
  if (notice) process.stdout.write(`${notice}\n`);
}
