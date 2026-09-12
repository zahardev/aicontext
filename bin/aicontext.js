#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');
const os = require('os');
const https = require('https');
const { execSync } = require('child_process');

const { version: VERSION } = require('../package.json');
const REPO_URL = 'https://github.com/zahardev/aicontext';
const NPM_PACKAGE = '@zahardev/aicontext';
const CACHE_FILE = path.join(os.tmpdir(), 'aicontext-version-cache.json');
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds
const FRAMEWORK_PROMPTS = [
  'add-step.md', 'add-idea.md', 'aic-help.md', 'aic-skills.md', 'align-context.md', 'challenge.md', 'close-step.md',
  'commit.md', 'create-config.md', 'create-task.md', 'deep-review.md', 'deep-review-criteria.md', 'do-it.md', 'draft-issue.md', 'ensure-config.md', 'identify-task.md',
  'draft-pr.md', 'make-pr.md', 'finish-task.md', 'generate.md', 'gh-fix-tests.md', 'gh-review-fix-loop.md', 'next-step.md', 'plan-tasks.md',
  'gh-review-check.md', 'install-playwright-cli.md', 'prepare-release.md', 'review.md', 'review-criteria.md', 'detect-review-scope.md',
  'brainstorm.md', 'generate-docs.md', 'generate-guide.md', 'generate-reference.md', 'interview.md', 'load-spec.md', 'load-task.md', 'migrate-config.md', 'resolve-asks.md', 'resolve-task-naming.md', 'resolve-test-types.md', 'resolve-tests.md', 'review-task.md', 'run-step.md', 'run-task.md', 'start-feature.md', 'start.md', 'step-loop.md', 'test-writer.md', 'thoughts.md', 'tidy-aic.md', 'web-inspect.md',
];
const DEPRECATED_PROMPTS = ['check_plan.md', 'check_task.md', 'check-task.md', 'review-task-plan.md', 'after_step.md', 'plan.md', 'task.md', 'start-task.md', 'diff-review.md', 'branch-review.md', 'standards-check.md', 'pr-review-check.md', 'check-plan.md', 'run-steps.md', 'review-plan.md', 'review-scope.md', 'update-check.md', 'check-update.md', 'auto-setup.md', 'resolve-task-lifecycle-asks.md', 'resume-task.md'];
const FRAMEWORK_AGENTS = [
  'docs-generator.md',
  'researcher.md',
  'reviewer.md',
  'test-runner.md',
  'test-writer.md',
];
const DEPRECATED_AGENTS = ['pr-review-summarizer.md', 'deep-reviewer.md', 'standards-checker.md'];
const FRAMEWORK_SKILLS = [
  'add-step', 'add-idea', 'create-task', 'start', 'start-feature', 'plan-tasks', 'load-task', 'load-spec', 'review-task', 'run-step', 'run-task', 'finish-task',
  'align-context', 'do-it', 'challenge', 'brainstorm', 'thoughts', 'interview', 'commit', 'review', 'deep-review', 'next-step', 'draft-pr', 'make-pr', 'gh-review-check',
  'draft-issue', 'generate-docs', 'prepare-release', 'gh-review-fix-loop', 'gh-fix-tests', 'web-inspect', 'aic-help', 'aic-skills', 'tidy-aic',
];
const FRAMEWORK_CODEX_SKILLS = [
  'add-step', 'add-idea', 'create-task', 'start', 'start-feature', 'plan-tasks', 'load-task', 'load-spec', 'review-task', 'run-step', 'run-task', 'finish-task',
  'align-context', 'do-it', 'challenge', 'brainstorm', 'thoughts', 'interview', 'commit', 'review', 'deep-review', 'next-step', 'draft-pr', 'make-pr', 'gh-review-check',
  'draft-issue', 'generate-docs', 'prepare-release', 'gh-review-fix-loop', 'gh-fix-tests', 'web-inspect', 'aic-help', 'aic-skills', 'tidy-aic',
];
// Harnesses whose skills are flat `<name>.md` pointer files rather than `<name>/SKILL.md` directories.
const FLAT_POINTER_HARNESSES = {
  opencode: { dir: ['.opencode', 'commands'] },
};
const DEPRECATED_SKILLS = ['task', 'after-step', 'next', 'pr', 'start-task', 'diff-review', 'branch-review', 'standards-check', 'pr-review-check', 'check-plan', 'check-task', 'review-task-plan', 'run-steps', 'review-plan', 'resume-task'];
const FRAMEWORK_SCRIPTS = ['check-update.cjs', 'pr-reviews.cjs', 'pr-resolve.cjs'];
const DEPRECATED_SCRIPTS = ['pr-reviews.js', 'pr-resolve.js'];
const CONFIG_FILE = 'config.yml';
const LEGACY_RESUME_TASK_PROMPT_HASH = 'c3aa05589c9e8240307aa19f22c344dbb3f8d0ba813491ce52594bcaeb831e38';
const LEGACY_SKILL_HASHES = {
  'branch-review': new Set(['3a2eaf122930cdcd6d53a904acb28309c68101226dc09954a9c56e745853ab69', '3fcfd67ca49b04968fe2b2e8735255c6a00e1aca36a6f6a609bf47ff777c8bf1', '81431902ab86f4bd40b392ac51165f52650fa7a2a10a6c4dc3ab1f3f14637631', 'eeba2b94930e1d15f25621e821e38dcaec0fe6eb018cead045629c21ce3ef0d1']),
  'check-plan': new Set(['2a6fb111dce6b04cd056dbb0b1e3d173910e9ece39c4029e5e3a4f581c34bc6d', '7ea921e77599f35a0d1331cacbd8c3b2a12dc9802523a06d8730af246653bad6', '20449a95909a97bb30b818f1608763f9c2399d8b62b28d69cf179b45c666aeb5', '427531de0afa6e51c6353d0684cdd609b3964aa325c5f66296963904a73e4751']),
  'check-task': new Set(['37ce7c45c564cbb07a7cb44c3b4bb4a22816be777cf64c288f8c55846567c6e4', '81c78948ee842e137584e61437e3deb4da8dbf276637ec1a110f40e576d13db0', 'baf9927dcb5d42fa222f2f26784209527a59b8a0ddec3f8b653f6dd9c6268296', '7aa8671a6467dc456236c7bee409b54afd939231febb249a21f2bd8716daa80e', 'b7473ffd53352dc2686d0c1b0cd23a7bff7dcc4203e1265ae682e309209745b9']),
  'diff-review': new Set(['3fe8559f841f38ffe9c2aa87dd277ba12aa25488b25a863b079b51dd6280e17e', '690e26188c95cb685b847de4553f08bf258aae7cd3a766fb7cd86b3b0dccc963', '09cb154e65da72c044bdd46eb274051a39bfe1afd904648e44d1fc1de8cba4f9', '92844dbbeeb9d991863dc22f633ec18c8527c400f5d1454b16bfc8c50bbe3c57']),
  'standards-check': new Set(['4b473586ee5cbcd17f39dd04fef61702489a8d9089d7b4cbabbc008bfd2cb057', '82149ebbb89b39293dc213dfd6d36ff2a84c2f9c37c17a9cae265310a5569f91', '619870ff6dfd1347e86c01ca553a181cf9121628d131559975138e623db07f8e', 'c8701e883220d9d65ed2eb098ac301ff3838dc5ef052291a2f2e570285e41a21']),
  'pr-review-check': new Set(['0254053eaeb8f0ff03f46dba7841d24678f9f62e25fa91d5de2212b4aaf63870', '0a513d4fca85d0fcca6b4e68794f4bf9f851e10aa252fe8fcc0dd34d0bfdacff', 'badb02531544779fe2db880ae255f7bd4d3823f7227e61bdd313ca67f6b6b194', 'c6ff1ffb75a8a206b6533e0ec5f135a3db9069339ac21afa29c76360de379b7d', 'c9624a2acdca7c464577dafeca37aa0eedebe9fbc80ff5f05ba19b39de1e0fac']),
  'review-task-plan': new Set(['40fd326fe3fa6a890e9f2d31980855c41ca4b07e153102e16a50eb5f69b7ea8b', 'd6f785ee6b062a8999e257a297dd3f692e59175413dee9e4b2542b560bd43bba', '3a2d9aaad7b7bff4ede69e39db6481e619edb7c3b2a4ff52beef87fd0001ebeb']),
  'run-steps': new Set(['389782623a8701d0d85dd000c93d1e2f1c1048015c0aa711cc1a73ce93ab9917', '7e3b214cbe19f604a3c2a2eff4c2876e3f508092bf4d7f8cec577c09646a8cf0']),
  'review-plan': new Set(['3537e52c91f541a28a7fd514475db169e90fe9d3fa87c6449fcbb7c4a47a196e', 'e8a5e1e2fd2933ae149dff096d0bf346962bbadab7fde66392f321e733a2f462']),
  'resume-task': new Set(['a74602227cf9522c3f175f3fd4449899ba3f931f7529457ca7a4c349ad4fd3b6', 'e84e074ef053d754afa93b3d516e523e674e91d2e3aa95fd7339d2117ae3302e']),
};
// Fingerprints of all pre-native Pi prompt wrappers shipped through 1.11.0.
const LEGACY_PI_PROMPT_HASHES = new Set([
  '7d5f9135c106de6c582cae8732f9bfd69bc3e62cf70981f35d178c812cf2b655', '483bee6bf7147dd6bdfd016434857de39d1d5a3be825596d343a90234db69e2d', '8e12ff6269b4a9329b4f28eca80ee774232ff1d36ae4803b4bf2d799ae8d5a4d', 'a85ca1e9fbd5f2408f184d9e241b107b40108411e18d95db87849cdac5e5fbb7', '765f79f32b8e89b779de2fbc6ef7bd4ca52fe05657aeac998c4887a28c8f9fe1',
  'e32af71654e7e3d9dc7829e3e2b2af795511f5f295cbdce44d305c379d2f3a07', '4e40dc4542894da4f76892313162c8fd173f46524b81875ebed2f1334a929a5e', 'd398731ae3adeb26ebce06234c8c020b273704120828d989d16813ac69068968', '9031eea9c5828f8525744849045319b04c01f389190c595e57b0aac283cc9ed3', '26f65d3930e6bb32e7191ff5a53a3bc6533c59d8e26e9fa3d1549e0c9365aabd',
  'c210eab7c93fc2e192a6f41c0cc7e57aab940c9e996afe6bc720a856ecdcb448', 'c9b8a88a7aef80efd88880ce98abafd4b6baaadc42320abb30db75c5bce1ce9b', '0f684911094fe9329f3fc2065235090b933a95c596f8136f9ac0b14cb035f625', 'ec424e3b25431c5f1357859a635d7f66420e1c818ebdd503b002f8e41a9d9303', 'd5ce6e631e4df69294b95fa0a716524c3da889f4eec810bb79d431a36a935021',
  '068c382eb4fd15610bb04e3d4decdbcf0e4c78fec4fb51a30b05ce374f8abfdf', '89658e2eedace667a510c2e01d5bf08d8e4e97ec784c38a043d5b0e210ac391b', 'd94bc2bb15701a4cc0286daeaa308ecc4d01107f456c2d8c9daa2c81af778126', '9b43bb706289cb35d81f06d3e02a8b640e3cd45157628892b771e8bbeabd39ba', '266148e1ad27f239f0c0ae5202ea8ebae01697840e5fc69d00ccea86ca7c3434',
  'af609db4197baaa987083bd350a7b57bc31acff6ed0e9506466b52d82cdb237b', '26297bd631ec5ea8b07cf17ba7338bc0f9347c6caf3c46aebf8c6b423538147d', '5871930e415b24ddc4765435f5779e57f44ce168f146f1549676191c5209e578', 'df79fb640bdb9498825d0c8f888cde367eb7d267331924a14baf74b8bc3124f9', '29526c85d01f786334e335edb74e83afcbfc101beb7dc7c1e0aff3dfdb60b784',
  'ac0a0061cd2de53720c661779e3c87ef3734175af85a0d2c5eb52aa9ee1e5915', 'a748b0ca546a88138815123fdc5c286d6703b8705c830d92c167534e3117b1e3', 'f00dad98ad850df22b6e7371c727393ffb269222d02ece2df3a8043288a34549', 'd1c647bf5dd3674e647bfff56a80259948508f4e2dfa03e64449be1107d2b3f7', '677864f5e7f695bb536dca8764375a0321d7d23b4333fce337615ffe8e0b35b0',
  'c489c3b85429e53c99fe76430c74663129dbd9f393c35e3f852a3cf68545c5e4', 'f00abfa3c37e6d5c845a6ac1eeb960b1a2621e6edd156e359f3d4af2fbf09f04', '752495c308595b3fcd958f88c88323876b803001d8b249bbf3e901f79a4f838e', 'b05085f8510abbde61a08d120b7bc82c8801e5ffb9d01e047cc2e481aea740d8', '85af6d90ad15ab5fa77a307919f7e5a12460e4704ab08e0aee7b73e0f81764dc',
]);

