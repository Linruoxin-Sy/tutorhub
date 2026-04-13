import { build } from 'vite';
import { createViteConfig } from './vite.config.js';
import { getPackages } from './utils.js';

async function run() {
  const packages = getPackages();

  for (const pkg of packages) {
    console.log(`\n📦 Building ${pkg}`);

    await build({
      ...createViteConfig(pkg, { watch: false }),
      configFile: false,
    });
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
