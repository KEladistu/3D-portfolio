import { describe, it, expect } from 'vitest';
import { THEMES, COLOR_KEYS, themeAt, lerpColor, isTheme } from '../src/themes.js';

describe('themes', () => {
  it('night and day define exactly the same settings', () => {
    expect(Object.keys(THEMES.day).sort()).toEqual(Object.keys(THEMES.night).sort());
    for (const key of COLOR_KEYS) expect(THEMES.night, key).toHaveProperty(key);
  });

  it('themeAt(0) is night and themeAt(1) is day', () => {
    expect(themeAt(0)).toEqual(THEMES.night);
    expect(themeAt(1)).toEqual(THEMES.day);
  });

  it('clamps out-of-range mixes', () => {
    expect(themeAt(-3)).toEqual(THEMES.night);
    expect(themeAt(7)).toEqual(THEMES.day);
  });

  it('halfway is between the two for every number and color channel', () => {
    const mid = themeAt(0.5);
    for (const key of Object.keys(THEMES.night)) {
      const a = THEMES.night[key], b = THEMES.day[key];
      if (COLOR_KEYS.has(key)) {
        for (const shift of [16, 8, 0]) {
          const [ca, cb, cm] = [a, b, mid[key]].map((c) => (c >> shift) & 255);
          expect(cm, key).toBeGreaterThanOrEqual(Math.min(ca, cb));
          expect(cm, key).toBeLessThanOrEqual(Math.max(ca, cb));
        }
      } else {
        expect(mid[key], key).toBeCloseTo((a + b) / 2, 6);
      }
    }
  });

  it('blends colors per channel, not as one big number', () => {
    expect(lerpColor(0x000000, 0xffffff, 0.5)).toBe(0x808080);
    expect(lerpColor(0xff0000, 0x0000ff, 0.5)).toBe(0x800080);
  });

  it('morning hides the night-only things', () => {
    const day = themeAt(1);
    expect(day.stars).toBe(0);
    expect(day.moon).toBe(0);
    expect(day.fireflies).toBe(0);
    expect(day.sunDisc).toBe(1);
  });

  it('only accepts known theme names (used for the saved preference)', () => {
    expect(isTheme('night')).toBe(true);
    expect(isTheme('day')).toBe(true);
    expect(isTheme('banana')).toBe(false);
    expect(isTheme(null)).toBe(false);
  });
});
