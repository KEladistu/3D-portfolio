# 3D Portfolio — a cabin in the woods

An interactive 3D portfolio built with [three.js](https://threejs.org) and Vite. Explore a cozy low-poly cabin at dusk — click the cabin, campfire, workshop, signpost and mailbox to learn about my work as a full-stack, DevOps and cloud engineer.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Customize

- **Content** — edit `src/data.js` (profile, about, skills, projects, links).
- **3D models** — drop a `.glb` at `public/models/cabin.glb` to replace the procedural cabin.

## Structure

| File | Purpose |
|---|---|
| `src/scene.js` | three.js scene: terrain, forest, cabin, campfire, workshop, camera & interaction |
| `src/main.js` | UI: panels, navigation, in-world labels |
| `src/audio.js` | Procedural ambience (fire, wind, crickets) via Web Audio |
| `src/style.css` | Styling |
