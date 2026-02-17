const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

if (process.platform !== 'linux') {
  console.log('Skipping Rollup native binary check on non-Linux platform.');
  process.exit(0);
}

const rollupPackageCandidates = [
  path.join(process.cwd(), 'node_modules', 'rollup', 'package.json'),
  path.join(process.cwd(), 'client', 'node_modules', 'rollup', 'package.json'),
];

const rollupPackagePath = rollupPackageCandidates.find((candidate) => fs.existsSync(candidate));
if (!rollupPackagePath) {
  throw new Error('Unable to locate rollup package.json to determine native binary version.');
}

const rollupVersion = JSON.parse(fs.readFileSync(rollupPackagePath, 'utf8')).version;

const requiredPackages = [
  '@rollup/rollup-linux-x64-gnu',
  '@rollup/rollup-linux-x64-musl',
];

const missingPackages = requiredPackages.filter((pkg) => {
  try {
    require.resolve(pkg);
    return false;
  } catch {
    return true;
  }
});

if (missingPackages.length === 0) {
  console.log('Rollup native Linux packages already present.');
  process.exit(0);
}

const installTargets = missingPackages.map((pkg) => `${pkg}@${rollupVersion}`);
console.log(`Installing missing Rollup native packages: ${installTargets.join(', ')}`);
execSync(`npm install --no-save ${installTargets.join(' ')}`, {
  stdio: 'inherit',
});
