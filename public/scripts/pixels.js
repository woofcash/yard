/* WoofCash — procedural pixel dog generator.
   No spritesheet, no downloaded art: every hound is rasterised from its kennel
   address into a 24x24 grid. Each pixel is classified into a part (ear, head,
   muzzle, nose, eye, collar, body, leg, tail), shaded against a top-left light
   into an 8-step palette ramp, then outlined. Traits — snout length, ear type,
   build, coat pattern, ramp, collar colour — are all derived from the address,
   so the same kennel always produces the same dog. */

const WC_GRID = 24;

/* 8-step ramps, darkest -> lightest */
const WC_RAMPS = {
  shiba: ['#2a1608', '#4a2a11', '#6d4118', '#8f5a22', '#b0762f', '#cf9445', '#e6b268', '#f6d49b'],
  coal:  ['#0c0d10', '#191c20', '#282d33', '#383f46', '#4b535c', '#606a75', '#7b8794', '#9ba7b4'],
  cream: ['#3a2c17', '#5c4726', '#7d6236', '#9d8049', '#bb9e63', '#d4ba85', '#e8d3ab', '#f7ebd2'],
  husky: ['#10161c', '#1d2830', '#2c3b46', '#3e515e', '#556b78', '#728897', '#93a7b4', '#c4d4de'],
  rust:  ['#2b0f08', '#4a1c0e', '#6b2d16', '#8d4322', '#ac5a30', '#c67746', '#dd9a68', '#f0c194'],
  moss:  ['#151713', '#25291f', '#363c2e', '#4a5240', '#606a54', '#79866c', '#96a487', '#bcc7ad'],
  ink:   ['#0b0c14', '#161a26', '#232839', '#333a4f', '#465067', '#5d6a83', '#7b8aa3', '#a3b0c6'],
  candy: ['#2a1220', '#452037', '#63304f', '#824368', '#a05a83', '#bc769d', '#d495b8', '#ecbcd4']
};
const WC_RAMP_KEYS = Object.keys(WC_RAMPS);

const WC_ACCENTS = ['#f0b03c', '#78c47f', '#5ec8e8', '#e0705f', '#c78ce0', '#e8d3ab'];

const WC_INK = '#08090b';        // outline
const WC_NOSE = '#20161a';
const WC_TONGUE = '#d8697a';
const WC_EAR_IN = '#8d5a63';

/* ---------- deterministic randomness ---------- */
function wcHash(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}
function wcR(seed, key) { return (wcHash(seed + '|' + key) % 100000) / 100000; }

function wcTraits(seed) {
  const r = k => wcR(seed, k);
  const rampKey = WC_RAMP_KEYS[Math.floor(r('ramp') * WC_RAMP_KEYS.length)];
  return {
    seed: seed,
    rampKey: rampKey,
    ramp: WC_RAMPS[rampKey],
    headRx: 4.8 + 1.7 * r('head'),
    headRy: 4.0 + 1.0 * r('headry'),
    snout: 0.5 + 1.0 * r('snout'),
    ear: ['flop', 'prick', 'semi'][Math.floor(r('ear') * 3)],
    earLen: 2.8 + 2.8 * r('earlen'),
    bodyRx: 4.0 + 1.4 * r('body'),
    tailUp: r('tail') > 0.45,
    tailLen: 4 + Math.floor(r('taillen') * 3),
    coat: ['solid', 'patched', 'tuxedo', 'brindle'][Math.floor(r('coat') * 4)],
    accent: WC_ACCENTS[Math.floor(r('acc') * WC_ACCENTS.length)],
    eyeGap: 1.6 + 0.8 * r('eyes'),
    perk: r('perk')
  };
}

/* ---------- geometry ---------- */
const WC_CX = 11.5;
const WC_HEAD_CY = 8.4;
const WC_BODY_CY = 17.3;
const WC_BODY_RY = 3.8;
const WC_LEG_TOP = 19.4;
const WC_LEG_BOT = 22.4;

function wcEarPart(x, y, t) {
  const hrx = t.headRx, hry = t.headRy, cy = WC_HEAD_CY;
  for (const side of [-1, 1]) {
    const baseX = WC_CX + side * hrx * 0.66;
    if (t.ear === 'flop') {
      // long ear hanging down the side of the head
      const ex = WC_CX + side * (hrx * 0.92);
      const ey = cy + t.earLen * 0.25;
      const dx = (x - ex) / 1.7;
      const dy = (y - ey) / (t.earLen * 0.85);
      if (dx * dx + dy * dy <= 1) {
        const inner = (x - ex) * side < -0.3 && dy < 0.4;
        return { part: inner ? 'earInner' : 'ear', nx: dx * side, ny: dy };
      }
    } else {
      // triangular ear standing above the head
      const len = t.ear === 'semi' ? t.earLen * 0.62 : t.earLen;
      const tipY = cy - hry - len;
      const baseY = cy - hry * 0.68;
      if (y >= tipY && y <= baseY) {
        const k = (baseY - y) / (baseY - tipY);           // 0 at base, 1 at tip
        const halfW = (1.9 - 1.5 * k);
        const midX = baseX + side * (1.0 * k);
        if (Math.abs(x - midX) <= halfW) {
          const inner = Math.abs(x - midX) <= halfW - 0.9 && k < 0.72;
          return { part: inner ? 'earInner' : 'ear', nx: (x - midX) / 2, ny: -k };
        }
      }
    }
  }
  return null;
}

