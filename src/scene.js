import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';

const HOME = { pos: [13, 7.5, 15], target: [0, 1.2, 0] };

// Palette — muted, warm, dusk.
const C = {
  grass: 0x3d5a3a, grassDark: 0x2c4430, dirt: 0x6b5440,
  log: 0x8a5a3b, logDark: 0x5e3b26, roof: 0x4a3a33, stone: 0x77746f,
  pine: [0x2f5240, 0x355c45, 0x27463a, 0x3b6248],
  trunk: 0x4a3324, window: 0xffb562, fire: 0xff8a3d,
};

const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.9, flatShading: true, ...extra });
const mesh = (geo, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  return m;
};

export function createScene(canvas, { onPick }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x2a2c3d, 18, 55);

  const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 300);
  camera.position.set(...HOME.pos);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(...HOME.target);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 6;
  controls.maxDistance = 28;
  controls.maxPolarAngle = Math.PI * 0.46;
  controls.minPolarAngle = Math.PI * 0.18;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.15;

  // ── Sky ───────────────────────────────────────────────────────
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(150, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { top: { value: new THREE.Color(0x0e1424) }, mid: { value: new THREE.Color(0x2b2d45) }, low: { value: new THREE.Color(0x6a4a52) } },
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
      fragmentShader: `uniform vec3 top, mid, low; varying vec3 vP;
        void main(){ float h = vP.y; vec3 c = mix(low, mid, smoothstep(-0.02, 0.18, h)); c = mix(c, top, smoothstep(0.18, 0.7, h)); gl_FragColor = vec4(c,1.); }`,
    }),
  );
  scene.add(sky);

  const starGeo = new THREE.BufferGeometry();
  const sp = [];
  for (let i = 0; i < 700; i++) {
    const v = new THREE.Vector3().randomDirection();
    if (v.y < 0.15) v.y = Math.abs(v.y) + 0.15;
    v.normalize().multiplyScalar(140);
    sp.push(v.x, v.y, v.z);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xfff6e0, size: 0.6, sizeAttenuation: true, fog: false, transparent: true, opacity: 0.8 })));

  const moon = mesh(new THREE.SphereGeometry(3, 24, 16), new THREE.MeshBasicMaterial({ color: 0xfff1d0, fog: false }), -50, 45, -90);
  scene.add(moon);

  // ── Lights ────────────────────────────────────────────────────
  scene.add(new THREE.HemisphereLight(0x8090c0, 0x2a2018, 0.9));
  const moonLight = new THREE.DirectionalLight(0xb8c4ff, 1.1);
  moonLight.position.set(-14, 20, -10);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(1024, 1024);
  Object.assign(moonLight.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 60 });
  moonLight.shadow.bias = -0.0005;
  scene.add(moonLight);

  // ── Ground ────────────────────────────────────────────────────
  const groundGeo = new THREE.PlaneGeometry(120, 120, 90, 90);
  groundGeo.rotateX(-Math.PI / 2);
  const gp = groundGeo.attributes.position;
  const colors = [];
  const cA = new THREE.Color(C.grass), cB = new THREE.Color(C.grassDark), tmp = new THREE.Color();
  for (let i = 0; i < gp.count; i++) {
    const x = gp.getX(i), z = gp.getZ(i);
    const d = Math.hypot(x, z);
    const hill = d > 12 ? (d - 12) * 0.08 * (Math.sin(x * 0.2) * Math.cos(z * 0.17) + 1.2) : 0;
    gp.setY(i, hill + (Math.random() - 0.5) * 0.12);
    tmp.copy(cA).lerp(cB, Math.random() * 0.6 + Math.min(d / 40, 0.4));
    colors.push(tmp.r, tmp.g, tmp.b);
  }
  groundGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  groundGeo.computeVertexNormals();
  const ground = new THREE.Mesh(groundGeo, std(0xffffff, { vertexColors: true }));
  ground.receiveShadow = true;
  scene.add(ground);

  // Stone path from door
  const stoneMat = std(C.stone);
  for (let i = 0; i < 7; i++) {
    const s = mesh(new THREE.CylinderGeometry(0.32 + Math.random() * 0.1, 0.36, 0.08, 7), stoneMat, Math.sin(i * 0.9) * 0.35, 0.04, 2.9 + i * 0.75);
    s.rotation.y = Math.random();
    scene.add(s);
  }

  // ── Hotspots ──────────────────────────────────────────────────
  const hotspots = [];
  function hotspot(key, label, group, labelY, view) {
    group.userData.key = key;
    scene.add(group);
    const mats = new Set();
    group.traverse((o) => o.isMesh && o.material.emissive && mats.add(o.material));
    hotspots.push({ key, label, group, mats: [...mats], anchor: new THREE.Vector3(0, labelY, 0), view, hover: 0, baseY: group.position.y });
  }

  // Cabin (About)
  const cabin = buildCabin();
  cabin.position.set(0, 0, 0);
  hotspot('about', 'The cabin — about me', cabin, 4.6, { pos: [2.6, 2.4, 8.2], target: [0, 1.7, 1.4] });

  // Campfire (Skills)
  const fire = buildCampfire();
  fire.group.position.set(4.6, 0, 4.2);
  hotspot('skills', 'Campfire — what I build with', fire.group, 1.8, { pos: [7.3, 2.4, 7.0], target: [4.6, 0.5, 4.2] });

  // Woodshed (DevOps)
  const shed = buildShed();
  shed.group.position.set(5.6, 0, -2.4);
  shed.group.rotation.y = -0.5;
  hotspot('workshop', 'The workshop — DevOps & cloud', shed.group, 3.2, { pos: [3.5, 2.1, 1.6], target: [5.6, 1.0, -2.4] });

  // Signpost (Projects)
  const sign = buildSignpost();
  sign.position.set(-3.6, 0, 4.6);
  sign.rotation.y = 0.3;
  hotspot('projects', 'Signpost — projects', sign, 2.9, { pos: [-2.4, 2.0, 8.0], target: [-3.6, 1.7, 4.6] });

  // Mailbox (Contact)
  const mail = buildMailbox();
  mail.position.set(1.4, 0, 7.6);
  mail.rotation.y = -0.4;
  hotspot('contact', 'Mailbox — say hello', mail, 2, { pos: [2.5, 1.7, 9.9], target: [1.4, 1.25, 7.6] });

  // ── Trees ─────────────────────────────────────────────────────
  const trees = [];
  const avoid = [[0, 0, 5.5], [4.6, 4.2, 2], [5.6, -2.4, 2.4], [-3.6, 4.6, 1.5], [1, 7, 2.5], [0, 10, 3]];
  let tries = 0;
  while (trees.length < 220 && tries++ < 5000) {
    const r = 6 + Math.random() ** 0.7 * 40;
    const a = Math.random() * Math.PI * 2;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (avoid.some(([ax, az, ar]) => Math.hypot(x - ax, z - az) < ar)) continue;
    if (z > 6 && Math.abs(x) < 6 && r < 16) continue; // keep camera view clear
    trees.push({ x, z, s: 0.8 + Math.random() * 0.9, c: Math.floor(Math.random() * 4) });
  }
  const trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, 1, 6); trunkGeo.translate(0, 0.5, 0);
  const coneGeo = new THREE.ConeGeometry(1, 1.6, 7); coneGeo.translate(0, 0.8, 0);
  const trunks = new THREE.InstancedMesh(trunkGeo, std(C.trunk), trees.length);
  const cones = new THREE.InstancedMesh(coneGeo, std(0xffffff), trees.length * 3);
  const dummy = new THREE.Object3D();
  trees.forEach((t, i) => {
    const y = groundHeight(t.x, t.z);
    dummy.position.set(t.x, y, t.z); dummy.rotation.set(0, Math.random() * 6, 0); dummy.scale.setScalar(t.s); dummy.updateMatrix();
    trunks.setMatrixAt(i, dummy.matrix);
    for (let k = 0; k < 3; k++) {
      dummy.position.set(t.x, y + (0.7 + k * 0.85) * t.s, t.z);
      dummy.scale.set(t.s * (1.25 - k * 0.3), t.s * (1.1 - k * 0.15), t.s * (1.25 - k * 0.3));
      dummy.updateMatrix();
      cones.setMatrixAt(i * 3 + k, dummy.matrix);
      cones.setColorAt(i * 3 + k, new THREE.Color(C.pine[t.c]).multiplyScalar(0.85 + k * 0.1));
    }
  });
  trunks.castShadow = cones.castShadow = true;
  cones.receiveShadow = true;
  scene.add(trunks, cones);

  // Rocks & bushes for texture
  for (let i = 0; i < 26; i++) {
    const a = Math.random() * 6.28, r = 5 + Math.random() * 10;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (avoid.some(([ax, az, ar]) => Math.hypot(x - ax, z - az) < ar)) continue;
    const bush = Math.random() > 0.5;
    const m = mesh(
      bush ? new THREE.IcosahedronGeometry(0.35 + Math.random() * 0.3, 0) : new THREE.DodecahedronGeometry(0.25 + Math.random() * 0.3, 0),
      std(bush ? C.pine[Math.floor(Math.random() * 4)] : C.stone), x, 0.15, z,
    );
    m.scale.y = 0.7;
    m.castShadow = true;
    scene.add(m);
  }

  // ── Fireflies ─────────────────────────────────────────────────
  const FF = 70;
  const ffBase = [];
  const ffPos = new Float32Array(FF * 3);
  for (let i = 0; i < FF; i++) {
    const a = Math.random() * 6.28, r = 3 + Math.random() * 12;
    ffBase.push({ x: Math.cos(a) * r, y: 0.5 + Math.random() * 2.5, z: Math.sin(a) * r, p: Math.random() * 10, s: 0.3 + Math.random() * 0.5 });
  }
  const ffGeo = new THREE.BufferGeometry();
  ffGeo.setAttribute('position', new THREE.BufferAttribute(ffPos, 3));
  const fireflies = new THREE.Points(ffGeo, new THREE.PointsMaterial({
    color: 0xffe68a, size: 0.14, map: glowTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  scene.add(fireflies);

  // ── Chimney smoke ─────────────────────────────────────────────
  const smokeMat = new THREE.MeshStandardMaterial({ color: 0x9a96a0, transparent: true, opacity: 0.4, flatShading: true, depthWrite: false });
  const smoke = Array.from({ length: 10 }, (_, i) => {
    const m = mesh(new THREE.IcosahedronGeometry(0.3, 0), smokeMat.clone());
    m.userData.t = i / 10;
    scene.add(m);
    return m;
  });
  const chimneyTop = new THREE.Vector3(1.3, 4.7, -0.5);

  // Optional: drop a real model at public/models/cabin.glb to replace the procedural cabin.
  fetch('/models/cabin.glb', { method: 'HEAD' }).then((r) => {
    if (!r.ok || !r.headers.get('content-type')?.includes('gltf')) return;
    new GLTFLoader().load('/models/cabin.glb', (gltf) => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      model.scale.setScalar(5 / Math.max(size.x, size.z));
      model.traverse((o) => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
      cabin.clear();
      cabin.add(model);
    });
  }).catch(() => {});

  // ── Interaction ───────────────────────────────────────────────
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(9, 9);
  let hovered = null, downAt = null, focused = null;

  canvas.addEventListener('pointermove', (e) => {
    mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  });
  canvas.addEventListener('pointerdown', (e) => { downAt = [e.clientX, e.clientY]; controls.autoRotate = false; });
  canvas.addEventListener('pointerup', (e) => {
    if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 5) return;
    onPick(hovered ? hovered.key : null); // clicking empty space while reading goes back outside
  });

  let tween;
  // 0 → object centered; 1 → object centered in the space left free by the panel
  const frame = { shift: 0 };
  function flyTo(view, shift, dur = 1.6) {
    tween?.kill();
    tween = gsap.timeline()
      .to(camera.position, { x: view.pos[0], y: view.pos[1], z: view.pos[2], duration: dur, ease: 'power3.inOut' }, 0)
      .to(controls.target, { x: view.target[0], y: view.target[1], z: view.target[2], duration: dur, ease: 'power3.inOut' }, 0)
      .to(frame, { shift, duration: dur, ease: 'power3.inOut' }, 0);
  }

  function applyViewOffset() {
    const w = innerWidth, h = innerHeight;
    if (frame.shift < 0.001) return camera.clearViewOffset();
    const mobile = w <= 640;
    const panelW = Math.min(440, w - 32) + 16;
    const x = mobile ? 0 : (panelW / 2) * frame.shift;
    const y = mobile ? h * 0.34 * frame.shift : 0;
    camera.setViewOffset(w, h, x, y, w, h);
  }

  function focus(key) {
    focused = hotspots.find((h) => h.key === key) ?? null;
    controls.autoRotate = !focused;
    controls.enabled = !focused;
    flyTo(focused ? focused.view : HOME, focused ? 1 : 0);
  }

  // ── Loop ──────────────────────────────────────────────────────
  const clock = new THREE.Clock();
  const v = new THREE.Vector3();
  const labelPositions = {};

  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    // hover
    raycaster.setFromCamera(mouse, camera);
    const hit = focused ? null : raycaster.intersectObjects(hotspots.map((h) => h.group), true)[0];
    let o = hit?.object;
    while (o && !o.userData.key) o = o.parent;
    hovered = o ? hotspots.find((h) => h.group === o) : null;
    canvas.style.cursor = hovered ? 'pointer' : 'grab';

    hotspots.forEach((h) => {
      h.hover += ((h === hovered ? 1 : 0) - h.hover) * 0.15;
      h.group.position.y = h.baseY + h.hover * 0.08;
      if (h.hover > 0.005 || h.hover < h.lastHover) h.mats.forEach((m) => m.emissive.setRGB(h.hover * 0.22, h.hover * 0.12, h.hover * 0.04));
      h.lastHover = h.hover;
      v.copy(h.anchor).applyMatrix4(h.group.matrixWorld).project(camera);
      labelPositions[h.key] = { x: (v.x * 0.5 + 0.5) * innerWidth, y: (-v.y * 0.5 + 0.5) * innerHeight, visible: v.z < 1, hot: h === hovered };
    });

    // fire flicker
    const f = 1 + Math.sin(t * 13) * 0.08 + Math.sin(t * 7.3) * 0.1 + (Math.random() - 0.5) * 0.08;
    fire.light.intensity = 9 * f;
    fire.flames.forEach((fl, i) => {
      fl.scale.y = fl.userData.s * (0.85 + Math.sin(t * (9 + i * 2) + i) * 0.18);
      fl.rotation.y += dt * (1 + i);
    });
    fire.embers.forEach((e) => {
      e.userData.t = (e.userData.t + dt * e.userData.s) % 1;
      const k = e.userData.t;
      e.position.set(Math.sin(k * 8 + e.userData.p) * 0.2, 0.3 + k * 2.2, Math.cos(k * 6 + e.userData.p) * 0.2);
      e.material.opacity = 1 - k;
    });

    shed.leds.forEach((l, i) => { l.material.color.setHex(Math.sin(t * (2 + i * 1.7) + i) > -0.2 ? l.userData.on : 0x112211); });

    // smoke
    smoke.forEach((s) => {
      s.userData.t = (s.userData.t + dt * 0.12) % 1;
      const k = s.userData.t;
      s.position.set(chimneyTop.x + Math.sin(k * 4 + t * 0.3) * 0.4 + k * 1.2, chimneyTop.y + k * 4, chimneyTop.z - k * 0.6);
      s.scale.setScalar(0.4 + k * 1.6);
      s.material.opacity = 0.35 * Math.sin(k * Math.PI);
    });

    // fireflies
    ffBase.forEach((b, i) => {
      ffPos[i * 3] = b.x + Math.sin(t * b.s + b.p) * 0.8;
      ffPos[i * 3 + 1] = b.y + Math.sin(t * b.s * 1.7 + b.p) * 0.4;
      ffPos[i * 3 + 2] = b.z + Math.cos(t * b.s * 0.8 + b.p) * 0.8;
    });
    ffGeo.attributes.position.needsUpdate = true;
    fireflies.material.opacity = 0.7 + Math.sin(t * 2) * 0.3;

    // gentle "breathing" parallax while focused so the close-up doesn't feel frozen
    if (focused && !tween?.isActive()) {
      camera.position.x += (THREE.MathUtils.clamp(mouse.x, -1, 1) * 0.25 + focused.view.pos[0] - camera.position.x) * 0.03;
      camera.position.y += (THREE.MathUtils.clamp(mouse.y, -1, 1) * 0.15 + focused.view.pos[1] - camera.position.y) * 0.03;
    }

    controls.update();
    applyViewOffset();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  tick();
  return { focus, hotspots, labelPositions };
}

// ── Builders ────────────────────────────────────────────────────

function groundHeight(x, z) {
  const d = Math.hypot(x, z);
  return d > 12 ? (d - 12) * 0.08 * (Math.sin(x * 0.2) * Math.cos(z * 0.17) + 1.2) : 0;
}

function shadowAll(g) {
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

function buildCabin() {
  const g = new THREE.Group();
  const W = 4.2, D = 3.2, H = 2.6, R = 0.17;
  const logMats = [std(C.log), std(0x7d5034), std(0x93623f)];

  // stacked logs
  for (let i = 0; i < 8; i++) {
    const y = R + i * R * 1.9;
    const m = logMats[i % 3];
    for (const z of [-D / 2, D / 2]) {
      const l = mesh(new THREE.CylinderGeometry(R, R, W + 0.5, 8), m, 0, y, z);
      l.rotation.z = Math.PI / 2;
      g.add(l);
    }
    for (const x of [-W / 2, W / 2]) {
      const l = mesh(new THREE.CylinderGeometry(R, R, D + 0.5, 8), logMats[(i + 1) % 3], x, y + R * 0.95, 0);
      l.rotation.x = Math.PI / 2;
      g.add(l);
    }
  }
  g.add(mesh(new THREE.BoxGeometry(W - 0.1, H, D - 0.1), std(C.logDark), 0, H / 2, 0));

  // gables
  const tri = new THREE.Shape([new THREE.Vector2(-D / 2 - 0.1, 0), new THREE.Vector2(D / 2 + 0.1, 0), new THREE.Vector2(0, 1.3)]);
  for (const x of [-W / 2, W / 2]) {
    const gable = mesh(new THREE.ExtrudeGeometry(tri, { depth: 0.2, bevelEnabled: false }), std(C.log), x - 0.1, H + 0.1, 0);
    gable.rotation.y = Math.PI / 2;
    g.add(gable);
  }

  // roof
  const a = 0.65, w = 2.25;
  const roofMat = std(C.roof);
  for (const s of [1, -1]) {
    const r = mesh(new THREE.BoxGeometry(W + 1, 0.16, w + 0.3), roofMat, 0, H + 0.15 + (w / 2) * Math.sin(a), s * (w / 2) * Math.cos(a));
    r.rotation.x = s * a;
    g.add(r);
    // shingle ridges
    for (let k = 0; k < 4; k++) {
      const strip = mesh(new THREE.BoxGeometry(W + 1.02, 0.05, 0.08), std(0x3a2d27), 0, 0.09, -w / 2 + 0.3 + k * 0.55);
      r.add(strip);
    }
  }

  // chimney
  g.add(mesh(new THREE.BoxGeometry(0.6, 2, 0.6), std(C.stone), 1.3, 3.7, -0.5));
  g.add(mesh(new THREE.BoxGeometry(0.75, 0.15, 0.75), std(0x5f5c58), 1.3, 4.7, -0.5));

  // door & windows
  const frame = std(0x3b2619);
  g.add(mesh(new THREE.BoxGeometry(0.9, 1.6, 0.12), std(0x5a3a26), 0, 0.85, D / 2 + 0.17));
  g.add(mesh(new THREE.SphereGeometry(0.05), std(0xc9a14a, { metalness: 0.8, roughness: 0.3 }), 0.3, 0.85, D / 2 + 0.26));
  const glow = new THREE.MeshBasicMaterial({ color: C.window });
  for (const x of [-1.3, 1.3]) {
    g.add(mesh(new THREE.PlaneGeometry(0.8, 0.7), glow, x, 1.45, D / 2 + 0.2));
    g.add(mesh(new THREE.BoxGeometry(0.95, 0.08, 0.1), frame, x, 1.84, D / 2 + 0.22));
    g.add(mesh(new THREE.BoxGeometry(0.95, 0.08, 0.1), frame, x, 1.06, D / 2 + 0.22));
    g.add(mesh(new THREE.BoxGeometry(0.06, 0.7, 0.1), frame, x, 1.45, D / 2 + 0.22));
    g.add(mesh(new THREE.BoxGeometry(0.95, 0.05, 0.1), frame, x, 1.45, D / 2 + 0.22));
    // flower box
    g.add(mesh(new THREE.BoxGeometry(0.9, 0.18, 0.22), std(0x6e4a30), x, 0.95, D / 2 + 0.32));
    for (let k = 0; k < 4; k++) g.add(mesh(new THREE.IcosahedronGeometry(0.08, 0), std([0xd96b5b, 0xe8c26a, 0xc98bd0][k % 3]), x - 0.3 + k * 0.2, 1.08, D / 2 + 0.33));
  }
  const sideWin = mesh(new THREE.PlaneGeometry(0.7, 0.6), glow, W / 2 + 0.2, 1.45, 0);
  sideWin.rotation.y = Math.PI / 2;
  g.add(sideWin);

  const warm = new THREE.PointLight(C.window, 6, 9, 1.6);
  warm.position.set(0, 1.5, D / 2 + 1);
  g.add(warm);

  // porch
  g.add(mesh(new THREE.BoxGeometry(W + 0.6, 0.14, 1.3), std(0x7a5236), 0, 0.07, D / 2 + 0.8));
  for (const x of [-W / 2, W / 2]) g.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.3, 6), std(C.logDark), x, 1.2, D / 2 + 1.3));
  const awning = mesh(new THREE.BoxGeometry(W + 0.6, 0.1, 1.5), roofMat, 0, 2.38, D / 2 + 0.9);
  awning.rotation.x = 0.18;
  g.add(awning);

  // lantern
  g.add(mesh(new THREE.BoxGeometry(0.16, 0.24, 0.16), new THREE.MeshBasicMaterial({ color: 0xffd28a }), 0.75, 1.9, D / 2 + 0.3));
  const lantern = new THREE.PointLight(0xffc27a, 3, 5, 2);
  lantern.position.set(0.75, 1.9, D / 2 + 0.6);
  g.add(lantern);

  // bench + firewood stack
  g.add(mesh(new THREE.BoxGeometry(1.1, 0.08, 0.35), std(0x8a5f3f), -1.3, 0.5, D / 2 + 0.85));
  for (const x of [-1.75, -0.85]) g.add(mesh(new THREE.BoxGeometry(0.08, 0.4, 0.3), std(0x6a4630), x, 0.27, D / 2 + 0.85));

  return shadowAll(g);
}