function isDirectory(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

const ASSISTANTS = {
  claude: {
    label: 'Claude Code',
    folder: '.claude/',
    detect: (target) => isDirectory(path.join(target, '.claude')),
    install: async (packageRoot, target, opts) => {
      copyRecursive(path.join(packageRoot, '.claude', 'CLAUDE.md'), path.join(target, '.claude', 'CLAUDE.md'));
      await copyFrameworkAgents(packageRoot, target, opts.overrideAgents, opts.skipConfirm);
      await copyFrameworkSkills(packageRoot, target, opts.overrideSkills, opts.skipConfirm);
    },
  },
  cursor: {
    label: 'Cursor',
    folder: '.cursor/',
    detect: (target) => isDirectory(path.join(target, '.cursor')),
    install: (packageRoot, target) => {
      copyRecursive(path.join(packageRoot, '.cursor'), path.join(target, '.cursor'));
    },
  },
  codex: {
    label: 'Codex',
    folder: '.codex/',
    detect: (target) => isDirectory(path.join(target, '.codex')),
    install: async (packageRoot, target, opts) => {
      await copyFrameworkCodexSkills(packageRoot, target, opts.overrideSkills, opts.skipConfirm);
    },
  },
  opencode: {
    label: 'opencode',
    folder: '.opencode/',
    detect: (target) => isDirectory(path.join(target, '.opencode')),
    install: async (packageRoot, target, opts) => {
      await copyFlatPointers('opencode', packageRoot, target, opts.overrideSkills, opts.skipConfirm);
    },
  },
  pi: {
    label: 'Pi',
    folder: '.pi/',
    detect: (target) => isDirectory(path.join(target, '.pi')),
    install: async (packageRoot, target, opts) => {
      await copyFrameworkPiSkills(packageRoot, target, opts.overrideSkills, opts.skipConfirm);
    },
  },
  copilot: {
    label: 'GitHub Copilot',
    folder: '.github/copilot-instructions.md',
    detect: (target) => fs.existsSync(path.join(target, '.github', 'copilot-instructions.md')),
    install: (packageRoot, target) => {
      copyRecursive(path.join(packageRoot, '.github', 'copilot-instructions.md'), path.join(target, '.github', 'copilot-instructions.md'));
    },
  },
};
const ASSISTANT_NAMES = Object.keys(ASSISTANTS);

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function isNewerVersion(latest, current) {
  const latestParts = latest.split('.').map(Number);
  const currentParts = current.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (latestParts[i] > currentParts[i]) return true;
    if (latestParts[i] < currentParts[i]) return false;
  }
  return false;
}

function fetchLatestVersion() {
  return new Promise((resolve) => {
    const url = `https://registry.npmjs.org/${NPM_PACKAGE}/latest`;
    https
      .get(url, { timeout: 3000 }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json.version || null);
          } catch {
            resolve(null);
          }
        });
      })
      .on('error', () => resolve(null))
      .on('timeout', function () {
        this.destroy();
        resolve(null);
      });
  });
}

function readCache() {
  const file = CACHE_FILE;
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch {
    // Ignore cache errors
  }
  return null;
}

function writeCache(latestVersion) {
  const file = CACHE_FILE;
  try {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(file, JSON.stringify({
      latestVersion,
      timestamp: Date.now(),
      lastChecked: new Date().toISOString(),
    }));
  } catch {
    // Ignore cache write errors
  }
}

