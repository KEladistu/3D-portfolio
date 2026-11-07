import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { pages, navItems } from '../src/pages.js';
import { profile, projects } from '../src/data.js';

const scene = readFileSync(new URL('../src/scene.js', import.meta.url), 'utf8');

// Keys registered as clickable objects in the 3D scene: hotspot('key', ...) and inside('key', ...)
const hotspotKeys = [...scene.matchAll(/\b(?:hotspot|inside)\('([a-z]+)'/g)].map((m) => m[1]);

describe('pages', () => {
  it('every page renders non-empty HTML with a heading', () => {
    for (const [key, render] of Object.entries(pages)) {
      const html = render();
      expect(html, key).toMatch(/<h2>[^<]+<\/h2>/);
      expect(html, key).not.toMatch(/undefined|\[object Object\]/);
    }
  });

  it('projects page links every project', () => {
    const html = pages.projects();
    for (const p of projects) expect(html).toContain(p.link);
  });

  it('contact page only shows links that are set', () => {
    const html = pages.contact();
    expect(html).toContain(`mailto:${profile.email}`);
    if (!profile.linkedin) expect(html).not.toContain('LinkedIn');
    if (!profile.resume) expect(html).not.toContain('Résumé');
  });
});

describe('scene ↔ UI wiring', () => {
  it('finds the hotspots in scene.js', () => {
    expect(hotspotKeys.length).toBeGreaterThanOrEqual(10);
  });

  it('every clickable object has a page (the cabin just walks you inside)', () => {
    for (const key of hotspotKeys) {
      if (key === 'cabin') continue;
      expect(pages, `missing pages.${key}`).toHaveProperty(key);
    }
  });

  it('every page belongs to a clickable object', () => {
    for (const key of Object.keys(pages)) expect(hotspotKeys, key).toContain(key);
  });

  it('every nav item opens an existing page', () => {
    for (const [key] of navItems) expect(pages).toHaveProperty(key);
  });
});

describe('GitHub Pages safety', () => {
  it('no source file references public assets with a leading slash', () => {
    const dir = new URL('../src/', import.meta.url);
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.js'))) {
      const src = readFileSync(new URL(file, dir), 'utf8');
      expect(src, file).not.toMatch(/['"`]\/(models|assets|images|textures)\//);
    }
  });
});