function buildCampfire() {
  const group = new THREE.Group();
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const s = mesh(new THREE.DodecahedronGeometry(0.18, 0), std(C.stone), Math.cos(a) * 0.6, 0.1, Math.sin(a) * 0.6);
    s.rotation.set(Math.random(), Math.random(), 0);
    group.add(s);
  }
  for (let i = 0; i < 4; i++) {
    const l = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.9, 6), std(C.logDark), 0, 0.2, 0);
    l.rotation.set(0.9, (i / 4) * Math.PI * 2, 0);
    l.position.set(Math.cos(i * 1.57) * 0.15, 0.25, Math.sin(i * 1.57) * 0.15);
    l.lookAt(0, 0.6, 0);
    l.rotateX(Math.PI / 2);
    group.add(l);
  }
  const flames = [
    [0.28, 0.9, 0xff6a2a], [0.2, 0.75, 0xff9a3d], [0.12, 0.55, 0xffd27a],
  ].map(([r, h, c]) => {
    const geo = new THREE.ConeGeometry(r, h, 6); geo.translate(0, h / 2, 0);
    const f = mesh(geo, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.9 }), 0, 0.15, 0);
    f.userData.s = 1;
    group.add(f);
    return f;
  });
  const embers = Array.from({ length: 12 }, () => {
    const e = mesh(new THREE.SphereGeometry(0.025, 4, 4), new THREE.MeshBasicMaterial({ color: 0xffb060, transparent: true }));
    e.userData = { t: Math.random(), s: 0.3 + Math.random() * 0.4, p: Math.random() * 6 };
    group.add(e);
    return e;
  });
  const light = new THREE.PointLight(C.fire, 9, 12, 1.5);
  light.position.y = 0.8;
  group.add(light);

  // log seats
  for (const [x, z, r] of [[1.4, -0.3, 0.3], [-0.3, 1.4, -1.2], [-1.2, -0.8, 0.9]]) {
    const seat = mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.1, 8), std(C.log), x, 0.2, z);
    seat.rotation.set(0, r, Math.PI / 2);
    group.add(seat);
  }
  shadowAll(group);
  flames.forEach((f) => (f.castShadow = false));
  embers.forEach((e) => (e.castShadow = false));
  return { group, flames, embers, light };
}