function writeVersionCache(filePath, { cliVersion, currentVersion, latestVersion }) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const today = new Date().toISOString().slice(0, 10);
    let existing = {};
    try {
      existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {}
    const tempFile = `${filePath}.${process.pid}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify({
      ...existing,
      cliVersion: cliVersion ?? null,
      currentVersion: currentVersion ?? null,
      latestVersion: latestVersion ?? null,
      lastChecked: today,
    }, null, 2) + '\n');
    fs.renameSync(tempFile, filePath);
  } catch {
    // Ignore cache write errors
  }
}

function clearCache() {
  const file = CACHE_FILE;
  try {
    fs.rmSync(file, { force: true });
  } catch {
    // Ignore cache deletion errors
  }
}

async function checkForUpdates() {
  const cache = readCache();
  let latestVersion = null;

  // Use cached version if still fresh
  if (cache?.latestVersion && cache.timestamp && Date.now() - cache.timestamp < CACHE_TTL) {
    latestVersion = cache.latestVersion;
  }

  if (!latestVersion) {
    // Fetch from npm registry
    latestVersion = await fetchLatestVersion();
    if (latestVersion) {
      writeCache(latestVersion);
    }
  }

  if (latestVersion && isNewerVersion(latestVersion, VERSION)) {
    log(`\nUpdate available: v${VERSION} → v${latestVersion}`, 'yellow');
    log(`Run: aicontext upgrade\n`, 'dim');
  }
}

function getPackageRoot() {
  return path.resolve(__dirname, '..');
}

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
}

function getExistingFiles(target) {
  const existing = [];
  const checkPaths = [
    '.aicontext',
    '.claude',
    '.codex',
    '.cursor',
    '.opencode',
    '.pi',
    '.github/copilot-instructions.md',
  ];

  for (const p of checkPaths) {
    const fullPath = path.join(target, p);
    if (fs.existsSync(fullPath)) {
      existing.push(p);
    }
  }

  return existing;
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;

  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function hasExistingPrompts(target) {
  const promptsDir = path.join(target, '.aicontext', 'prompts');
  if (!fs.existsSync(promptsDir)) return false;
  const allKnownPrompts = [...FRAMEWORK_PROMPTS, ...DEPRECATED_PROMPTS];
  return allKnownPrompts.some((file) => fs.existsSync(path.join(promptsDir, file)));
}

function hasExistingFrameworkFiles(target) {
  const agentsDir = path.join(target, '.claude', 'agents');
  const skillsDir = path.join(target, '.claude', 'skills');
  const codexSkillsDir = path.join(target, '.codex', 'skills');
  const piSkillsDir = path.join(target, '.pi', 'skills');
  const hasAgent = FRAMEWORK_AGENTS.some((f) => fs.existsSync(path.join(agentsDir, f)));
  const hasSkill = FRAMEWORK_SKILLS.some((s) => fs.existsSync(path.join(skillsDir, s, 'SKILL.md')));
  const hasCodexSkill = FRAMEWORK_CODEX_SKILLS.some((s) => fs.existsSync(path.join(codexSkillsDir, s, 'SKILL.md')));
  const hasPiSkill = FRAMEWORK_SKILLS.some((s) => fs.existsSync(path.join(piSkillsDir, s, 'SKILL.md')));
  const hasFlatPointer = Object.values(FLAT_POINTER_HARNESSES).some(({ dir }) =>
    FRAMEWORK_SKILLS.some((s) => fs.existsSync(path.join(target, ...dir, `${s}.md`)))
  );
  return hasAgent || hasSkill || hasCodexSkill || hasPiSkill || hasFlatPointer || hasExistingPrompts(target);
}

function removeDeprecatedPrompts(target) {
  const promptsDir = path.join(target, '.aicontext', 'prompts');
  for (const file of DEPRECATED_PROMPTS) {
    const filePath = path.join(promptsDir, file);
    if (fs.existsSync(filePath) && (file !== 'resume-task.md' || isGeneratedResumeTaskPrompt(fs.readFileSync(filePath, 'utf8')))) {
      fs.unlinkSync(filePath);
    }
  }
}

function isGeneratedResumeTaskPrompt(content) {
  return crypto.createHash('sha256').update(content).digest('hex') === LEGACY_RESUME_TASK_PROMPT_HASH;
}

function removeDeprecatedAgents(target) {
  const agentsDir = path.join(target, '.claude', 'agents');
  for (const file of DEPRECATED_AGENTS) {
    const filePath = path.join(agentsDir, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      log(`  Removed deprecated: agents/${file}`, 'dim');
    }
  }
}

// Matches a pointer file this CLI generated: description-only frontmatter, the pointer line
// for this exact skill, and nothing else but an optional $ARGUMENTS line.
function isGeneratedPointer(content, skill) {
  const match = /^---\r?\n(?<frontmatter>[\s\S]*?)\r?\n---\r?\n(?<body>[\s\S]*)$/.exec(content);
  if (!match) return false;

  const frontmatterKeys = match.groups.frontmatter
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => line.split(':')[0].trim());
  if (frontmatterKeys.some((key) => key !== 'description')) return false;

  const bodyLines = match.groups.body.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const promptReference = `Read and follow \`.aicontext/prompts/${skill}.md\``;
  return bodyLines[0] === promptReference &&
    (bodyLines.length === 1 || (bodyLines.length === 2 && bodyLines[1] === '$ARGUMENTS'));
}

function isGeneratedPiPromptWrapper(content) {
  return LEGACY_PI_PROMPT_HASHES.has(crypto.createHash('sha256').update(content).digest('hex'));
}

function removeGeneratedPiPromptWrappers(target) {
  const promptsDir = path.join(target, '.pi', 'prompts');
  if (!fs.existsSync(promptsDir)) return;

  for (const skill of [...FRAMEWORK_SKILLS, ...DEPRECATED_SKILLS]) {
    const filePath = path.join(promptsDir, `${skill}.md`);
    if (!fs.existsSync(filePath) || !isGeneratedPiPromptWrapper(fs.readFileSync(filePath, 'utf8'))) continue;
    fs.unlinkSync(filePath);
    log(`  Removed generated Pi prompt: prompts/${skill}.md`, 'dim');
  }

  if (fs.readdirSync(promptsDir).length === 0) fs.rmdirSync(promptsDir);
}

function migrateOpenCodePointers(target) {
  const legacyDir = path.join(target, '.opencode', 'command');
  const commandsDir = path.join(target, '.opencode', 'commands');
  if (!fs.existsSync(legacyDir)) return;

  for (const skill of [...FRAMEWORK_SKILLS, ...DEPRECATED_SKILLS]) {
    const legacyFile = path.join(legacyDir, `${skill}.md`);
    if (!fs.existsSync(legacyFile) || !isGeneratedPointer(fs.readFileSync(legacyFile, 'utf8'), skill)) continue;
    if (DEPRECATED_SKILLS.includes(skill)) {
      fs.unlinkSync(legacyFile);
      continue;
    }
    fs.mkdirSync(commandsDir, { recursive: true });
    const commandFile = path.join(commandsDir, `${skill}.md`);
    if (!fs.existsSync(commandFile)) fs.renameSync(legacyFile, commandFile);
    else fs.unlinkSync(legacyFile);
  }
  log('  Migrated generated OpenCode commands to .opencode/commands/', 'dim');
}

function isGeneratedSkill(content, skill) {
  return LEGACY_SKILL_HASHES[skill]?.has(crypto.createHash('sha256').update(content).digest('hex')) ?? false;
}

function isGeneratedCodexPolicy(content) {
  return /^policy:\r?\n  allow_implicit_invocation: (true|false)\r?\n?$/.test(content);
}

function removeDeprecatedSkills(target) {
  // OpenCode shares its command folder with the user's own files, so a name match is not enough -
  // only remove files that still match the pointer shape this CLI generates.
  for (const { dir } of Object.values(FLAT_POINTER_HARNESSES)) {
    for (const skill of DEPRECATED_SKILLS) {
      const filePath = path.join(target, ...dir, `${skill}.md`);
      if (!fs.existsSync(filePath)) continue;
      if (!isGeneratedPointer(fs.readFileSync(filePath, 'utf8'), skill)) continue;
      fs.unlinkSync(filePath);
      log(`  Removed deprecated: ${path.relative(target, filePath)}`, 'dim');
    }
  }

  for (const [dir, hasPolicy] of [[path.join(target, '.claude', 'skills'), false], [path.join(target, '.codex', 'skills'), true]]) {
    for (const skill of DEPRECATED_SKILLS) {
      const skillPath = path.join(dir, skill);
      const skillFile = path.join(skillPath, 'SKILL.md');
      if (!fs.existsSync(skillFile) || !isGeneratedSkill(fs.readFileSync(skillFile, 'utf8'), skill)) continue;

      fs.unlinkSync(skillFile);
      const policyPath = path.join(skillPath, 'agents', 'openai.yaml');
      if (hasPolicy && fs.existsSync(policyPath) && isGeneratedCodexPolicy(fs.readFileSync(policyPath, 'utf8'))) {
        fs.unlinkSync(policyPath);
      }
      const agentsPath = path.join(skillPath, 'agents');
      if (fs.existsSync(agentsPath) && fs.readdirSync(agentsPath).length === 0) fs.rmdirSync(agentsPath);
      if (fs.existsSync(skillPath) && fs.readdirSync(skillPath).length === 0) fs.rmdirSync(skillPath);
      log(`  Removed deprecated: ${path.relative(target, skillPath)}/`, 'dim');
    }
  }
}

function setAgentModel(target, model) {
  const agentsDir = path.join(target, '.claude', 'agents');
  if (!fs.existsSync(agentsDir)) return;

  for (const file of FRAMEWORK_AGENTS) {
    const filePath = path.join(agentsDir, file);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/^model:\s*\w+/m, `model: ${model}`);
    fs.writeFileSync(filePath, content);
  }
}

