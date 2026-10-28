const fs = require('node:fs');
const path = require('node:path');

const pluginPath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@angular',
  'build',
  'src',
  'tools',
  'vite',
  'plugins',
  'angular-memory-plugin.js',
);

if (!fs.existsSync(pluginPath)) {
  process.exit(0);
}

const source = fs.readFileSync(pluginPath, 'utf8');
const originalRead =
  'const originalContents = await (0, promises_1.readFile)(file, \'utf-8\');';
const normalizedRead =
  'const originalContents = (await (0, promises_1.readFile)(file, \'utf-8\')).replace(/\\r\\n/g, \'\\n\');';

if (source.includes(normalizedRead)) {
  process.exit(0);
}

if (!source.includes(originalRead)) {
  console.warn(
    'Skipped Angular Vite overlay newline workaround: angular-memory-plugin.js has an unexpected format.',
  );
  process.exit(0);
}

fs.writeFileSync(pluginPath, source.replace(originalRead, normalizedRead));
