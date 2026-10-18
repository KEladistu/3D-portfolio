# CLAUDE.md

Guidance for Claude Code when working on this repository.

## Project

Interactive 3D portfolio for Kenneth Eladistu (full-stack, DevOps & cloud). The whole site is one cozy low-poly scene, a log cabin in a forest clearing at dusk. Clickable objects in the scene act as the navigation:

| Object | Section key | Content |
|---|---|---|
| Cabin | `cabin` | Fades into the cabin interior (no panel) |
| Campfire | `skills` | Frontend / backend / data skills |
| Woodshed (with a tiny server rack) | `workshop` | DevOps & cloud tooling |
| Signpost | `projects` | Projects |
| Mailbox | `contact` | Contact links |

**Inside the cabin** (area `inside`; the room is built at `ROOM` = x 200, far from the clearing, and the camera teleports there behind a fade). A "Step outside" button and Esc return to the clearing.

| Object | Section key | Content |
|---|---|---|
| Armchair | `chair` | About me (nav "About") |
| Bookshelf | `bookshelf` | Books, certifications, currently learning |
| Fireplace | `fireplace` | Journey timeline |
| Deer painting | `painting` | Hobbies / life outside code |

**Design direction: cozy, warm, hand-crafted. NOT flashy or "AI-looking".** No neon, glows, gradient text, glassmorphism or bloom. Prefer muted natural colors, flat-shaded low-poly geometry, serif headings (Fraunces) and paper-like UI.

## Stack & commands

- Vite 5 + vanilla JS (ES modules), three.js, gsap. No framework and no TypeScript.
- `npm run dev`: dev server at http://localhost:5173
- `npm run build`: production build to `dist/`. Run it to verify changes compile before committing.

## Structure

- `src/data.js`: **all personal content** (profile, about, learning, journey, outside, skills, workshop, projects). Edit content here, never hard-code it elsewhere.
- `src/scene.js`: three.js scene.
  - `createScene(canvas, { onPick })` returns `{ focus, hotspots, labelPositions }`.
  - `hotspot(key, label, group, labelY, view, area)` registers a clickable object. `view = { pos, target }` is the close-up camera shot (world coords; use `at(x, y, z)` for room-local coords). `area` is `'outside'` or `'inside'`.
  - `setArea(area)` teleports between the clearing and the interior; `main.js` calls it via `goTo(area, then)` behind the `#fade` overlay.
  - `buildRoom()` builds the interior (logs, fireplace, bookshelf, armchair, painting via `deerTexture()`).
  - Builders at the bottom of the file: `buildCabin`, `buildCampfire`, `buildShed`, `buildSignpost`, `buildMailbox`.
  - The color palette lives in the `C` object at the top.
  - When a panel is open, `applyViewOffset()` shifts the camera frustum so the focused object isn't covered by the panel (right side on desktop, bottom on mobile).
- `src/main.js`: UI. `pages[key]()` returns panel HTML. Also handles the nav, the in-world HTML labels and the sound toggle.
- `src/audio.js`: procedural Web Audio ambience (no audio files): soft fire, gentle crickets, music-box melody. Keep it calm, never harsh or eerie.
- `src/style.css`: CSS variables at the top. The `body.reading` class is set while a panel is open.
- `public/models/`: optional `.glb` models. `cabin.glb` automatically replaces the procedural cabin.

## Conventions

- Match the existing style: small helpers (`std()`, `mesh()`), flat shading, minimal comments.
- Animate inside the single `tick()` loop; don't add extra `requestAnimationFrame` loops in the scene.
- Keep performance in mind: instanced meshes for repeated objects, only the moon light casts shadows, pixel ratio capped at 1.75.
- Adding a new section means: a builder in `scene.js`, a `hotspot(...)` call, a `pages[key]` entry and a `navItems` entry in `main.js`, and content in `data.js`.
- In-world labels are short plain words ("Explore", "Projects", "Contact"), not the object name.
- Only the current area is rendered and animated (`scene.children` visibility is toggled in `setArea`); inside, the camera is a first-person look-around (target just in front of it).
- Must work on mobile (≤640px: the panel becomes a bottom sheet).
- 3D models from the web must be free to use (CC0 or CC-BY, with credit added to the README) and saved as `.glb` in `public/models/`.

## Git workflow

- Remote: https://github.com/KEladistu/3D-portfolio (branch `main`).
- Commit **each feature/step separately** with conventional commit messages (`feat:`, `fix:`, `chore:`, `docs:`), then push.
- Run `npm run build` before committing.

## Roadmap / improvements

Check items off as they're completed.

### Day / night mode
- [ ] Toggle button in the header (sun / moon icon).
- [ ] **Light mode = morning:** soft blue-to-peach sky, warm sun as the directional light (shadows), brighter hemisphere light, light-blue fog, no stars/moon, a sun disc, windows and fire less dominant, fireflies hidden, birds instead of crickets in the audio.
- [ ] **Dark mode = night** (current look).
- [ ] Smoothly tween every value (sky uniforms, fog, light colors and intensities, exposure) with gsap over about 2s; don't snap.
- [ ] Define all values in one `THEMES = { day, night }` object in `scene.js`. Expose `setTheme(name)`.
- [ ] UI follows the theme (label and button colors). Remember the choice in `localStorage` and default to `prefers-color-scheme`.

### Scene & interaction
- [x] Walk inside the cabin: cozy interior with armchair, bookshelf, fireplace and deer painting.
- [ ] Inside the cabin: a desk with a monitor showing GitHub activity; window that shows the real outdoor scene.
- [ ] Signpost: each plank is its own project and clicking one zooms in on it.
- [ ] Mailbox: the flag lifts and a letter slides out with a small contact form.
- [ ] Ambient life: a cat on the porch, a clickable owl as an easter egg, a few birds in the morning.
- [ ] Swap procedural pieces for quality CC0 models where they look better (cabin, trees).
- [ ] Wind sway on trees (vertex shader on the instanced cones).

### Performance & quality
- [ ] Real loading progress (THREE.LoadingManager) once `.glb` models are added.
- [ ] Code-split three.js / gsap into a vendor chunk (the build warns about chunk size).
- [ ] Lower quality on weak devices (fewer trees, no shadows) based on a quick FPS check.
- [ ] Pause rendering when the tab is hidden or nothing is moving.
- [ ] Respect `prefers-reduced-motion` (no auto-rotate, instant camera cuts).

### Accessibility & SEO
- [ ] Keyboard navigation for hotspots (Tab through labels, Enter to open).
- [ ] Non-WebGL fallback: a plain HTML version of all sections.
- [ ] Open Graph image, favicon and meta tags.

### DevOps (showcase the skills)
- [ ] GitHub Actions: build on every push and deploy to GitHub Pages (or AWS S3 + CloudFront via Terraform).
- [ ] Lighthouse CI check in the pipeline.
- [ ] Custom domain.