function selfHealMissingFiles(packageRoot, target, presentAssistants) {
  let healed = 0;

  // Prompts (shared)
  const promptSrcDir = path.join(packageRoot, '.aicontext', 'prompts');
  const promptDestDir = path.join(target, '.aicontext', 'prompts');
  fs.mkdirSync(promptDestDir, { recursive: true });
  for (const file of FRAMEWORK_PROMPTS) {
    const src = path.join(promptSrcDir, file);
    const dest = path.join(promptDestDir, file);
    if (fs.existsSync(src) && !fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
      log(`  Restored: prompts/${file}`, 'yellow');
      healed++;
    }
  }

  // Scripts (shared)
  const scriptSrcDir = path.join(packageRoot, '.aicontext', 'scripts');
  const scriptDestDir = path.join(target, '.aicontext', 'scripts');
  for (const file of FRAMEWORK_SCRIPTS) {
    const src = path.join(scriptSrcDir, file);
    const dest = path.join(scriptDestDir, file);
    if (fs.existsSync(src) && !fs.existsSync(dest)) {
      fs.mkdirSync(scriptDestDir, { recursive: true });
      fs.copyFileSync(src, dest);
      log(`  Restored: scripts/${file}`, 'yellow');
      healed++;
    }
  }

  // Per-assistant files
  for (const name of presentAssistants) {
    if (name === 'claude') {
      const claudeSrc = path.join(packageRoot, '.claude', 'CLAUDE.md');
      const claudeDest = path.join(target, '.claude', 'CLAUDE.md');
      if (fs.existsSync(claudeSrc) && !fs.existsSync(claudeDest)) {
        fs.mkdirSync(path.dirname(claudeDest), { recursive: true });
        fs.copyFileSync(claudeSrc, claudeDest);
        log(`  Restored: .claude/CLAUDE.md`, 'yellow');
        healed++;
      }

      const agentSrcDir = path.join(packageRoot, '.claude', 'agents');
      const agentDestDir = path.join(target, '.claude', 'agents');
      for (const file of FRAMEWORK_AGENTS) {
        const src = path.join(agentSrcDir, file);
        const dest = path.join(agentDestDir, file);
        if (fs.existsSync(src) && !fs.existsSync(dest)) {
          fs.mkdirSync(agentDestDir, { recursive: true });
          fs.copyFileSync(src, dest);
          log(`  Restored: agents/${file}`, 'yellow');
          healed++;
        }
      }
      const skillSrcDir = path.join(packageRoot, '.claude', 'skills');
      const skillDestDir = path.join(target, '.claude', 'skills');
      for (const skill of FRAMEWORK_SKILLS) {
        const src = path.join(skillSrcDir, skill, 'SKILL.md');
        const dest = path.join(skillDestDir, skill, 'SKILL.md');
        if (fs.existsSync(src) && !fs.existsSync(dest)) {
          fs.mkdirSync(path.join(skillDestDir, skill), { recursive: true });
          fs.copyFileSync(src, dest);
          log(`  Restored: skills/${skill}/SKILL.md`, 'yellow');
          healed++;
        }
      }
    } else if (name === 'codex') {
      const codexSrcDir = path.join(packageRoot, '.codex', 'skills');
      const codexDestDir = path.join(target, '.codex', 'skills');
      for (const skill of FRAMEWORK_CODEX_SKILLS) {
        for (const file of ['SKILL.md', path.join('agents', 'openai.yaml')]) {
          const src = path.join(codexSrcDir, skill, file);
          const dest = path.join(codexDestDir, skill, file);
          if (fs.existsSync(src) && !fs.existsSync(dest)) {
            fs.mkdirSync(path.dirname(dest), { recursive: true });
            fs.copyFileSync(src, dest);
            log(`  Restored: .codex/skills/${skill}/${file}`, 'yellow');
            healed++;
          }
        }
      }
    } else if (name === 'pi') {
      const piSrcDir = path.join(packageRoot, '.pi', 'skills');
      const piDestDir = path.join(target, '.pi', 'skills');
      for (const skill of FRAMEWORK_SKILLS) {
        const src = path.join(piSrcDir, skill, 'SKILL.md');
        const dest = path.join(piDestDir, skill, 'SKILL.md');
        if (fs.existsSync(src) && !fs.existsSync(dest)) {
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.copyFileSync(src, dest);
          log(`  Restored: .pi/skills/${skill}/SKILL.md`, 'yellow');
          healed++;
        }
      }
    } else if (FLAT_POINTER_HARNESSES[name]) {
      const { dir } = FLAT_POINTER_HARNESSES[name];
      for (const skill of FRAMEWORK_SKILLS) {
        const src = path.join(packageRoot, ...dir, `${skill}.md`);
        const dest = path.join(target, ...dir, `${skill}.md`);
        if (fs.existsSync(src) && !fs.existsSync(dest)) {
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.copyFileSync(src, dest);
          log(`  Restored: ${dir.join('/')}/${skill}.md`, 'yellow');
          healed++;
        }
      }
    }
  }

  return healed;
}

function copyFrameworkPrompts(packageRoot, target, skipExisting = false) {
  const srcDir = path.join(packageRoot, '.aicontext', 'prompts');
  const destDir = path.join(target, '.aicontext', 'prompts');
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of FRAMEWORK_PROMPTS) {
    const src = path.join(srcDir, file);
    const dest = path.join(destDir, file);
    if (fs.existsSync(src)) {
      if (skipExisting && fs.existsSync(dest)) continue;
      fs.copyFileSync(src, dest);
    }
  }
}

async function copyFrameworkAgents(packageRoot, target, overrideAgents = false, skipConfirm = false) {
  const srcDir = path.join(packageRoot, '.claude', 'agents');
  const destDir = path.join(target, '.claude', 'agents');
  fs.mkdirSync(destDir, { recursive: true });

  for (const file of FRAMEWORK_AGENTS) {
    const src = path.join(srcDir, file);
    if (!fs.existsSync(src)) continue;

    const dest = path.join(destDir, file);
    if (fs.existsSync(dest)) {
      if (overrideAgents) {
        fs.copyFileSync(src, dest);
        log(`  Overridden: agents/${file}`, 'yellow');
      } else if (skipConfirm) {
        log(`  Skipped: agents/${file} (already exists)`, 'dim');
      } else {
        const shouldOverride = await promptYesNo(`  agents/${file} already exists. Override? (y/N): `, false);
        if (shouldOverride) {
          fs.copyFileSync(src, dest);
          log(`  Overridden: agents/${file}`, 'yellow');
        } else {
          log(`  Skipped: agents/${file}`, 'dim');
        }
      }
    } else {
      fs.copyFileSync(src, dest);
      log(`  Copied: agents/${file}`, 'dim');
    }
  }
}

// Copies one skill file, applying the shared override/skip/prompt policy for files the user may have edited.
async function copySkillFile(src, dest, display, overrideSkills, skipConfirm) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });

  if (!fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
    log(`  Copied: ${display}`, 'dim');
    return;
  }

  if (overrideSkills) {
    fs.copyFileSync(src, dest);
    log(`  Overridden: ${display}`, 'yellow');
  } else if (skipConfirm) {
    log(`  Skipped: ${display} (already exists)`, 'dim');
  } else if (await promptYesNo(`  ${display} already exists. Override? (y/N): `, false)) {
    fs.copyFileSync(src, dest);
    log(`  Overridden: ${display}`, 'yellow');
  } else {
    log(`  Skipped: ${display}`, 'dim');
  }
}

async function copyFrameworkSkills(packageRoot, target, overrideSkills = false, skipConfirm = false) {
  const srcDir = path.join(packageRoot, '.claude', 'skills');
  const destDir = path.join(target, '.claude', 'skills');
  fs.mkdirSync(destDir, { recursive: true });

  for (const skill of FRAMEWORK_SKILLS) {
    const src = path.join(srcDir, skill, 'SKILL.md');
    if (!fs.existsSync(src)) continue;

    const dest = path.join(destDir, skill, 'SKILL.md');
    await copySkillFile(src, dest, `skills/${skill}/SKILL.md`, overrideSkills, skipConfirm);
  }
}

// Maps a commit-interview answer to a config value.
// '2' → 'true' (yes), '3' → 'false' (no), anything else → null (keep template default 'ask').
function resolveCommitAnswer(answer) {
  if (answer === '2') return 'true';
  if (answer === '3') return 'false';
  return null;
}

function setConfigValue(content, section, key, value) {
  const lines = content.split('\n');
  let inSection = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(new RegExp(`^${section}:\\s*$`))) {
      inSection = true;
      continue;
    }
    if (inSection && /^[a-z_]+:/.test(lines[i])) break; // next section
    if (inSection) {
      // Match both active and commented keys
      const isCommented = /^\s+#/.test(lines[i]);
      const keyPattern = new RegExp(`^(\\s+)#?\\s*${key}:\\s*`);
      if (keyPattern.test(lines[i])) {
        const indent = lines[i].match(/^\s+/)?.[0] || '  ';
        // Only preserve trailing comments on active (non-commented) lines
        const comment = !isCommented ? (lines[i].match(/\s+#\s.*$/)?.[0] || '') : '';
        lines[i] = `${indent}${key}: ${value}${comment}`;
        return lines.join('\n');
      }
    }
  }
  return content;
}

