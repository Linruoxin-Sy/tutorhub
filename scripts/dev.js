import { build } from 'vite';
import { createViteConfig } from './vite.config.js';
import { getPackages } from './utils.js';

async function run() {
  const packages = getPackages();

  await Promise.all(
    packages.map(pkg => {
      console.log(`👀 Watching ${pkg}`);

      return build({
        ...createViteConfig(pkg, { watch: true }),
        configFile: false,
      });
    }),
  );
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