function buildShed() {
  const group = new THREE.Group();
  const wood = std(0x6e4a32), dark = std(0x3e2a1d);
  group.add(mesh(new THREE.BoxGeometry(2.4, 0.12, 1.8), dark, 0, 0.06, 0));
  group.add(mesh(new THREE.BoxGeometry(2.4, 2, 0.1), wood, 0, 1.05, -0.85));
  for (const x of [-1.15, 1.15]) group.add(mesh(new THREE.BoxGeometry(0.1, 2, 1.8), wood, x, 1.05, 0));
  const roof = mesh(new THREE.BoxGeometry(2.8, 0.12, 2.3), std(C.roof), 0, 2.2, 0.05);
  roof.rotation.x = -0.15;
  group.add(roof);

  // workbench + tiny server rack — the DevOps corner
  group.add(mesh(new THREE.BoxGeometry(1.2, 0.08, 0.5), std(0x8a5f3f), -0.4, 0.85, -0.5));
  for (const x of [-0.95, 0.15]) group.add(mesh(new THREE.BoxGeometry(0.06, 0.8, 0.45), dark, x, 0.45, -0.5));
  group.add(mesh(new THREE.BoxGeometry(0.4, 0.04, 0.28), std(0x2a2a2e), -0.5, 0.91, -0.5)); // laptop base
  const screen = mesh(new THREE.PlaneGeometry(0.38, 0.24), new THREE.MeshBasicMaterial({ color: 0x8fd0ff }), -0.5, 1.04, -0.62);
  screen.rotation.x = -0.25;
  group.add(screen);

  group.add(mesh(new THREE.BoxGeometry(0.55, 1.4, 0.5), std(0x1e1f24), 0.7, 0.82, -0.5));
  const leds = [];
  for (let i = 0; i < 5; i++) {
    group.add(mesh(new THREE.BoxGeometry(0.45, 0.02, 0.01), std(0x34363c), 0.7, 0.35 + i * 0.25, -0.24));
    const led = mesh(new THREE.BoxGeometry(0.04, 0.04, 0.01), new THREE.MeshBasicMaterial({ color: 0x5dff8a }), 0.86, 0.42 + i * 0.25, -0.24);
    led.userData.on = i % 3 === 2 ? 0x6ab8ff : 0x5dff8a;
    group.add(led);
    leds.push(led);
  }
  const glow = new THREE.PointLight(0x9fd8ff, 2, 3.5, 2);
  glow.position.set(0, 1.2, 0.2);
  group.add(glow);

  // firewood pile outside
  for (let r = 0; r < 3; r++) for (let k = 0; k < 4 - r; k++) {
    const l = mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.8, 7), std([C.log, 0x7a4e33][k % 2]), 1.55, 0.12 + r * 0.22, -0.5 + k * 0.25 + r * 0.12);
    l.rotation.z = Math.PI / 2;
    group.add(l);
  }
  // axe in a stump
  group.add(mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.45, 9), std(C.log), -1.7, 0.22, 0.8));
  const handle = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 5), std(0xb08a5a), -1.7, 0.75, 0.8);
  handle.rotation.z = 0.4;
  group.add(handle);
  group.add(mesh(new THREE.BoxGeometry(0.22, 0.14, 0.03), std(0x8f949a, { metalness: 0.7, roughness: 0.4 }), -1.6, 0.48, 0.8));
  return { group: shadowAll(group), leds };
}