async function installConfig(packageRoot, target, skipConfirm = false) {
  const templateSrc = path.join(packageRoot, '.aicontext', 'templates', 'config.template.yml');
  const configDest = path.join(target, '.aicontext', CONFIG_FILE);

  if (!fs.existsSync(templateSrc)) return;

  if (!fs.existsSync(configDest)) {
    fs.copyFileSync(templateSrc, configDest);

    if (!skipConfirm) {
      log('\nConfiguring project settings:', 'cyan');
      let content = fs.readFileSync(configDest, 'utf8');

      // Base branch — auto-detect, offer choices
      let detectedBranch = 'main';
      try {
        const branches = execSync('git branch', { cwd: target, stdio: ['pipe', 'pipe', 'pipe'] }).toString();
        if (/\bmain\b/.test(branches)) detectedBranch = 'main';
        else if (/\bmaster\b/.test(branches)) detectedBranch = 'master';
        else if (/\bdevelop\b/.test(branches)) detectedBranch = 'develop';
      } catch { /* not a git repo, keep default */ }
      const branchOptions = detectedBranch === 'main' ? '1) main (detected), 2) master, 3) develop, 4) other'
        : detectedBranch === 'master' ? '1) master (detected), 2) main, 3) develop, 4) other'
        : '1) develop (detected), 2) main, 3) master, 4) other';
      const branchAnswer = await prompt(`  Base branch — ${branchOptions}: `);
      const branchMap = {
        main: { '2': 'master', '3': 'develop' },
        master: { '2': 'main', '3': 'develop' },
        develop: { '2': 'main', '3': 'master' },
      };
      let baseBranch = detectedBranch;
      if (branchAnswer === '4') {
        baseBranch = await prompt('  Enter branch name: ') || detectedBranch;
      } else if (branchMap[detectedBranch]?.[branchAnswer]) {
        baseBranch = branchMap[detectedBranch][branchAnswer];
      }
      if (baseBranch !== 'main') {
        content = setConfigValue(content, 'project', 'base_branch', baseBranch);
      }

      // Lifecycle commit actions — two questions, one per timing
      const stepCommitAnswer = await prompt('  After each step, commit? — 1) ask per run (default), 2) yes, 3) no: ');
      const stepCommitValue = resolveCommitAnswer(stepCommitAnswer);
      if (stepCommitValue !== null) {
        content = setConfigValue(content, 'after_step', 'commit', stepCommitValue);
      }

      const taskCommitAnswer = await prompt('  After task completion, commit? — 1) ask per run (default), 2) yes, 3) no: ');
      const taskCommitValue = resolveCommitAnswer(taskCommitAnswer);
      if (taskCommitValue !== null) {
        content = setConfigValue(content, 'after_task', 'commit', taskCommitValue);
      }

      // Update check frequency
      const updateAnswer = await prompt('  Update check frequency — 1) weekly (default), 2) daily, 3) biweekly, 4) monthly, 5) never: ');
      const freqMap = { '2': 'daily', '3': 'biweekly', '4': 'monthly', '5': 'never' };
      const freq = freqMap[updateAnswer] || 'weekly';
      content = setConfigValue(content, 'update_check', 'frequency', freq);

      fs.writeFileSync(configDest, content);
      log('  Settings saved to .aicontext/config.yml', 'dim');
    }

    return;
  }

  // Config exists — add missing top-level sections from template
  const template = fs.readFileSync(templateSrc, 'utf8');
  const existing = fs.readFileSync(configDest, 'utf8');

  const existingSections = new Set(
    (existing.match(/^[a-z_]+:/gm) || []).map((s) => s.replace(':', ''))
  );

  const blocks = [];
  let currentBlock = [];
  let currentName = null;

  for (const line of template.split('\n')) {
    const sectionMatch = line.match(/^([a-z_]+):\s*$/);
    if (sectionMatch) {
      if (currentName) {
        blocks.push({ name: currentName, content: currentBlock.join('\n') });
      }
      currentName = sectionMatch[1];
      currentBlock = [line];
    } else if (currentName) {
      currentBlock.push(line);
    }
  }
  if (currentName) {
    blocks.push({ name: currentName, content: currentBlock.join('\n') });
  }

  const newBlocks = blocks.filter((b) => !existingSections.has(b.name));

  if (newBlocks.length > 0) {
    const addition = '\n' + newBlocks.map((b) => b.content).join('\n\n');
    fs.writeFileSync(configDest, existing.trimEnd() + '\n' + addition + '\n');
    for (const block of newBlocks) {
      log(`  Added new config section: ${block.name}`, 'dim');
    }
  }
}

function copyFrameworkScripts(packageRoot, target) {
  const srcDir = path.join(packageRoot, '.aicontext', 'scripts');
  const destDir = path.join(target, '.aicontext', 'scripts');
  fs.mkdirSync(destDir, { recursive: true });

  for (const file of FRAMEWORK_SCRIPTS) {
    const src = path.join(srcDir, file);
    if (!fs.existsSync(src)) continue;
    fs.copyFileSync(src, path.join(destDir, file));
  }

  for (const file of DEPRECATED_SCRIPTS) {
    const filePath = path.join(destDir, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      log(`  Removed deprecated: .aicontext/scripts/${file}`, 'dim');
    }
  }
}

// Installs one flat `<name>.md` pointer file per skill for harnesses that discover commands from a single folder.
async function copyFlatPointers(harness, packageRoot, target, overrideSkills = false, skipConfirm = false) {
  const { dir } = FLAT_POINTER_HARNESSES[harness];
  const destDir = path.join(target, ...dir);
  fs.mkdirSync(destDir, { recursive: true });

  for (const skill of FRAMEWORK_SKILLS) {
    const src = path.join(packageRoot, ...dir, `${skill}.md`);
    if (!fs.existsSync(src)) continue;

    const dest = path.join(destDir, `${skill}.md`);
    await copySkillFile(src, dest, `${dir.join('/')}/${skill}.md`, overrideSkills, skipConfirm);
  }
}

async function copyFrameworkPiSkills(packageRoot, target, overrideSkills = false, skipConfirm = false) {
  const srcDir = path.join(packageRoot, '.pi', 'skills');
  const destDir = path.join(target, '.pi', 'skills');
  fs.mkdirSync(destDir, { recursive: true });

  for (const skill of FRAMEWORK_SKILLS) {
    const src = path.join(srcDir, skill, 'SKILL.md');
    if (!fs.existsSync(src)) continue;

    const dest = path.join(destDir, skill, 'SKILL.md');
    await copySkillFile(src, dest, `.pi/skills/${skill}/SKILL.md`, overrideSkills, skipConfirm);
  }
}

async function copyFrameworkCodexSkills(packageRoot, target, overrideSkills = false, skipConfirm = false) {
  const srcDir = path.join(packageRoot, '.codex', 'skills');
  const destDir = path.join(target, '.codex', 'skills');
  fs.mkdirSync(destDir, { recursive: true });

  for (const skill of FRAMEWORK_CODEX_SKILLS) {
    const src = path.join(srcDir, skill, 'SKILL.md');
    if (!fs.existsSync(src)) continue;

    const dest = path.join(destDir, skill, 'SKILL.md');
    await copySkillFile(src, dest, `.codex/skills/${skill}/SKILL.md`, overrideSkills, skipConfirm);

    const policySrc = path.join(srcDir, skill, 'agents', 'openai.yaml');
    if (fs.existsSync(policySrc)) {
      const policyDest = path.join(destDir, skill, 'agents', 'openai.yaml');
      fs.mkdirSync(path.dirname(policyDest), { recursive: true });
      fs.copyFileSync(policySrc, policyDest);
      log(`  Copied: .codex/skills/${skill}/agents/openai.yaml`, 'dim');
    }
  }
}

async function promptYesNo(question, defaultYes = true) {
  while (true) {
    const answer = await prompt(question);
    if (answer === 'y' || answer === 'yes') return true;
    if (answer === 'n' || answer === 'no') return false;
    if (answer === '') return defaultYes;
    log('Please enter Y or N.', 'yellow');
  }
}

async function promptMultiSelect(prefix, options) {
  log(prefix);
  options.forEach((opt, i) => log(`  ${i + 1}. ${opt.label}`, 'dim'));
  log('');
  log(`  Press Enter to install all ${options.length}`, 'dim');
  log(`  Or type numbers for a subset (e.g. "1,3")`, 'dim');
  while (true) {
    const answer = (await prompt('\n> ')).trim();
    if (answer === '') return options.map((o) => o.key);
    const parts = answer.split(',').map((s) => s.trim()).filter(Boolean);
    const indices = parts.map((p) => parseInt(p, 10) - 1);
    const allValid = indices.every((i) => Number.isInteger(i) && i >= 0 && i < options.length);
    if (allValid && indices.length > 0) {
      return [...new Set(indices)].map((i) => options[i].key);
    }
    log(`Please enter numbers between 1 and ${options.length}, separated by commas.`, 'yellow');
  }
}