function wcClassify(x, y, t) {
  const ear = wcEarPart(x, y, t);
  if (ear) return ear;

  const hdx = (x - WC_CX) / t.headRx;
  const hdy = (y - WC_HEAD_CY) / t.headRy;
  const inHead = hdx * hdx + hdy * hdy <= 1;

  // snout — dogs get a real one, this is the main tell against the cats
  const mcy = WC_HEAD_CY + t.headRy * 0.52 + 0.3;
  const mrx = 2.0 + 1.2 * t.snout;
  const mry = 1.4 + 1.0 * t.snout;
  const mdx = (x - WC_CX) / mrx;
  const mdy = (y - mcy) / mry;
  if (mdx * mdx + mdy * mdy <= 1) {
    if (Math.abs(x - WC_CX) <= 1.1 && Math.abs(y - (mcy - mry * 0.5)) <= 0.7) return { part: 'nose' };
    if (Math.abs(x - WC_CX) <= 0.6 && y > mcy + 0.1 && y < mcy + mry * 0.85) return { part: 'mouth' };
    if (t.perk > 0.72 && Math.abs(x - WC_CX) <= 0.6 && y >= mcy + mry * 0.75) return { part: 'tongue' };
    return { part: 'muzzle', nx: mdx, ny: mdy };
  }

  if (inHead) {
    if (Math.abs(Math.abs(x - WC_CX) - t.eyeGap) < 0.6 && Math.abs(y - (WC_HEAD_CY - 0.5)) < 0.7) {
      return { part: 'eye' };
    }
    return { part: 'head', nx: hdx, ny: hdy };
  }

  const bdx = (x - WC_CX) / t.bodyRx;
  const bdy = (y - WC_BODY_CY) / WC_BODY_RY;
  const inBody = bdx * bdx + bdy * bdy <= 1;

  // neck — bridges the head and the body so the dog reads as one animal
  const neck = !inBody && y > WC_HEAD_CY && y < WC_BODY_CY && Math.abs(x - WC_CX) < 2.5;

  if (inBody || neck) {
    if (Math.abs(y - (WC_BODY_CY - WC_BODY_RY * 0.74)) < 0.75) return { part: 'collar' };
    return { part: 'body', nx: inBody ? bdx : (x - WC_CX) / 2.5, ny: inBody ? bdy : -0.5 };
  }

  if (y >= WC_LEG_TOP && y <= WC_LEG_BOT) {
    for (const side of [-1, 1]) {
      const lx = WC_CX + side * t.bodyRx * 0.46;
      if (Math.abs(x - lx) <= 1.1) {
        const paw = y >= WC_LEG_BOT - 1.1;
        return { part: paw ? 'paw' : 'leg', nx: (x - lx) / 1.4, ny: 0 };
      }
    }
  }
  return null;
}

/* ---------- shading ---------- */
function wcLightStep(nx, ny) {
  const l = (-nx * 0.5 - ny * 0.8);
  return Math.max(0, Math.min(7, Math.round(4 + l * 2.1)));
}

function wcMarking(part, x, y, step, t) {
  if (part !== 'body' && part !== 'head' && part !== 'leg' && part !== 'paw') return step;
  switch (t.coat) {
    case 'brindle':
      return (Math.round(x) + (Math.round(y) % 2)) % 3 === 0 ? Math.max(0, step - 2) : step;
    case 'patched':
      return wcHash(t.seed + ':' + (x >> 1) + ':' + (y >> 1)) % 100 < 30 ? Math.max(0, step - 2) : step;
    case 'tuxedo': {
      const chest = part === 'body' && Math.abs(x - WC_CX) < 2.1 && y > WC_BODY_CY - 1;
      if (chest || part === 'paw') return 7;
      const blaze = part === 'head' && Math.abs(x - WC_CX) < 1.1 && y < WC_HEAD_CY;
      return blaze ? 7 : step;
    }
    default:
      return step;
  }
}

