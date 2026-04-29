/**
 * One-time helper: downloads the TinyFaceDetector model files used by
 * generate-face-focal-points.mjs into scripts/face-models/.
 *
 * Usage:  node scripts/download-face-models.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, 'face-models');

const BASE =
  'https://raw.githubusercontent.com/vladmandic/face-api/master/model/';

const FILES = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model.bin',
];

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  for (const f of FILES) {
    const dest = path.join(OUT_DIR, f);
    try {
      await fs.access(dest);
      console.log(`[skip] ${f}`);
      continue;
    } catch {
      /* not present */
    }
    console.log(`[get ] ${f}`);
    const res = await fetch(BASE + f);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${f}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(dest, buf);
  }
  console.log('[OK] models in', OUT_DIR);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
