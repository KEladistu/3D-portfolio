// Dog behavior for Golliath and Blk: trotting the loop around the cabin, and the occasional
// brotherly squabble (spin in circles facing each other, growl, then run off different ways).
// Pure logic on plain objects, no three.js, so it can be unit-tested. scene.js maps it onto meshes.

// Waypoints around the cabin, ordered by angle so a dog walking between neighbours never cuts through it.
export const PATH = [[0.3, 4.6], [2.4, 4.4], [3.7, 2.1], [5.0, 0.6], [2.8, -3.6], [-0.5, -3.8], [-3.6, -2.6], [-3.9, 1.2], [-2.4, 3.6]];

export const SPAR = {
  distance: 1.3, // how close they must be to start one
  chancePerSecond: 1.2, // likelihood per second while close (and not on cooldown)
  duration: 3.2, // seconds of spinning
  radius: 0.32, // circle radius around their midpoint
  spin: 4.5, // radians per second
  cooldown: [14, 30], // seconds before the next one can start
};

const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export function createDog(name, { start = 0, dir = 1, speed = 0.9 } = {}) {
  const [x, z] = PATH[start];
  return { name, x, z, heading: 0, i: (start + dir + PATH.length) % PATH.length, dir, speed, wait: 1, moving: false, sniffing: false, sparring: false };
}

export function createPack(dogs) {
  return { dogs, spar: null, cooldown: 8 };
}

function nearestIndex(d) {
  let best = 0, bestDist = Infinity;
  PATH.forEach(([x, z], i) => {
    const dist = Math.hypot(x - d.x, z - d.z);
    if (dist < bestDist) { bestDist = dist; best = i; }
  });
  return best;
}

function walk(d, dt, rand) {
  d.moving = false;
  d.sniffing = false;
  if (d.wait > 0) {
    d.wait -= dt;
    d.sniffing = true;
    return;
  }
  const [tx, tz] = PATH[d.i];
  const dx = tx - d.x, dz = tz - d.z;
  const dist = Math.hypot(dx, dz);
  if (dist < 0.08) {
    if (rand() < 0.3) d.wait = 1 + rand() * 2.5; // stop and sniff
    if (rand() < 0.12) d.dir *= -1;
    d.i = (d.i + d.dir + PATH.length) % PATH.length;
    return;
  }
  d.heading += wrap(Math.atan2(dx, dz) - d.heading) * Math.min(1, dt * 6);
  const step = Math.min(dist, dt * d.speed);
  d.x += Math.sin(d.heading) * step;
  d.z += Math.cos(d.heading) * step;
  d.moving = true;
}

function startSpar(pack, a, b) {
  pack.spar = { a, b, t: 0, cx: (a.x + b.x) / 2, cz: (a.z + b.z) / 2, angle: Math.atan2(a.x - b.x, a.z - b.z) };
  a.sparring = b.sparring = true;
  a.wait = b.wait = 0;
}

function endSpar(pack, rand) {
  const { a, b } = pack.spar;
  pack.spar = null;
  pack.cooldown = SPAR.cooldown[0] + rand() * (SPAR.cooldown[1] - SPAR.cooldown[0]);
  // run off in opposite directions along the loop
  a.dir = 1;
  b.dir = -1;
  for (const d of [a, b]) {
    d.sparring = false;
    d.i = (nearestIndex(d) + d.dir + PATH.length) % PATH.length;
  }
}

/**
 * Advance every dog by dt seconds. Returns the events that happened this step ('spar-start' / 'spar-end').
 * @param {ReturnType<typeof createPack>} pack
 * @param {number} dt
 * @param {{ rand?: () => number, frozen?: Set<string> }} [opts] frozen: names of dogs the visitor is looking at (they stand still)
 */
export function stepPack(pack, dt, { rand = Math.random, frozen = new Set() } = {}) {
  const events = [];
  pack.cooldown = Math.max(0, pack.cooldown - dt);

  if (pack.spar) {
    const s = pack.spar;
    if (frozen.has(s.a.name) || frozen.has(s.b.name)) {
      endSpar(pack, rand);
      events.push('spar-end');
    } else {
      s.t += dt;
      const ang = s.angle + s.t * SPAR.spin;
      s.a.x = s.cx + Math.sin(ang) * SPAR.radius;
      s.a.z = s.cz + Math.cos(ang) * SPAR.radius;
      s.b.x = s.cx - Math.sin(ang) * SPAR.radius;
      s.b.z = s.cz - Math.cos(ang) * SPAR.radius;
      s.a.heading = Math.atan2(s.b.x - s.a.x, s.b.z - s.a.z); // glaring at each other
      s.b.heading = Math.atan2(s.a.x - s.b.x, s.a.z - s.b.z);
      s.a.moving = s.b.moving = true;
      if (s.t >= SPAR.duration) {
        endSpar(pack, rand);
        events.push('spar-end');
      }
      return events;
    }
  }

  for (const d of pack.dogs) {
    if (frozen.has(d.name)) { d.moving = false; d.sniffing = false; continue; }
    walk(d, dt, rand);
  }

  // two dogs bump into each other → maybe start a squabble
  if (pack.cooldown === 0 && pack.dogs.length >= 2) {
    const [a, b] = pack.dogs;
    const free = !frozen.has(a.name) && !frozen.has(b.name);
    if (free && Math.hypot(a.x - b.x, a.z - b.z) < SPAR.distance && rand() < dt * SPAR.chancePerSecond) {
      startSpar(pack, a, b);
      events.push('spar-start');
    }
  }
  return events;
}
