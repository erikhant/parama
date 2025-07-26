#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function log(emoji, message, color = 'reset') {
  console.log(`${emoji} ${colorize(message, color)}`);
}

// Get command line arguments
const command = process.argv[2];

if (!command || !['prepare', 'revert', 'status'].includes(command)) {
  log('❌', 'Usage: node manage-deps.js <prepare|revert|status>', 'red');
  log('📖', 'Commands:', 'blue');
  log('  ', '  prepare - Convert workspace:* to semantic versions for publishing');
  log('  ', '  revert  - Convert semantic versions back to workspace:*');
  log('  ', '  status  - Show current dependency status');
  process.exit(1);
}

// Package configurations
const packages = [
  { name: '@parama-dev/form-builder-types', path: 'packages/types' },
  { name: '@parama-dev/form-builder-core', path: 'packages/core' },
  { name: '@parama-dev/form-builder-renderer', path: 'packages/renderer' },
  { name: '@parama-dev/form-builder-editor', path: 'packages/editor' },
  { name: '@parama-ui/react', path: 'packages/parama-ui' }
];

// Helper functions
function getPackageJson(packagePath) {
  const jsonPath = path.join(packagePath, 'package.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Package.json not found at ${jsonPath}`);
  }
  return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
}

function writePackageJson(packagePath, packageJson) {
  const jsonPath = path.join(packagePath, 'package.json');
  fs.writeFileSync(jsonPath, JSON.stringify(packageJson, null, 2) + '\n');
}

function getPackageVersions() {
  const versions = {};
  packages.forEach((pkg) => {
    const packageJson = getPackageJson(pkg.path);
    versions[pkg.name] = packageJson.version;
  });
  return versions;
}

function updateDependencies(deps, versions, mode) {
  if (!deps) return { updated: false, changes: [] };

  let updated = false;
  const changes = [];

  Object.keys(deps).forEach((dep) => {
    if (versions[dep]) {
      const oldValue = deps[dep];
      let newValue;

      if (mode === 'prepare' && oldValue === 'workspace:*') {
        newValue = `^${versions[dep]}`;
        deps[dep] = newValue;
        updated = true;
        changes.push(`${dep}: ${oldValue} → ${newValue}`);
      } else if (mode === 'revert' && oldValue.match(/^\^?\d+\.\d+\.\d+/)) {
        newValue = 'workspace:*';
        deps[dep] = newValue;
        updated = true;
        changes.push(`${dep}: ${oldValue} → ${newValue}`);
      }
    }
  });

  return { updated, changes };
}

function processPackage(pkg, versions, mode) {
  const packageJson = getPackageJson(pkg.path);
  const packageName = packageJson.name;

  log('🔧', `Processing ${packageName}...`, 'blue');

  let totalUpdated = false;
  const allChanges = [];

  // Process all dependency sections
  ['dependencies', 'devDependencies', 'peerDependencies'].forEach((section) => {
    if (packageJson[section]) {
      const { updated, changes } = updateDependencies(packageJson[section], versions, mode);
      if (updated) {
        totalUpdated = true;
        changes.forEach((change) => {
          allChanges.push(`  ✓ ${section}: ${change}`);
        });
      }
    }
  });

  if (totalUpdated) {
    writePackageJson(pkg.path, packageJson);
    allChanges.forEach((change) => log('  ', change, 'green'));
    log('  ', `✅ Updated ${packageName}`, 'green');
  } else {
    log('  ', `⏭️  No changes needed for ${packageName}`, 'yellow');
  }

  console.log('');
  return totalUpdated;
}

function showStatus() {
  log('🔍', 'Current dependency status:', 'cyan');
  console.log('');

  const versions = getPackageVersions();

  log('📦', 'Package versions:', 'blue');
  Object.entries(versions).forEach(([name, version]) => {
    log('  ', `${name}: ${version}`);
  });
  console.log('');

  packages.forEach((pkg) => {
    const packageJson = getPackageJson(pkg.path);
    log('📋', `${packageJson.name}:`, 'blue');

    ['dependencies', 'devDependencies', 'peerDependencies'].forEach((section) => {
      if (packageJson[section]) {
        const deps = packageJson[section];
        const relevantDeps = Object.keys(deps).filter((dep) => versions[dep]);

        if (relevantDeps.length > 0) {
          log('  ', `${section}:`, 'yellow');
          relevantDeps.forEach((dep) => {
            const value = deps[dep];
            const emoji = value === 'workspace:*' ? '🔗' : '📌';
            log('    ', `${emoji} ${dep}: ${value}`);
          });
        }
      }
    });
    console.log('');
  });
}

// Main execution
try {
  if (command === 'status') {
    showStatus();
    process.exit(0);
  }

  const versions = getPackageVersions();
  let anyUpdated = false;

  if (command === 'prepare') {
    log('🚀', 'Preparing packages for production publishing...', 'bright');
    console.log('');

    log('📦', 'Detected versions:', 'blue');
    Object.entries(versions).forEach(([name, version]) => {
      log('  ', `${name}: ${version}`);
    });
    console.log('');
  } else if (command === 'revert') {
    log('🔧', 'Reverting to workspace dependencies for development...', 'bright');
    console.log('');
  }

  // Process all packages
  packages.forEach((pkg) => {
    if (processPackage(pkg, versions, command)) {
      anyUpdated = true;
    }
  });

  // Summary
  if (anyUpdated) {
    log(
      '✅',
      `All packages ${command === 'prepare' ? 'prepared for publishing' : 'reverted to workspace dependencies'}!`,
      'green'
    );
    console.log('');

    if (command === 'prepare') {
      log('📋', 'Summary of changes:', 'blue');
      log('  ', '- Replaced workspace:* with ^VERSION for all internal packages');
      log('  ', '- Updated dependencies, devDependencies, and peerDependencies');
      console.log('');
      log('🔍', 'Review changes with: git diff packages/*/package.json', 'cyan');
      log('📦', 'Ready to publish with: pnpm publish -r', 'cyan');
    } else {
      log('📋', 'Summary of changes:', 'blue');
      log('  ', '- Replaced semantic versions with workspace:* for all internal packages');
      log('  ', '- Updated dependencies, devDependencies, and peerDependencies');
      console.log('');
      log('🔄', 'Run "pnpm install" to update the workspace links', 'cyan');
      log('💻', 'Ready for development!', 'cyan');
    }
  } else {
    log('ℹ️', 'No changes were needed.', 'yellow');
  }
} catch (error) {
  log('❌', `Error: ${error.message}`, 'red');
  process.exit(1);
}