async function init(targetDir, skipConfirm = false, keepPrompts = false, overrideAgents = false, overrideSkills = false) {
  const target = path.resolve(targetDir || '.');
  const packageRoot = getPackageRoot();

  log(`\nAIContext v${VERSION}`, 'cyan');
  log(`Installing to: ${target}\n`, 'dim');

  // Check if already initialized
  if (fs.existsSync(path.join(target, '.aicontext', '.version'))) {
    const existingVersion = fs.readFileSync(path.join(target, '.aicontext', '.version'), 'utf8').trim();
    log(`Already initialized (v${existingVersion}). Use 'aicontext update' to update.`, 'yellow');
    return;
  }

  // Ask which AI assistants to install (default: all) — before the overwrite warning so
  // the warning only flags folders the user actually chose to install.
  let chosenAssistants = ASSISTANT_NAMES;
  if (!skipConfirm) {
    chosenAssistants = await promptMultiSelect(
      '\nWhich AI coding assistants to install? (default: all)',
      ASSISTANT_NAMES.map((name) => ({ key: name, label: `${ASSISTANTS[name].label} (${ASSISTANTS[name].folder})` }))
    );
  }

  // Check for existing paths that the chosen install will overwrite
  const existing = [];
  if (fs.existsSync(path.join(target, '.aicontext'))) existing.push('.aicontext');
  for (const name of chosenAssistants) {
    const p = ASSISTANTS[name].folder.replace(/\/$/, '');
    if (fs.existsSync(path.join(target, p))) existing.push(p);
  }
  if (existing.length > 0 && !skipConfirm) {
    log('\nThe following paths already exist and will be overwritten:', 'yellow');
    for (const p of existing) {
      log(`  - ${p}`, 'yellow');
    }
    log('');

    const answer = await prompt('Continue? (y/N): ');
    if (answer !== 'y' && answer !== 'yes') {
      log('Installation cancelled.', 'dim');
      return;
    }
    log('');
  }

  // Determine whether to overwrite existing prompts (new prompts are always added)
  let overwritePrompts = !keepPrompts;
  if (!keepPrompts && hasExistingPrompts(target) && !skipConfirm) {
    overwritePrompts = await promptYesNo(
      'Would you like to update the existing aicontext prompts? We recommend yes — ensures you have the latest features. (Y/n): '
    );
  }

  // Copy .aicontext folder
  log('Copying .aicontext files...', 'dim');
  copyRecursive(path.join(packageRoot, '.aicontext', 'rules'), path.join(target, '.aicontext', 'rules'));
  copyFrameworkPrompts(packageRoot, target, !overwritePrompts);
  copyRecursive(path.join(packageRoot, '.aicontext', 'templates'), path.join(target, '.aicontext', 'templates'));
  copyRecursive(path.join(packageRoot, '.aicontext', 'tasks', '.gitkeep'), path.join(target, '.aicontext', 'tasks', '.gitkeep'));
  copyRecursive(path.join(packageRoot, '.aicontext', 'specs', '.gitkeep'), path.join(target, '.aicontext', 'specs', '.gitkeep'));
  copyRecursive(path.join(packageRoot, '.aicontext', 'data', '.gitignore'), path.join(target, '.aicontext', 'data', '.gitignore'));
  copyRecursive(path.join(packageRoot, '.aicontext', 'readme.md'), path.join(target, '.aicontext', 'readme.md'));
  copyRecursive(path.join(packageRoot, '.aicontext', '.gitignore'), path.join(target, '.aicontext', '.gitignore'));

  // Create config file with defaults and ask interactive questions
  log('Creating config...', 'dim');
  await installConfig(packageRoot, target, skipConfirm);

  log('\nCopying assistant entry points...', 'dim');
  copyFrameworkScripts(packageRoot, target);
  const installOpts = { overrideAgents, overrideSkills, skipConfirm };
  for (const name of chosenAssistants) {
    await ASSISTANTS[name].install(packageRoot, target, installOpts);
    if (name === 'claude' && !skipConfirm) {
      const useHaiku = await promptYesNo(
        '\nAgent model: agents default to sonnet for reliable results. Downgrade to haiku? (y/N): ',
        false
      );
      if (useHaiku) {
        setAgentModel(target, 'haiku');
        log('  Agents set to haiku. Upgrade individual agents in .claude/agents/*.md anytime.', 'yellow');
      }
    }
  }

  // Write version file
  fs.writeFileSync(path.join(target, '.aicontext', '.version'), VERSION);

  // Seed version cache so /start doesn't need to fetch on first run
  writeVersionCache(path.join(target, '.aicontext', 'data', 'version.json'), {
    cliVersion: VERSION,
    currentVersion: VERSION,
    latestVersion: null,
  });

  log('\nInstallation complete!', 'green');
  log('\nNext steps:', 'cyan');
  log('1. Open your AI assistant (Claude Code, Cursor, Codex, opencode, Pi, or GitHub Copilot)');
  log('2. Type /start (Claude Code, opencode), /skill:start (Pi), or paste .aicontext/prompts/start.md (Cursor/Copilot)');
  log('3. On first run, the AI will analyze your codebase and generate project context');
  const skipped = ASSISTANT_NAMES.filter((name) => !chosenAssistants.includes(name));
  if (skipped.length > 0) {
    log(`\nSkipped: ${skipped.map((n) => ASSISTANTS[n].label).join(', ')}.`, 'dim');
    log(`Add later with \`aicontext add-assistant <name>\` or re-run \`aicontext init\` to install all.`, 'dim');
  }
  log('');
}

