// Converts the built-in garden sprites (src/assets/atlas.png + src/data/atlasMeta.js) into the sprite DTO format
// and writes docs/seed/builtin-sprites.json, so the backend can seed its "system" sprites (ids 1..N, user = null).
//   npm run export:builtin
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PNG } from 'pngjs';
import { BUILTIN_CATEGORY, BUILTIN_TS, SPRITE_TYPES, imageDataToMatrix, spriteDto } from '../src/data/dto.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { META } = await import(pathToFileURL(path.join(root, 'src/data/atlasMeta.js')).href);
const atlas = PNG.sync.read(fs.readFileSync(path.join(root, 'src/assets/atlas.png')));

const count = {};
const sprites = META.map(([kind, x, y, w, h], i) => {
  const category = BUILTIN_CATEGORY[kind];
  count[category] = (count[category] || 0) + 1;
  const data = imageDataToMatrix({
    width: w,
    height: h,
    data: Uint8ClampedArray.from({ length: w * h * 4 }, (_, k) => {
      const px = Math.floor(k / 4);
      return atlas.data[((y + Math.floor(px / w)) * atlas.width + x + (px % w)) * 4 + (k % 4)];
    }),
  });
  return spriteDto({
    id: i + 1,
    clientId: `builtin-${i + 1}`,
    name: `${category} ${count[category]}`,
    category,
    type: SPRITE_TYPES[kind === 'n' ? 'o' : kind],
    data,
    user: null,
    created: BUILTIN_TS,
    updated: BUILTIN_TS,
    system: true,
  });
});

const out = path.join(root, 'docs/seed/builtin-sprites.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `[\n${sprites.map((s) => `  ${JSON.stringify(s)}`).join(',\n')}\n]\n`);
console.log(`Wrote ${sprites.length} sprites to ${path.relative(root, out)} (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