function buildSignpost() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.6, 6), std(C.logDark), 0, 1.3, 0));
  [[2.15, 0.15, 0xa07048], [1.75, -0.35, 0x8f6440], [1.35, 0.25, 0x9a6a44]].forEach(([y, r, c]) => {
    const plank = new THREE.Group();
    const board = mesh(new THREE.BoxGeometry(1.1, 0.26, 0.06), std(c), 0.45, 0, 0.06);
    const tip = mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 3), std(c), 1.04, 0, 0.06);
    tip.rotation.set(Math.PI / 2, 0, -Math.PI / 2);
    plank.add(board, tip);
    plank.position.y = y;
    plank.rotation.y = r;
    if (y === 1.75) plank.rotation.y += Math.PI;
    g.add(plank);
  });
  return shadowAll(g);
}

function buildMailbox() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(0.12, 1.1, 0.12), std(C.logDark), 0, 0.55, 0));
  const body = mesh(new THREE.BoxGeometry(0.4, 0.3, 0.6), std(0x6f8a96, { roughness: 0.6 }), 0, 1.25, 0);
  const top = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.6, 12), std(0x6f8a96, { roughness: 0.6 }), 0, 1.4, 0);
  top.rotation.x = Math.PI / 2;
  const flag = mesh(new THREE.BoxGeometry(0.03, 0.3, 0.12), std(0xc9473a), 0.22, 1.5, 0.1);
  const letter = mesh(new THREE.BoxGeometry(0.22, 0.02, 0.15), std(0xf4ecdf), 0, 1.3, 0.33);
  letter.rotation.x = -0.6;
  g.add(body, top, flag, letter);
  return shadowAll(g);
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  const grd = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.3, 'rgba(255,240,170,.6)');
  grd.addColorStop(1, 'rgba(255,220,120,0)');
  x.fillStyle = grd;
  x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
