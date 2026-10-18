import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths so the site works at keladistu.github.io/3D-portfolio/ (or any sub-path / custom domain).
  base: './',
  build: {
    rollupOptions: {
      output: {
        // Keep three.js / gsap in their own cached chunk; app updates then don't re-download the engine.
        manualChunks: { vendor: ['three', 'gsap'] },
      },
    },
    chunkSizeWarningLimit: 800,
  },
});
