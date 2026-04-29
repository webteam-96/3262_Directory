/* eslint-disable no-console */
/**
 * Generate per-photo focal points so the cropped photo box always
 * shows the face. Output: lib/photo-focal-points.json
 *
 * Usage:
 *   npm i -D @vladmandic/face-api @tensorflow/tfjs-node canvas sharp smartcrop-sharp
 *   node scripts/generate-face-focal-points.mjs
 *
 * The script:
 *   1. Walks every API endpoint that returns a member with a photo
 *   2. Downloads each unique image URL (cached by URL)
 *   3. Detects the largest face → focal point = face centre, biased
 *      upward by 15% so the forehead/hair stays in frame
 *   4. If no face is detected, falls back to smartcrop-sharp's
 *      saliency-based crop
 *   5. Writes { "<image-url>": { "x": 0-100, "y": 0-100 } }
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as tf from '@tensorflow/tfjs-node';
import * as faceapi from '@vladmandic/face-api';
import { Canvas, Image, ImageData, loadImage } from 'canvas';
import sharp from 'sharp';
import smartcrop from 'smartcrop-sharp';

// Patch face-api so it can use node-canvas
// eslint-disable-next-line @typescript-eslint/no-explicit-any
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_FILE = path.join(ROOT, 'lib', 'photo-focal-points.json');
const MODELS_DIR = path.join(ROOT, 'scripts', 'face-models');

const API_BASE = 'http://rotaryindiaapi.rosteronwheels.com/api';
const DISTRICT = '3262';
const GROUP_ID = '31375';
const YEARS = ['2026-2027', '2027-2028'];

// ── HTTP helpers ─────────────────────────────────────────────────────────
async function postJson(pathname, body) {
  const res = await fetch(`${API_BASE}${pathname}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${pathname}`);
  return res.json();
}

// ── Member crawl ─────────────────────────────────────────────────────────
async function collectAllPhotoUrls() {
  const urls = new Set();
  const add = (u) => {
    if (typeof u === 'string' && u.startsWith('http')) urls.add(u);
  };

  for (const year of YEARS) {
    // 1. Directory: members + president/secretary
    try {
      const dir = await postJson(
        '/Directory/Club_Details_District_Committee_PDF',
        { District_number: DISTRICT, year_filter: year },
      );
      for (const m of dir.Member_Details || []) {
        add(m.imgPath);
        add(m.Spouse_Photo);
      }
      for (const m of dir.President_And_Secretary || []) {
        add(m.imgPath);
        add(m.Spouse_Photo);
      }
    } catch (e) {
      console.warn(`[dir ${year}] ${e.message}`);
    }

    // 2. DG Details
    try {
      const dg = await postJson('/Directory/get_district_governor_details_PDF', {
        year_filter: year,
      });
      for (const m of dg.DG_Details || []) {
        add(m.imgPath);
        add(m.img);
        add(m.Spouse_Photo);
      }
    } catch (e) {
      console.warn(`[dg ${year}] ${e.message}`);
    }

    // 3. District Committees: list → details
    try {
      const list = await postJson('/DistrictCommittee/districtCommitteeList', {
        groupID: GROUP_ID,
        searchText: '',
        yearfilter: year,
      });
      const result = list?.TBDistrictCommitteeResult?.Result || {};
      const all = [
        ...(result.districtCommitteeWithCatList || []),
        ...(result.districtCommitteeWithoutCatList || []),
      ];
      for (const c of all) {
        const id = c.DistrictCommitteID || c.districtCommitteID || c.ID;
        if (!id) continue;
        try {
          const det = await postJson(
            '/DistrictCommittee/districtCommitteeDetails/',
            { DistrictCommitteID: id, groupID: GROUP_ID },
          );
          const recs =
            det?.TBDistrictCommitteeDetailsResult?.Result
              ?.districtCommitteeWithoutCatList || [];
          for (const m of recs) {
            add(m.img);
            add(m.imgPath);
            add(m.SpousePhoto);
            add(m.Spouse_Photo);
          }
        } catch (e) {
          console.warn(`  [committee ${id}] ${e.message}`);
        }
      }
    } catch (e) {
      console.warn(`[committees ${year}] ${e.message}`);
    }
  }

  return [...urls];
}

// ── Face detection ───────────────────────────────────────────────────────
async function loadModels() {
  console.log('[*] Loading face-api models from', MODELS_DIR);
  await faceapi.nets.tinyFaceDetector.loadFromDisk(MODELS_DIR);
  console.log('[*] Models loaded');
}

async function focalFromFace(buf) {
  const img = await loadImage(buf);
  const canvas = new Canvas(img.width, img.height);
  canvas.getContext('2d').drawImage(img, 0, 0);

  // tinyFaceDetector — fast, accurate enough for portraits
  const detections = await faceapi.detectAllFaces(
    canvas,
    new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 }),
  );
  if (!detections.length) return null;

  // pick the biggest face (most likely the subject)
  detections.sort((a, b) => b.box.area - a.box.area);
  const box = detections[0].box;

  // centre of face, biased upward 15% of face height to keep hair in frame
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2 - box.height * 0.15;

  return {
    x: Math.round((cx / img.width) * 100),
    y: Math.round((cy / img.height) * 100),
  };
}

async function focalFromSmartcrop(buf) {
  const meta = await sharp(buf).metadata();
  const { topCrop } = await smartcrop.crop(buf, { width: 200, height: 200 });
  const cx = topCrop.x + topCrop.width / 2;
  const cy = topCrop.y + topCrop.height / 2;
  return {
    x: Math.round((cx / meta.width) * 100),
    y: Math.round((cy / meta.height) * 100),
  };
}

function clamp(v) {
  return Math.max(0, Math.min(100, v));
}

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
  await loadModels();

  console.log('[*] Crawling APIs for photo URLs…');
  const urls = await collectAllPhotoUrls();
  console.log(`[*] ${urls.length} unique photo URLs`);

  // Resume support — keep existing entries, only process new ones
  let result = {};
  try {
    result = JSON.parse(await fs.readFile(OUT_FILE, 'utf-8'));
    console.log(`[*] Loaded ${Object.keys(result).length} existing entries`);
  } catch {
    /* no file yet */
  }

  let processed = 0;
  let faces = 0;
  let smart = 0;
  let failed = 0;
  const todo = urls.filter((u) => !result[u]);
  console.log(`[*] ${todo.length} new URLs to process`);

  for (const url of todo) {
    processed++;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`  [${processed}/${todo.length}] HTTP ${res.status}`);
        failed++;
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());

      let focal = await focalFromFace(buf).catch(() => null);
      let mode = 'face';
      if (!focal) {
        focal = await focalFromSmartcrop(buf).catch(() => null);
        mode = 'smart';
      }
      if (!focal) {
        failed++;
        continue;
      }

      focal.x = clamp(focal.x);
      focal.y = clamp(focal.y);
      result[url] = focal;
      if (mode === 'face') faces++;
      else smart++;

      if (processed % 25 === 0) {
        await fs.writeFile(OUT_FILE, JSON.stringify(result, null, 2));
        console.log(
          `  [${processed}/${todo.length}] saved (face=${faces} smart=${smart} fail=${failed})`,
        );
      }
    } catch (e) {
      failed++;
      console.warn(`  [${processed}/${todo.length}] ${e.message}`);
    }
  }

  await fs.writeFile(OUT_FILE, JSON.stringify(result, null, 2));
  console.log(
    `[OK] done — total=${Object.keys(result).length} face=${faces} smart=${smart} fail=${failed}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