async function update(targetDir, skipConfirm = false, keepPrompts = false, overrideAgents = false, overrideSkills = false, force = false) {
  if (force) {
    overrideAgents = true;
    overrideSkills = true;
  }
  const target = path.resolve(targetDir || '.');
  const packageRoot = getPackageRoot();
  const versionFile = path.join(target, '.aicontext', '.version');
  const oldAiFolder = path.join(target, '.ai');

  log(`\nAIContext v${VERSION}`, 'cyan');

  // Check for old .ai folder (migration from pre-1.2.0)
  if (fs.existsSync(oldAiFolder) && !fs.existsSync(versionFile)) {
    log('\nDetected old .ai/ folder from a previous version.', 'yellow');
    log('Starting from v1.2.0, the folder has been renamed to .aicontext/', 'yellow');
    log('\nPlease rename the folder manually before updating:', 'cyan');
    log('  mv .ai .aicontext', 'dim');
    log('\nThen run: aicontext update', 'dim');
    return;
  }

  if (!fs.existsSync(versionFile)) {
    log('Not initialized. Run "aicontext init" first.', 'red');
    return;
  }

  const currentVersion = fs.readFileSync(versionFile, 'utf8').trim();

  migrateOpenCodePointers(target);

  const presentAssistants = ASSISTANT_NAMES.filter((name) => ASSISTANTS[name].detect(target));
  const missingAssistants = ASSISTANT_NAMES.filter((name) => !ASSISTANTS[name].detect(target));

  if (currentVersion === VERSION) {
    removeGeneratedPiPromptWrappers(target);
    const shouldReCopy = (overrideAgents || overrideSkills) && presentAssistants.length > 0;
    if (!shouldReCopy) {
      const healed = selfHealMissingFiles(packageRoot, target, presentAssistants);
      if (healed > 0) {
        log(`\nAlready up to date (v${VERSION}). Restored ${healed} missing file(s).`, 'yellow');
      } else {
        log(`Already up to date (v${VERSION}).`, 'green');
      }
      logMissingAssistantsHint(missingAssistants);
      return;
    }
    log(`Already up to date (v${VERSION}), re-copying...`, 'yellow');
    if (force) {
      copyFrameworkPrompts(packageRoot, target);
    }
    const installOpts = { overrideAgents, overrideSkills, skipConfirm };
    for (const name of presentAssistants) {
      await ASSISTANTS[name].install(packageRoot, target, installOpts);
    }
    logMissingAssistantsHint(missingAssistants);
    return;
  }

  // Determine whether to overwrite existing prompts (new prompts are always added)
  let overwritePrompts = force || !keepPrompts;

  // Ask a single bulk question when in fully interactive mode with no pre-set override flags
  let bulkOverride = false;
  if (!skipConfirm && !overrideAgents && !overrideSkills && !keepPrompts && hasExistingFrameworkFiles(target)) {
    bulkOverride = await promptYesNo(
      'Override all existing framework files? Your project files (tasks, specs, config, project.md) are never touched. Y = update everything at once, N = choose file by file. (Y/n): '
    );
    if (bulkOverride) {
      overwritePrompts = true;
      overrideAgents = true;
      overrideSkills = true;
    }
  }

  // If bulk question wasn't used, fall back to the per-prompts question
  if (!bulkOverride && !force && !keepPrompts && hasExistingPrompts(target) && !skipConfirm) {
    overwritePrompts = await promptYesNo(
      'Would you like to update the existing aicontext prompts? We recommend yes — ensures you have the latest features. (Y/n): '
    );
  }

  log(`Updating from v${currentVersion} to v${VERSION}...`, 'dim');
  log('\nThe following will be updated:', 'yellow');
  log('  - .aicontext/rules/', 'yellow');
  log(`  - .aicontext/prompts/ (${overwritePrompts ? 'all framework prompts' : 'new prompts only'})`, 'yellow');
  log('  - .aicontext/templates/', 'yellow');
  log('  - .aicontext/scripts/', 'yellow');
  if (presentAssistants.includes('claude')) {
    log('  - .claude/CLAUDE.md', 'yellow');
    log(`  - .claude/agents/ (${overrideAgents ? 'all existing will be overridden' : 'new agents only, existing will be prompted'})`, 'yellow');
    log(`  - .claude/skills/ (${overrideSkills ? 'all existing will be overridden' : 'new skills only, existing will be prompted'})`, 'yellow');
  }
  if (presentAssistants.includes('codex')) {
    log(`  - .codex/skills/ (${overrideSkills ? 'all existing will be overridden' : 'new skills only, existing will be prompted'})`, 'yellow');
  }
  for (const [name, { dir }] of Object.entries(FLAT_POINTER_HARNESSES)) {
    if (presentAssistants.includes(name)) {
      log(`  - ${dir.join('/')}/ (${overrideSkills ? 'all existing will be overridden' : 'new skills only, existing will be prompted'})`, 'yellow');
    }
  }
  if (presentAssistants.includes('cursor')) {
    log('  - .cursor/', 'yellow');
  }
  if (presentAssistants.includes('copilot')) {
    log('  - .github/copilot-instructions.md', 'yellow');
  }
  log('\nPreserved (not modified):', 'green');
  log('  - .aicontext/project.md', 'green');
  log('  - .aicontext/structure.md', 'green');
  log('  - .aicontext/worklog.md (if exists)', 'green');
  log('  - .aicontext/config.yml (your settings — new keys added, existing preserved)', 'green');
  log('  - .aicontext/local.md', 'green');
  log('  - .aicontext/tasks/*.md (your tasks)', 'green');
  log('');

  if (!skipConfirm && !bulkOverride) {
    const answer = await prompt('Continue? (y/N): ');
    if (answer !== 'y' && answer !== 'yes') {
      log('Update cancelled.', 'dim');
      return;
    }
    log('');
  }

  // Update framework files (not user-generated ones)
  removeGeneratedPiPromptWrappers(target);
  log('Updating rules...', 'dim');
  copyRecursive(path.join(packageRoot, '.aicontext', 'rules'), path.join(target, '.aicontext', 'rules'));

  log('Updating prompts...', 'dim');
  copyFrameworkPrompts(packageRoot, target, !overwritePrompts);
  removeDeprecatedPrompts(target);
  removeDeprecatedAgents(target);
  removeDeprecatedSkills(target);

  // Migrate brief → task-context (renamed in 1.8.0)
  const oldBriefDir = path.join(target, '.aicontext', 'data', 'brief');
  const newContextDir = path.join(target, '.aicontext', 'data', 'task-context');
  if (fs.existsSync(oldBriefDir) && !fs.existsSync(newContextDir)) {
    fs.renameSync(oldBriefDir, newContextDir);
    // Rename brief-* files to context-* so prompts can find them
    for (const file of fs.readdirSync(newContextDir)) {
      if (file.startsWith('brief-')) {
        fs.renameSync(
          path.join(newContextDir, file),
          path.join(newContextDir, file.replace(/^brief-/, 'context-'))
        );
      }
    }
    log('  Migrated data/brief/ → data/task-context/', 'dim');
  }
  const oldBriefTemplate = path.join(target, '.aicontext', 'templates', 'brief.template.md');
  if (fs.existsSync(oldBriefTemplate)) {
    fs.unlinkSync(oldBriefTemplate);
  }

  log('Updating templates...', 'dim');
  copyRecursive(path.join(packageRoot, '.aicontext', 'templates'), path.join(target, '.aicontext', 'templates'));

  log('Updating data directory...', 'dim');
  copyRecursive(path.join(packageRoot, '.aicontext', 'data', '.gitignore'), path.join(target, '.aicontext', 'data', '.gitignore'));

  log('Updating config...', 'dim');
  await installConfig(packageRoot, target, skipConfirm);

  // Deprecate old changelog.md
  const oldChangelogPath = path.join(target, '.aicontext', 'changelog.md');
  if (fs.existsSync(oldChangelogPath)) {
    const content = fs.readFileSync(oldChangelogPath, 'utf8');
    if (!content.includes('@deprecated')) {
      const notice = '> **@deprecated** — This file has been replaced by `worklog.md`. Use `worklog.md` for tracking spec and task statuses. This file will be removed in a future version.';
      fs.writeFileSync(oldChangelogPath, `${notice}\n\n${content}`);
      log('  Deprecated changelog.md (replaced by worklog.md)', 'dim');
    }
  }

  log('Updating scripts...', 'dim');
  copyFrameworkScripts(packageRoot, target);

  if (presentAssistants.length > 0) {
    log('Updating assistant entry points...', 'dim');
    const installOpts = { overrideAgents, overrideSkills, skipConfirm };
    for (const name of presentAssistants) {
      await ASSISTANTS[name].install(packageRoot, target, installOpts);
    }
  }

  // Update version
  fs.writeFileSync(versionFile, VERSION);

  // Refresh version cache
  writeVersionCache(path.join(target, '.aicontext', 'data', 'version.json'), {
    cliVersion: VERSION,
    currentVersion: VERSION,
    latestVersion: null,
  });

  log(`\nUpdated to v${VERSION}!`, 'green');
  log('\nNote: project.md, structure.md, and worklog.md (if present) were preserved.', 'dim');
  logMissingAssistantsHint(missingAssistants);
}

function logMissingAssistantsHint(missingAssistants) {
  if (!missingAssistants || missingAssistants.length === 0) return;
  const labels = missingAssistants.map((name) => `${name} (${ASSISTANTS[name].label})`).join(', ');
  log(`\nOther AI assistants available: ${labels}.`, 'dim');
  log(`Add one with \`aicontext add-assistant <name>\`, or re-run \`aicontext init\` to restore all.`, 'dim');
}

async function addAssistant(name, targetDir, skipConfirm = false) {
  const target = path.resolve(targetDir || '.');

  if (!name) {
    log(`Missing assistant name. Usage: aicontext add-assistant <name>`, 'red');
    log(`Valid names: ${ASSISTANT_NAMES.join(', ')}`, 'dim');
    return;
  }
  if (!ASSISTANTS[name]) {
    log(`Unknown assistant: ${name}`, 'red');
    log(`Valid names: ${ASSISTANT_NAMES.join(', ')}`, 'dim');
    return;
  }

  if (!fs.existsSync(path.join(target, '.aicontext', '.version'))) {
    log(`Not initialized. Run \`aicontext init\` first.`, 'red');
    return;
  }

  const assistant = ASSISTANTS[name];
  if (assistant.detect(target)) {
    log(`${assistant.label} (${assistant.folder}) is already installed.`, 'yellow');
    log(`Run \`aicontext update\` to refresh it.`, 'dim');
    return;
  }

  log(`\nAdding ${assistant.label} to ${target}...`, 'cyan');
  const packageRoot = getPackageRoot();
  try {
    await assistant.install(packageRoot, target, { overrideAgents: false, overrideSkills: false, skipConfirm });
  } catch (err) {
    log(`\nInstall failed: ${err.message}`, 'red');
    log(`${assistant.folder} may be in a partial state. Remove it and retry, or run \`aicontext update\`.`, 'dim');
    throw err;
  }
  log(`\n${assistant.label} installed at ${assistant.folder}.`, 'green');
}

async function checkVersion(targetDir) {
  const target = path.resolve(targetDir || '.');
  const versionFile = path.join(target, '.aicontext', '.version');

  log(`\nAIContext CLI v${VERSION}`, 'cyan');

  let currentVersion = null;
  if (fs.existsSync(versionFile)) {
    currentVersion = fs.readFileSync(versionFile, 'utf8').trim();
    log(`Installed version: v${currentVersion}`);

    if (currentVersion !== VERSION) {
      log(`\nUpdate available! Run 'aicontext update' to upgrade.`, 'yellow');
    }
  } else {
    log('Not installed in current directory.');
    log(`Run 'aicontext init' to install.`, 'dim');
  }

  // Write version cache when explicit path provided and .aicontext/ exists
  if (targetDir && fs.existsSync(path.join(target, '.aicontext'))) {
    const tmpCache = readCache();
    const latestVersion = (tmpCache?.latestVersion && tmpCache.timestamp && Date.now() - tmpCache.timestamp < CACHE_TTL)
      ? tmpCache.latestVersion
      : await fetchLatestVersion();
    const cacheFile = path.join(target, '.aicontext', 'data', 'version.json');
    writeVersionCache(cacheFile, {
      cliVersion: VERSION,
      currentVersion,
      latestVersion,
    });
  }
}

function getInstalledVersion() {
  try {
    const output = execSync(`npm list -g ${NPM_PACKAGE} --json`, { stdio: ['pipe', 'pipe', 'pipe'] }).toString();
    const json = JSON.parse(output);
    return json.dependencies?.[NPM_PACKAGE]?.version || null;
  } catch (err) {
    // npm list exits non-zero for peer dep issues but still includes valid JSON in stdout
    try {
      const json = JSON.parse(err.stdout?.toString() || '');
      return json.dependencies?.[NPM_PACKAGE]?.version || null;
    } catch {
      return null;
    }
  }
}

