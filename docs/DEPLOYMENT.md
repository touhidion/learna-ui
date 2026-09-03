# Deploying learna-ui to Netlify

The full cross-service guide — Render, Neon, and how the two services are wired
together — lives in the API repo at `learna-api/docs/DEPLOYMENT.md`. This page
covers only what is specific to this repo.

---

## Setup

[`netlify.toml`](../netlify.toml) carries the whole configuration.

**Netlify → Add new site → Import an existing project → select this repo.**
Accept the detected build command and publish directory; both come from the
file.

Then replace the two placeholders under `[context.production.environment]`:

```toml
NEXT_PUBLIC_API_URL  = "https://YOUR-SERVICE.onrender.com"   # no trailing slash
NEXT_PUBLIC_SITE_URL = "https://YOUR-SITE.netlify.app"
```

Commit and push to trigger a rebuild.

---

## The three things that trip people up

**1. `NEXT_PUBLIC_*` is build-time, not runtime.**

These values are compiled into the JavaScript bundle. Setting one in the
Netlify UI without triggering a rebuild changes nothing, and a restart does not
help — only a fresh deploy does. To confirm which host the bundle actually
calls, open DevTools → Network on the live site.

**2. `output: "standalone"` must stay off on Netlify.**

Netlify's Next.js runtime packages the app itself and does not support
standalone output; the Docker image in this repo requires it. `next.config.ts`
resolves this by switching on Netlify's own `NETLIFY` environment variable:

```ts
const isNetlify = process.env.NETLIFY === "true";
output: isNetlify ? undefined : "standalone",
```

Do not hardcode either value — that breaks the other target.

**3. devDependencies must be installed.**

Netlify sets `NODE_ENV=production`, which would skip them, and the build needs
TypeScript, ESLint and Tailwind. `NPM_FLAGS = "--include=dev"` in
`netlify.toml` handles it. `NODE_VERSION = "22"` is there because Next 16
requires Node 20+.

---

## Deploy previews cannot call the API

Every preview gets a unique hostname, and the API allows exact origins only, so
browser calls from a preview are blocked by CORS. Previews are good for
reviewing layout; they cannot exercise sign-in.

To enable a specific preview, add its origin to `CORS_ALLOWED_ORIGINS` on the
API. Never use a wildcard — the API rejects it in production anyway.

---

## Checking a build locally

Reproduce what Netlify does:

```bash
NETLIFY=true \
NEXT_PUBLIC_API_URL=https://YOUR-SERVICE.onrender.com \
NEXT_PUBLIC_SITE_URL=https://YOUR-SITE.netlify.app \
npm run build
```

`.next/standalone/` should **not** exist afterwards. If it does, the Netlify
branch of `next.config.ts` did not take effect and the deploy will misbehave.

Confirm the API URL was inlined:

```bash
grep -rho 'YOUR-SERVICE.onrender.com' .next/static/chunks/*.js | head -1
```
