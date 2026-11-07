import { describe, it, expect } from 'vitest';
import * as data from '../src/data.js';

const isUrl = (s) => /^https?:\/\/[^\s]+$/.test(s);
const nonEmpty = (s) => typeof s === 'string' && s.trim().length > 0;

describe('profile', () => {
  it('has the basics filled in', () => {
    for (const key of ['name', 'role', 'location', 'email']) expect(nonEmpty(data.profile[key]), key).toBe(true);
    expect(data.profile.email).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i);
  });

  it('uses real URLs for every link that is set', () => {
    for (const key of ['github', 'website', 'linkedin', 'resume']) {
      const v = data.profile[key];
      if (v) expect(isUrl(v) || v.startsWith('./'), `${key}: ${v}`).toBe(true);
    }
  });

  it('never publishes a phone number', () => {
    const all = JSON.stringify(data);
    expect(all).not.toMatch(/\b09\d{9}\b|\+63\s?\d{3}/);
  });
});

describe('sections', () => {
  it('about and intros are non-empty text', () => {
    expect(data.about.length).toBeGreaterThan(0);
    data.about.forEach((p) => expect(nonEmpty(p)).toBe(true));
    for (const s of [data.skillsIntro, data.workshopIntro, data.learning.intro, data.outside.intro, data.golliath.intro]) {
      expect(nonEmpty(s)).toBe(true);
    }
  });

  it('skill and workshop groups each have a name and items', () => {
    for (const g of [...data.skills, ...data.workshop]) {
      expect(nonEmpty(g.group)).toBe(true);
      expect(g.items.length, g.group).toBeGreaterThan(0);
      g.items.forEach((i) => expect(nonEmpty(i)).toBe(true));
    }
  });

  it('journey entries have a year, title and text', () => {
    for (const j of data.journey) {
      expect(nonEmpty(j.year) && nonEmpty(j.title) && nonEmpty(j.text), j.title).toBe(true);
      if (j.points) j.points.forEach((p) => expect(nonEmpty(p)).toBe(true));
    }
  });

  it('every project is complete and links somewhere real', () => {
    expect(data.projects.length).toBeGreaterThan(0);
    for (const p of data.projects) {
      expect(nonEmpty(p.title) && nonEmpty(p.tag) && nonEmpty(p.desc), p.title).toBe(true);
      expect(p.stack.length, p.title).toBeGreaterThan(0);
      expect(isUrl(p.link), `${p.title}: ${p.link}`).toBe(true);
    }
  });

  it('golliath links to his game', () => {
    expect(isUrl(data.golliath.game)).toBe(true);
  });
});
