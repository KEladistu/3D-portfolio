// Night (current look) and morning. Every value the scene needs, in one place.
// themeAt(mix) blends them: 0 = night, 1 = morning. Pure (no three.js) so it's unit-tested.

export const THEMES = {
  night: {
    skyTop: 0x0e1424, skyMid: 0x2b2d45, skyLow: 0x6a4a52,
    fog: 0x2a2c3d, fogNear: 18, fogFar: 55,
    hemiSky: 0x8090c0, hemiGround: 0x2a2018, hemi: 0.9,
    hemiInsideColor: 0xffd2a0, hemiInside: 0.35,
    sun: 0xb8c4ff, sunIntensity: 1.1, sunX: -14, sunY: 20, sunZ: -10,
    exposure: 1.1,
    stars: 0.8, moon: 1, sunDisc: 0, fireflies: 1,
    campfire: 1, windowGlass: 0x1d2a44,
  },
  day: {
    skyTop: 0x5f9fd8, skyMid: 0xa9cfe8, skyLow: 0xf6d3b0,
    fog: 0xc4d8e4, fogNear: 25, fogFar: 85,
    hemiSky: 0xe6f0fa, hemiGround: 0x55643a, hemi: 1.35,
    hemiInsideColor: 0xfff1dc, hemiInside: 1.1,
    sun: 0xffe2b8, sunIntensity: 2.4, sunX: 16, sunY: 24, sunZ: 8,
    exposure: 1.0,
    stars: 0, moon: 0, sunDisc: 1, fireflies: 0,
    campfire: 0.35, windowGlass: 0x9cc8ec,
  },
};

// keys that hold 0xRRGGBB colors (blended per channel); everything else is a plain number
export const COLOR_KEYS = new Set(['skyTop', 'skyMid', 'skyLow', 'fog', 'hemiSky', 'hemiGround', 'hemiInsideColor', 'sun', 'windowGlass']);

const lerp = (a, b, t) => a + (b - a) * t;

export function lerpColor(a, b, t) {
  const ch = (shift) => Math.round(lerp((a >> shift) & 255, (b >> shift) & 255, t));
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}

/** @param {number} mix 0 = night … 1 = morning */
export function themeAt(mix) {
  const t = Math.min(1, Math.max(0, mix));
  const out = {};
  for (const key of Object.keys(THEMES.night)) {
    const a = THEMES.night[key], b = THEMES.day[key];
    out[key] = COLOR_KEYS.has(key) ? lerpColor(a, b, t) : lerp(a, b, t);
  }
  return /** @type {typeof THEMES.night} */ (out);
}

export const isTheme = (name) => name === 'night' || name === 'day';
