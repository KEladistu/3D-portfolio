# Architecture

A single-page Vite app. No framework: one three.js scene plus a thin HTML/CSS UI layer on top.

```
index.html            canvas + header, panel, labels, buttons (static markup)
src/main.js           boots everything; UI state (open/close panels, fade between areas, nav, labels, sound)
src/pages.js          panel HTML for every section + header nav  ← pure, unit-tested
src/data.js           ALL personal content (text, links, skills, projects)  ← edit content here
src/scene.js          three.js world: renderer, camera/controls, builders, hotspots, animation loop
src/audio.js          procedural Web Audio ambience (no audio files) + Golliath's bark
src/style.css         all styling; CSS variables at the top
tests/                Vitest: content completeness + scene↔UI wiring
```

## Data flow

1. `data.js` → `pages.js` turns content into panel HTML.
2. `scene.js` registers clickable objects with `hotspot(key, …)` / `inside(key, …)`.
3. A click/tap raycasts on `pointerup` → `onPick(key)` → `main.js open(key)` → renders `pages[key]()` into the panel and calls `world.focus(key)` (camera flies to the object, frustum shifts so the panel doesn't cover it).
4. The `tests/wiring.test.js` suite guarantees every hotspot key has a page and every page/nav key has a hotspot.

## Two areas

- **outside**: the clearing (cabin, campfire, workshop, signpost, mailbox, Golliath walking `PATH`).
- **inside**: the cabin room, built far away at `ROOM` (x = 200). `setArea()` teleports the camera behind a fade and toggles which area is visible; only the current area is rendered and animated.

## Performance model

- One `requestAnimationFrame` loop (`tick()` in `scene.js`) + one for HTML label positions in `main.js`.
- `mergeStatic()` merges static meshes per material (hundreds of logs/books → a handful of draw calls). Animated parts are excluded via `userData.skip` / `userData.noMerge`.
- `MOBILE` tier: lower pixel ratio, 512px shadow map, fewer trees, no hover raycasts.
- three.js + gsap ship in a separate cached `vendor` chunk (`vite.config.js`).