function upgrade(targetVersion) {

  if (targetVersion && !/^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$/.test(targetVersion)) {
    log(`Invalid version format: ${targetVersion}`, 'red');
    log('Version should be in format: X.Y.Z (e.g., 1.2.0)', 'dim');
    return;
  }

  if (targetVersion) {
    log(`\nUpgrading to v${targetVersion}...`, 'cyan');
  } else {
    log(`\nUpgrading to latest version...`, 'cyan');
  }

  const pkg = targetVersion ? `${NPM_PACKAGE}@${targetVersion}` : NPM_PACKAGE;
  const command = `npm install -g ${pkg}`;

  log(`Running: ${command}`, 'dim');

  try {
    execSync(command, { stdio: 'inherit' });
  } catch {
    log(`\nUpgrade failed. You may need to run with sudo:`, 'red');
    log(`  sudo ${command}`, 'dim');
    return;
  }

  clearCache();
  logUpgradeResult(getInstalledVersion());
}

function findAllInstalls(binName = 'aicontext') {
  const dirs = (process.env.PATH || '').split(path.delimiter);
  const exts = process.platform === 'win32' ? ['', '.cmd', '.exe', '.ps1'] : [''];
  const seenShims = new Set();
  const seenReals = new Set();
  const found = [];
  for (const dir of dirs) {
    if (!dir) continue;
    for (const ext of exts) {
      const shim = path.join(dir, binName + ext);
      if (seenShims.has(shim)) continue;
      seenShims.add(shim);
      try {
        if (!fs.existsSync(shim)) continue;
        const real = fs.realpathSync(shim);
        if (seenReals.has(real)) continue;
        seenReals.add(real);
        found.push({ shim, real });
      } catch { /* unreadable entry */ }
    }
  }
  return found;
}

function managerUninstallHint(realPath) {
  const home = os.homedir();
  if (realPath.startsWith(path.join(home, '.volta') + path.sep)) return `volta uninstall ${NPM_PACKAGE}`;
  if (realPath.startsWith(path.join(home, '.yarn') + path.sep)) return `yarn global remove ${NPM_PACKAGE}`;
  if (realPath.startsWith(path.join(home, '.bun') + path.sep)) return `bun remove -g ${NPM_PACKAGE}`;
  return null;
}

function logShadowingWarning(installs) {
  log(`\nMultiple aicontext installs detected in $PATH:`, 'yellow');
  installs.forEach((install, idx) => {
    const marker = idx === 0 ? '  (shell resolves here)' : '';
    log(`  ${install.shim} -> ${install.real}${marker}`, 'dim');
  });
  const hints = installs.map((i) => managerUninstallHint(i.real)).filter(Boolean);
  if (hints.length > 0) {
    log(`\nRemove the shadowing install with:`, 'dim');
    hints.forEach((h) => log(`  ${h}`, 'dim'));
  }
  log(`\nIf the new version still isn't picked up, run \`hash -r\` or reopen your terminal.`, 'dim');
}

function logUpgradeResult(newVersion) {
  const installs = findAllInstalls();
  const hasShadowing = installs.length > 1;

  if (newVersion && newVersion !== VERSION) {
    log(`\nUpgraded to v${newVersion}!`, 'green');
    if (hasShadowing) logShadowingWarning(installs);
  } else if (newVersion && newVersion === VERSION) {
    log(`\nVersion unchanged (v${VERSION}). The upgrade may not have taken effect.`, 'yellow');
    if (hasShadowing) {
      logShadowingWarning(installs);
    } else {
      log('Troubleshooting:', 'dim');
      log(`  which aicontext        # Check which binary is in your PATH`, 'dim');
      log(`  npm root -g            # Check where npm installs globally`, 'dim');
      log(`  npm install -g ${NPM_PACKAGE}@latest  # Try explicit install`, 'dim');
    }
  } else {
    log(`\nUpgrade complete!`, 'green');
    if (hasShadowing) logShadowingWarning(installs);
  }
}

function contribute() {
  const url = `${REPO_URL}/issues/new?template=example_contribution.md`;
  log(`\nOpening GitHub to contribute...`, 'cyan');
  log(`If browser doesn't open, visit: ${REPO_URL}\n`, 'dim');

  // Cross-platform browser open
  const platform = process.platform;
  let command;
  if (platform === 'darwin') {
    command = `open "${url}"`;
  } else if (platform === 'win32') {
    command = `start "" "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }

  try {
    execSync(command, { stdio: 'ignore' });
  } catch {
    log(`Could not open browser. Visit: ${REPO_URL}`, 'yellow');
  }
}

function showHelp() {
  log(`
AIContext v${VERSION}
Universal AI context management framework

Usage:
  aicontext init [path]            Install AIContext to a project
  aicontext update [path]          Update framework files (preserves your config)
  aicontext add-assistant <name>   Add an AI assistant (${ASSISTANT_NAMES.join(', ')})
  aicontext upgrade [ver]          Upgrade the CLI tool itself (default: latest)
  aicontext version [path]         Show installed version
  aicontext contribute             Open GitHub to contribute examples or improvements
  aicontext help                   Show this help message

Options:
  -y, --yes                  Skip confirmation prompts
  --keep-prompts             Keep existing prompt files (don't overwrite)
  --override-agents          Override existing agent files without prompting
  --override-skills          Override existing skill files without prompting
  --force                    Reset all framework files to defaults (prompts + agents + skills)

Examples:
  npx aicontext init                  # Install to current directory
  npx aicontext init ./my-project     # Install to specific directory
  npx aicontext update                # Update current project
  npx aicontext init -y               # Install without confirmation

Documentation: ${REPO_URL}
`, 'reset');
}

// Export for testing
module.exports = {
  VERSION,
  CACHE_FILE,
  CACHE_TTL,
  FRAMEWORK_PROMPTS,
  DEPRECATED_PROMPTS,
  FRAMEWORK_AGENTS,
  DEPRECATED_AGENTS,
  FRAMEWORK_SKILLS,
  FRAMEWORK_CODEX_SKILLS,
  FLAT_POINTER_HARNESSES,
  DEPRECATED_SKILLS,
  FRAMEWORK_SCRIPTS,
  DEPRECATED_SCRIPTS,
  selfHealMissingFiles,
  copyRecursive,
  copyFrameworkPrompts,
  copyFrameworkAgents,
  copyFrameworkSkills,
  copyFrameworkCodexSkills,
  copyFrameworkPiSkills,
  copyFlatPointers,
  copyFrameworkScripts,
  installConfig,
  setConfigValue,
  resolveCommitAnswer,
  setAgentModel,
  removeDeprecatedPrompts,
  removeDeprecatedAgents,
  isGeneratedPointer,
  isGeneratedPiPromptWrapper,
  removeGeneratedPiPromptWrappers,
  removeDeprecatedSkills,
  getExistingFiles,
  hasExistingPrompts,
  hasExistingFrameworkFiles,
  readCache,
  writeCache,
  writeVersionCache,
  clearCache,
  getInstalledVersion,
  findAllInstalls,
  managerUninstallHint,
  ASSISTANTS,
  ASSISTANT_NAMES,
  init,
  update,
  addAssistant,
  checkVersion,
};

// Main CLI (only run when executed directly)
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const hasYesFlag = args.includes('-y') || args.includes('--yes');
  const hasKeepPromptsFlag = args.includes('--keep-prompts');
  const hasOverrideAgentsFlag = args.includes('--override-agents');
  const hasOverrideSkillsFlag = args.includes('--override-skills');
  const hasForceFlag = args.includes('--force');
  const flagValues = ['--yes', '-y', '--keep-prompts', '--override-agents', '--override-skills', '--force'];
  const targetPath = args.find((arg) => !flagValues.includes(arg) && arg !== command);

  async function main() {
    switch (command) {
      case 'init':
        await init(targetPath, hasYesFlag, hasKeepPromptsFlag, hasOverrideAgentsFlag, hasOverrideSkillsFlag);
        break;
      case 'update':
        await update(targetPath, hasYesFlag, hasKeepPromptsFlag, hasOverrideAgentsFlag, hasOverrideSkillsFlag, hasForceFlag);
        break;
      case 'add-assistant': {
        const nonFlagArgs = args.filter((arg) => !flagValues.includes(arg) && arg !== command);
        await addAssistant(nonFlagArgs[0], nonFlagArgs[1], hasYesFlag);
        break;
      }
      case 'upgrade':
        upgrade(targetPath);
        break;
      case 'version':
      case '-v':
      case '--version':
        await checkVersion(targetPath);
        break;
      case 'contribute':
        contribute();
        break;
      case 'help':
      case '-h':
      case '--help':
        showHelp();
        break;
      default:
        if (command) {
          log(`Unknown command: ${command}`, 'red');
        }
        showHelp();
    }
  }

  main()
    .then(() => command !== 'upgrade' ? checkForUpdates() : undefined)
    .catch((err) => {
      log(`Error: ${err.message}`, 'red');
      process.exit(1);
    });
}
