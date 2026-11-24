/**
 * One-time asset migration from Foldergram's landing-page fixture.
 * After migration, the website's public/demo-media directory is self-contained.
 * Only the source .webp and .mp4 files are needed by the website.
 */
import { copyFile, mkdir, readdir, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, '../foldergram/.mocks/demo-media');
const target = join(root, 'public/demo-media');
const entries = await readdir(source, { withFileTypes: true });
const media = entries.filter((entry) => entry.isFile() && /\.(?:webp|mp4)$/i.test(entry.name));
await mkdir(target, { recursive: true });
let bytes = 0;
for (const entry of media) {
  const from = join(source, entry.name);
  await copyFile(from, join(target, entry.name));
  bytes += (await stat(from)).size;
}
console.log(`Copied ${media.length} media files (${(bytes / 1024 / 1024).toFixed(2)} MiB) to ${target}`);
