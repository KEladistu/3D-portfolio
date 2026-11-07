import { describe, it, expect } from 'vitest';
import { PATH, SPAR, createDog, createPack, stepPack } from '../src/dogs.js';

// deterministic "random"
const seq = (...values) => { let i = 0; return () => values[i++ % values.length]; };
const run = (pack, seconds, opts) => {
  const events = [];
  for (let t = 0; t < seconds; t += 1 / 60) events.push(...stepPack(pack, 1 / 60, opts));
  return events;
};

describe('walking', () => {
  it('dogs move along the loop and stay near the path', () => {
    const g = createDog('golliath', { start: 0, speed: 0.9 });
    const pack = createPack([g]);
    const start = { x: g.x, z: g.z };
    run(pack, 10, { rand: seq(0.9) }); // never pauses, never turns around
    expect(Math.hypot(g.x - start.x, g.z - start.z)).toBeGreaterThan(1);
    const nearest = Math.min(...PATH.map(([x, z]) => Math.hypot(x - g.x, z - g.z)));
    expect(nearest).toBeLessThan(4);
  });

  it('Blk runs faster than Golliath', () => {
    const g = createDog('golliath', { start: 0, speed: 0.9 });
    const b = createDog('blk', { start: 0, speed: 1.5 });
    const pack = createPack([g, b]);
    pack.cooldown = Infinity; // no squabbles in this test
    const g0 = { x: g.x, z: g.z }, b0 = { x: b.x, z: b.z };
    stepPack(pack, 1.1, { rand: seq(0.9) }); // burn the initial pause
    for (let i = 0; i < 60; i++) stepPack(pack, 1 / 60, { rand: seq(0.9) });
    expect(Math.hypot(b.x - b0.x, b.z - b0.z)).toBeGreaterThan(Math.hypot(g.x - g0.x, g.z - g0.z));
  });

  it('a frozen dog (being looked at) stands still', () => {
    const g = createDog('golliath');
    const pack = createPack([g]);
    const before = { x: g.x, z: g.z };
    run(pack, 3, { rand: seq(0.9), frozen: new Set(['golliath']) });
    expect(g).toMatchObject(before);
    expect(g.moving).toBe(false);
  });
});

describe('squabbles', () => {
  const closePack = () => {
    const g = createDog('golliath', { start: 0 });
    const b = createDog('blk', { start: 0 });
    b.x += 0.5; // right next to each other
    const pack = createPack([g, b]);
    pack.cooldown = 0;
    return { g, b, pack };
  };

  it('start when the brothers are close and off cooldown', () => {
    const { pack } = closePack();
    const events = stepPack(pack, 1 / 60, { rand: seq(0) });
    expect(events).toContain('spar-start');
    expect(pack.spar).not.toBeNull();
  });

  it('do not start while on cooldown or when far apart', () => {
    const near = closePack();
    near.pack.cooldown = 5;
    expect(stepPack(near.pack, 1 / 60, { rand: seq(0) })).toEqual([]);

    const far = closePack();
    far.b.x += 5;
    expect(stepPack(far.pack, 1 / 60, { rand: seq(0) })).toEqual([]);
  });

  it('they circle each other, always facing one another', () => {
    const { g, b, pack } = closePack();
    stepPack(pack, 1 / 60, { rand: seq(0) });
    const { cx, cz } = pack.spar;
    for (let i = 0; i < 60; i++) {
      stepPack(pack, 1 / 60, { rand: seq(0) });
      expect(Math.hypot(g.x - cx, g.z - cz)).toBeCloseTo(SPAR.radius, 5);
      expect(Math.hypot(b.x - cx, b.z - cz)).toBeCloseTo(SPAR.radius, 5);
      const gLooksAtB = Math.atan2(b.x - g.x, b.z - g.z);
      expect(Math.cos(g.heading - gLooksAtB)).toBeCloseTo(1, 5);
      expect(g.sparring && b.sparring).toBe(true);
    }
  });

  it('end after the spin, then they split up and cool down', () => {
    const { g, b, pack } = closePack();
    const events = run(pack, SPAR.duration + 0.5, { rand: seq(0) });
    expect(events.filter((e) => e === 'spar-start')).toHaveLength(1);
    expect(events).toContain('spar-end');
    expect(pack.spar).toBeNull();
    expect(pack.cooldown).toBeGreaterThan(0);
    expect(g.dir).not.toBe(b.dir);
    expect(g.sparring || b.sparring).toBe(false);
  });

  it('end immediately if the visitor clicks one of them', () => {
    const { pack } = closePack();
    stepPack(pack, 1 / 60, { rand: seq(0) });
    const events = stepPack(pack, 1 / 60, { rand: seq(0), frozen: new Set(['blk']) });
    expect(events).toContain('spar-end');
    expect(pack.spar).toBeNull();
  });
});
