# Deployment

Live site: https://keladistu.github.io/3D-portfolio/

## Pipeline (`.github/workflows/deploy.yml`)

| Trigger | `check` job (lint → typecheck → tests → build) | `deploy` job |
|---|---|---|
| Pull request | ✅ runs | ❌ skipped |
| Push to `main` | ✅ runs, uploads `dist/` | ✅ runs only if `check` passed |
| Manual (Actions → Run workflow) | ✅ | ✅ on `main` |

A failing check never reaches the live site.

## GitHub Pages setup (one-time, already done)

Repository → Settings → Pages → Source: **GitHub Actions**.

## Paths

`vite.config.js` sets `base: './'` so the build works under `/3D-portfolio/`, at a root domain, or on a custom domain without changes. Reference files in `public/` with `import.meta.env.BASE_URL + 'models/x.glb'` — never a leading `/` (a test enforces this).

## Custom domain (later)

1. Buy the domain (Cloudflare Registrar / Porkbun).
2. Settings → Pages → Custom domain → enter it; add the DNS records GitHub shows (CNAME to `keladistu.github.io`, or A records for an apex domain).
3. Tick **Enforce HTTPS** once the certificate is issued.

## Rolling back

Revert the bad commit on `main` (`git revert <sha>` and push). The pipeline redeploys the previous good state automatically.
