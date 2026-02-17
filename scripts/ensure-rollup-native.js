const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

if (process.platform !== 'linux') {
  console.log('Skipping Rollup native binary check on non-Linux platform.');
  process.exit(0);
}

function detectLibc() {
  try {
    const report = process.report?.getReport?.();
    const glibc = report?.header?.glibcVersionRuntime;
    return glibc ? 'glibc' : 'musl';
  } catch {
    return 'glibc';
  }
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
const libc = detectLibc();
const requiredPackage =
  libc === 'musl' ? '@rollup/rollup-linux-x64-musl' : '@rollup/rollup-linux-x64-gnu';

try {
  require.resolve(requiredPackage);
  console.log('Rollup native Linux packages already present.');
  process.exit(0);
} catch {
  // Continue with installation.
}

const installTarget = `${requiredPackage}@${rollupVersion}`;
console.log(`Installing missing Rollup native package for ${libc}: ${installTarget}`);
execSync(`npm install --no-save ${installTarget}`, {
  stdio: 'inherit',
});
