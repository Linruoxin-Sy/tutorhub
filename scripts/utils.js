import fs from 'fs';
import path from 'path';

export function getPackages() {
  const root = process.cwd();
  const packagesDir = path.join(root, 'packages');

  return fs
    .readdirSync(packagesDir)
    .map(name => path.join(packagesDir, name))
    .filter(p => fs.existsSync(path.join(p, 'package.json')));
}