function wcColorFor(p, x, y, t) {
  const ramp = t.ramp;
  switch (p.part) {
    case 'nose': return WC_NOSE;
    case 'mouth': return WC_NOSE;
    case 'tongue': return WC_TONGUE;
    case 'eye': return '#0d0f12';
    case 'earInner': return WC_EAR_IN;
    case 'collar': return t.accent;
    case 'muzzle': return ramp[Math.max(5, Math.min(7, wcLightStep(p.nx, p.ny) + 2))];
    case 'ear': return ramp[Math.max(1, wcLightStep(p.nx, p.ny) - 1)];
    case 'leg':
    case 'paw':
    case 'body':
    case 'head': {
      const step = wcMarking(p.part, x, y, wcLightStep(p.nx || 0, p.ny || 0), t);
      return ramp[step];
    }
    default: return ramp[4];
  }
}

/* ---------- rasteriser ---------- */
function wcRasterDog(seed) {
  const t = wcTraits(seed);
  const g = [];
  for (let y = 0; y < WC_GRID; y++) g.push(new Array(WC_GRID).fill(null));

  for (let y = 0; y < WC_GRID; y++) {
    for (let x = 0; x < WC_GRID; x++) {
      const p = wcClassify(x + 0.5, y + 0.5, t);
      if (p) g[y][x] = wcColorFor(p, x + 0.5, y + 0.5, t);
    }
  }

  // tail, painted after the body so it can sit outside every ellipse
  const dir = wcR(seed, 'tdir') > 0.5 ? 1 : -1;
  let tx = WC_CX + dir * (t.bodyRx - 1.2);
  let ty = WC_BODY_CY + 0.4;
  const stepN = t.tailLen * 2;
  for (let i = 0; i < stepN; i++) {
    tx += dir * 0.62;
    ty += t.tailUp ? -0.62 : -0.16;
    if (ty > WC_LEG_TOP - 1) break;
    const cx2 = Math.round(tx), cy2 = Math.round(ty);
    for (const [ox, oy] of [[0, 0], [0, 1]]) {           // 2px thick so it stays connected
      const px = cx2 + ox, py = cy2 + oy;
      if (px < 0 || px >= WC_GRID || py < 0 || py >= WC_GRID) continue;
      if (!g[py][px]) g[py][px] = t.ramp[Math.max(1, 4 - (i % 3 === 0 ? 1 : 0))];
    }
  }

  // outline pass
  const out = g.map(row => row.slice());
  for (let y = 0; y < WC_GRID; y++) {
    for (let x = 0; x < WC_GRID; x++) {
      if (g[y][x]) continue;
      const near =
        (y > 0 && g[y - 1][x]) || (y < WC_GRID - 1 && g[y + 1][x]) ||
        (x > 0 && g[y][x - 1]) || (x < WC_GRID - 1 && g[y][x + 1]);
      if (near) out[y][x] = WC_INK;
    }
  }
  return { grid: out, traits: t };
}

/* ---------- cached canvases ---------- */
const _wcCache = new Map();

function wcDogCanvas(seed, scale) {
  const key = seed + '@' + scale;
  if (_wcCache.has(key)) return _wcCache.get(key);
  const { grid } = wcRasterDog(seed);
  const cv = document.createElement('canvas');
  cv.width = WC_GRID * scale;
  cv.height = WC_GRID * scale;
  const c = cv.getContext('2d');
  c.imageSmoothingEnabled = false;
  for (let y = 0; y < WC_GRID; y++) {
    for (let x = 0; x < WC_GRID; x++) {
      const col = grid[y][x];
      if (!col) continue;
      c.fillStyle = col;
      c.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  _wcCache.set(key, cv);
  return cv;
}

/* draw a cached dog into a target context */
function wcDrawDog(ctx, seed, x, y, scale, flip) {
  const cv = wcDogCanvas(seed, scale);
  if (!flip) { ctx.drawImage(cv, Math.round(x), Math.round(y)); return; }
  ctx.save();
  ctx.translate(Math.round(x) + cv.width, Math.round(y));
  ctx.scale(-1, 1);
  ctx.drawImage(cv, 0, 0);
  ctx.restore();
}

/* compat helper used by leaderboard / logo slots */
function wcSpriteCanvas(_name, seed, scale) { return wcDogCanvas(seed, scale); }

function wcSetFavicon() {
  const cv = wcDogCanvas('woofcash', 2);
  const link = document.querySelector("link[rel='icon']") || document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  link.href = cv.toDataURL('image/png');
  document.head.appendChild(link);
}

if (typeof window !== 'undefined') {
  Object.assign(window, {
    WC_GRID, WC_RAMPS, WC_ACCENTS,
    wcHash, wcR, wcTraits, wcRasterDog,
    wcDogCanvas, wcDrawDog, wcSpriteCanvas, wcSetFavicon
  });
}
