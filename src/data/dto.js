// Backend-ready data shapes (see README "Backend API reference").
// Pure functions only: no DOM, so scripts/export-builtin-sprites.mjs can reuse them in Node.
//
// Conventions: kebab-case keys, timestamps as UTC "YYYY-MM-DD HH:mm:ss", colours as hex without "#".

export const SPRITE_TYPES = { g: 'GROUND', p: 'PROPS', o: 'OBJECTS' }; // engine mode -> DTO type
// Default category by atlas kind. An atlas entry may override it with its 6th element (the dungeon pack does).
export const BUILTIN_CATEGORY = { g: 'GROUND', p: 'PROPS', n: 'NATURE' };
export const BUILTIN_TS = Date.UTC(2026, 9, 11); // fixed creation time for the built-in (system) sprites

const pad = (n) => String(n).padStart(2, '0');

/** ms since epoch -> "YYYY-MM-DD HH:mm:ss" (UTC), or null. */
export function ts(ms) {
  if (ms == null || Number.isNaN(+ms)) return null;
  const d = new Date(+ms);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

/** "YYYY-MM-DD HH:mm:ss" (UTC) -> ms since epoch, or null. */
export function parseTs(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(s || '');
  return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]) : null;
}

const h2 = (v) => v.toString(16).toUpperCase().padStart(2, '0');

/** One pixel -> "RRGGBB" (opaque), "RRGGBBAA" (translucent) or "00000000" (transparent). */
export function pixelHex(r, g, b, a) {
  if (a === 0) return '00000000';
  return h2(r) + h2(g) + h2(b) + (a === 255 ? '' : h2(a));
}

/** ImageData-like { data, width, height } -> rows of hex strings. */
export function imageDataToMatrix({ data, width, height }) {
  const rows = [];
  for (let y = 0; y < height; y++) {
    const row = new Array(width);
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      row[x] = pixelHex(data[i], data[i + 1], data[i + 2], data[i + 3]);
    }
    rows.push(row);
  }
  return rows;
}

/** Inverse of imageDataToMatrix (for restoring sprites from the backend). */
export function matrixToRgba(matrix) {
  const height = matrix.length;
  const width = height ? matrix[0].length : 0;
  const data = new Uint8ClampedArray(width * height * 4);
  matrix.forEach((row, y) =>
    row.forEach((hex, x) => {
      const i = (y * width + x) * 4;
      data[i] = parseInt(hex.slice(0, 2), 16);
      data[i + 1] = parseInt(hex.slice(2, 4), 16);
      data[i + 2] = parseInt(hex.slice(4, 6), 16);
      data[i + 3] = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) : 255;
    }),
  );
  return { width, height, data };
}

export function spriteDto({ id, clientId, name, category, type, data, user, created, updated, system }) {
  return {
    id: id ?? null,
    'client-id': clientId ?? null,
    'sprite-name': name,
    'sprite-category': category,
    'sprite-type': type,
    data,
    'canvas-size-x': data.length ? data[0].length : 0,
    'canvas-size-y': data.length,
    user: user ?? null,
    ...(system ? { system: true } : {}),
    'create-time-stamp': ts(created),
    'update-time-stamp': ts(updated),
  };
}

export function gardenDto({ layer1, layer2, sizeX, sizeY, tileSize, user, created, updated }) {
  return {
    id: null,
    'layer-1': layer1,
    'layer-2': layer2,
    'canvas-size-x': sizeX,
    'canvas-size-y': sizeY,
    'tile-size': tileSize,
    user: user ?? null,
    'create-time-stamp': ts(created),
    'update-time-stamp': ts(updated),
  };
}

export function taskDto(t, index, user) {
  const created = Math.floor(t.id);
  return {
    id: null,
    'client-id': String(t.id),
    title: t.text,
    completed: !!t.done,
    'completed-time-stamp': t.done ? ts(t.at) : null,
    'sort-order': index,
    user: user ?? null,
    'create-time-stamp': ts(created),
    'update-time-stamp': ts(t.u || t.at || created),
  };
}

export function userDto(u) {
  if (!u) return null;
  return {
    id: u.id ?? null,
    name: u.name,
    email: u.email,
    provider: String(u.provider || 'LOCAL').toUpperCase(),
    'create-time-stamp': u['create-time-stamp'] || u.createdAt || null,
    'update-time-stamp': u['update-time-stamp'] || u.updatedAt || null,
  };
}
