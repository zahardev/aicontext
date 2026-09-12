#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const FREQUENCY_DAYS = { daily: 1, weekly: 7, biweekly: 14, monthly: 30 };

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
  } catch {}
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
    const tempFile = `${filePath}.${process.pid}.tmp`;
    fs.writeFileSync(tempFile, `${JSON.stringify(data, null, 2)}\n`);
    fs.renameSync(tempFile, filePath);
  } catch {}
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
  const result = spawnSync('aicontext', ['version', projectRoot], { stdio: 'ignore', timeout: 10000 });
  return !result.error && result.status === 0;
}

function refreshUpdateCache({ projectRoot, today, frequency, executeVersionCheck: check = executeVersionCheck }) {
  const cacheFile = path.join(projectRoot, '.aicontext', 'data', 'version.json');
  let succeeded = false;
  try {
    succeeded = check(projectRoot) !== false;
  } catch {}
  const cache = readJson(cacheFile);
  cache.nextCheck = addDays(today, FREQUENCY_DAYS[frequency] || FREQUENCY_DAYS.weekly);
  cache.noticePending = succeeded && Boolean(formatUpdateNotice(cache));
  writeJson(cacheFile, cache);
}

function dispatchVersionCheck(projectRoot, today, frequency) {
  try {
    const child = spawn(process.execPath, [__filename, '--refresh', projectRoot, today, frequency], {
      detached: true,
      stdio: 'ignore',
    });
    child.once('error', () => {});
    child.unref();
    return true;
  } catch {
    return false;
  }
}

function runUpdateCheck({
  projectRoot = path.resolve(__dirname, '..', '..'),
  today = new Date().toISOString().slice(0, 10),
  dispatchVersionCheck: dispatch = dispatchVersionCheck,
} = {}) {
  try {
    const frequency = readUpdateFrequency(projectRoot);
    if (frequency === 'never') return '';
    const cacheFile = path.join(projectRoot, '.aicontext', 'data', 'version.json');
    const cache = readJson(cacheFile);

    if (cache.noticePending) {
      cache.noticePending = false;
      writeJson(cacheFile, cache);
      const notice = formatUpdateNotice(cache);
      if (notice) return notice;
    }
    if (isValidDate(cache.nextCheck) && today < cache.nextCheck) return '';
    cache.nextCheck = addDays(today, FREQUENCY_DAYS[frequency]);
    writeJson(cacheFile, cache);
    dispatch(projectRoot, today, frequency);
    return '';
  } catch {
    return '';
  }
}

module.exports = {
  addDays,
  formatUpdateNotice,
  isNewerVersion,
  readUpdateFrequency,
  refreshUpdateCache,
  runUpdateCheck,
};

if (require.main === module) {
  if (process.argv[2] === '--refresh') {
    refreshUpdateCache({
      projectRoot: path.resolve(process.argv[3]),
      today: process.argv[4],
      frequency: process.argv[5],
    });
  } else {
    const projectRoot = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, '..', '..');
    const notice = runUpdateCheck({ projectRoot });
    if (notice) process.stdout.write(`${notice}\n`);
  }
}
