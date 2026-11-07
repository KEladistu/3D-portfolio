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
| Golliath (Kenneth's apricot toy poodle) | `golliath` | About the dog + link to his game; barks if sound is on |
| Blk (Golliath's black-poodle brother, runs faster) | `blk` | About Blk; lower bark |

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
- `npm run build`: production build to `dist/`.
- `npm run lint` (ESLint) · `npm run typecheck` (tsc checkJs over `src/`) · `npm run test` (Vitest, `tests/`)
- **`npm run check`**: runs all four. The Claude Code Stop hook (`.claude/settings.json` → `.claude/hooks/stop-check.sh`) and CI run this same command.

More detail: [docs/architecture.md](docs/architecture.md) · [docs/deployment.md](docs/deployment.md)

## Definition of done

Before saying a task is done:
1. `npm run check` passes (lint, typecheck, tests, build). The Stop hook enforces this whenever files changed.
2. New features or bug fixes come with a new or updated test where the behavior is testable (content, pages, wiring). 3D visuals aren't unit-testable, so check them with a headless Chrome screenshot (desktop 1440×900 and phone 390×844) when the change is visual.
3. Each feature is its own conventional commit, pushed to `main` (CI then deploys).
4. Report honestly what was verified and what wasn't (for example "not tested on a real phone").

## Stop and ask Kenneth first

- **Personal information:** never publish a phone number, home address, or the résumé PDF (it contains the phone number) without explicit approval. Tests also guard against a phone number in `data.js`.
- **Claims about his work:** don't invent experience, metrics, employers or certifications. Ask, or mark placeholders clearly.
- **Destructive or irreversible git:** force-push, history rewrites, deleting branches or files that aren't yours to remove.
- **Deployment and hosting:** changing `.github/workflows/`, GitHub Pages settings, the repo name, or custom domain/DNS.
- **New dependencies** beyond small dev tools, or anything that sends data to a third party (analytics, forms, trackers).
- **Third-party 3D models or assets:** confirm the license (CC0/CC-BY) first.

## Structure

- `src/data.js`: **all personal content** (profile, about, learning, journey, outside, skills, workshop, projects). Edit content here, never hard-code it elsewhere.
- `src/scene.js`: three.js scene.
  - `createScene(canvas, { onPick })` returns `{ focus, hotspots, labelPositions }`.
  - `hotspot(key, label, group, labelY, view, area)` registers a clickable object. `view = { pos, target }` is the close-up camera shot (world coords; use `at(x, y, z)` for room-local coords). `area` is `'outside'` or `'inside'`.
  - `setArea(area)` teleports between the clearing and the interior; `main.js` calls it via `goTo(area, then)` behind the `#fade` overlay.
  - `buildRoom()` builds the interior (logs, fireplace, bookshelf, armchair, painting via `deerTexture()`).
  - `buildPoodle(coat)` builds a poodle (`COATS.apricot` = Golliath, `COATS.blk` = Blk). `updateDogs()` poses the meshes from **`src/dogs.js`**, which holds the pure, unit-tested behavior: walking the `PATH` loop, and the random squabble when the brothers meet (spin facing each other, growl via `onDogs('spar-start')`, then split up). Sleeping copies of both lie on the room rug. A hotspot `view` may be a function (used for the moving dogs).
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
- Keep performance in mind: instanced meshes for repeated objects, only the moon light casts shadows, pixel ratio capped at 1.75 (1.5 on mobile). `hotspot()` runs `mergeStatic()` on each object, merging static meshes into one per material. Put animated meshes in `group.userData.skip`, or set `userData.noMerge`.
- `MOBILE` (coarse pointer or small screen) lowers quality: smaller shadow map, fewer trees. Hover raycasts only run for a real mouse; taps raycast on `pointerup`.
- Adding a new section means: a builder in `scene.js`, a `hotspot(...)` call, a `pages[key]` entry and a `navItems` entry in `main.js`, and content in `data.js`.
- In-world labels are short plain words ("Explore", "Projects", "Contact"), not the object name.
- Only the current area is rendered and animated (`scene.children` visibility is toggled in `setArea`); inside, the camera is a first-person look-around (target just in front of it).
- Must work on mobile (≤640px: the panel becomes a bottom sheet).
- Headless Chrome on Windows can't go narrower than ~500px: a `--window-size=390,…` screenshot is really a 500px layout cropped to 390. Don't "fix" things that only look cut off in those shots. Skip the loader for screenshots with a temporary `$('#loader').remove()` (revert it afterwards).
- Theme-specific UI uses `body.day` (and `body.day:not(.inside)` for outdoor-only text colors).
- 3D models from the web must be free to use (CC0 or CC-BY, with credit added to the README) and saved as `.glb` in `public/models/`.

## Deployment

- Pushing to `main` triggers the GitHub Pages workflow. `vite.config.js` uses `base: './'`, so always reference public assets via `import.meta.env.BASE_URL`, never with a leading `/`.

## Git workflow

- Remote: https://github.com/KEladistu/3D-portfolio (branch `main`).
- Commit **each feature/step separately** with conventional commit messages (`feat:`, `fix:`, `chore:`, `docs:`), then push.
- Run `npm run build` before committing.

## Roadmap / improvements

Check items off as they're completed.

### Day / night mode
- [x] ☀/☾ toggle in the header. Night is the default; the choice is saved in `localStorage`; `?theme=day` / `?theme=night` in the URL overrides it for that visit.
- [x] Morning: blue-to-peach sky, sun disc and sunlight (shadows), no stars/moon/fireflies, softer campfire, blue window inside, birds instead of crickets.
- [x] Inside: the dogs sleep at night and sit up awake in the morning (`setPose` / `poseIndoorDogs`).
- [x] All values live in `src/themes.js` (`THEMES`, unit-tested `themeAt(mix)`). `scene.setTheme()` tweens a single `mix` 0→1 over 2s and `applyTheme()` reads it, so nothing runs per frame once the tween ends.

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
- [x] Code-split three.js / gsap into a vendor chunk (`vite.config.js`).
- [x] Lower quality on mobile (resolution, shadow map, tree count).
- [ ] Adaptive quality from a live FPS check.
- [ ] Pause rendering when the tab is hidden or nothing is moving.
- [ ] Respect `prefers-reduced-motion` (no auto-rotate, instant camera cuts).

### Accessibility & SEO
- [ ] Keyboard navigation for hotspots (Tab through labels, Enter to open).
- [ ] Non-WebGL fallback: a plain HTML version of all sections.
- [ ] Open Graph image, favicon and meta tags.

### DevOps (showcase the skills)
- [x] GitHub Actions: build on every push and deploy to GitHub Pages (`.github/workflows/deploy.yml`). Live at https://keladistu.github.io/3D-portfolio/
- [ ] Lighthouse CI check in the pipeline.
- [ ] Custom domain.
