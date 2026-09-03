# learna-ui

Frontend for [Learna](../learna-api), a self-hosted training portal.
Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4.

See [docs/learna-architecture.md](docs/learna-architecture.md) for the system
design and [docs/learna-features.md](docs/learna-features.md) for the feature
list this implements.

> The architecture doc specifies Next.js 14 and Tailwind 3. This app is built
> on Next 16 / React 19 / Tailwind 4 — the same App Router structure and route
> groups, on a current stack. The visible difference is Tailwind's CSS-first
> config: design tokens live in `src/app/globals.css`, and there is no
> `tailwind.config.ts`.

---

## Quick start

> Deploying? See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for Netlify, and
> `learna-api/docs/DEPLOYMENT.md` for the full Render + Netlify + Neon guide.

```bash
cp .env.local.example .env.local   # defaults point at http://localhost:8080
npm install
npm run dev                        # http://localhost:3000
```

The API must be running for anything past the landing page to load — see
[../learna-api](../learna-api).

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with Turbopack |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run check` | Typecheck, then lint — run before pushing |

---

## Layout

```
src/
  app/
    (public)/     landing, catalog, course preview, certificate verification
    (auth)/       login, signup, forgot/reset password
    (learner)/    dashboard, course player, certificates, profile
    (admin)/      admin dashboard, courses, modules, users, analytics
    layout.tsx    fonts, metadata, providers
    globals.css   design tokens and the markdown styles for lesson content
  components/
    ui/           primitives: button, input, card, badge, skeleton, progress
    common/       navbar, footer, theme toggle, placeholder
    auth/         login and signup forms
    course/       course cards, sidebar, lesson content (to build)
    admin/        course form, module editor, uploader, tables (to build)
  lib/
    api.ts        the HTTP client — token attach + refresh on 401
    auth-storage.ts  token and user persistence
    env.ts        validated public environment
    utils.ts      cn(), formatters, YouTube/Vimeo embed URLs
  hooks/          useRequireAuth, useDebounce
  providers/      auth, react-query, theme, toasts
  types/          shapes shared with the API
```

Route groups (`(public)`, `(auth)`, `(learner)`, `(admin)`) do not appear in
URLs — they exist so each area gets its own layout and guard. `/dashboard` is
in `(learner)`, `/admin/courses` is in `(admin)`.

---

## How auth works

The API returns tokens in the response body rather than setting cookies, so
they live in `localStorage` and every authenticated view renders on the client.
Public pages (`(public)`) render on the server for SEO and never read the
session.

`src/lib/api.ts` holds the whole flow. A request interceptor attaches the
access token. A response interceptor catches a 401, refreshes once, and retries
the original request — and because parallel requests share a single in-flight
refresh promise, a dashboard firing five requests on a stale token does not
send five refreshes and log the user out. When the refresh itself fails, the
session is cleared and the browser goes to `/login?next=…`.

`useRequireAuth` guards the learner and admin layouts. It is a **UX guard, not
a security boundary** — the API checks the token and the role on every
protected endpoint regardless of what the UI does.

---

## Styling

Tailwind 4 with CSS-first configuration. Semantic tokens are defined once in
`globals.css` (`--primary`, `--muted-foreground`, `--border`, …) and exposed to
Tailwind through `@theme inline`, so components use `bg-primary` and
`text-muted-foreground` rather than raw colours. Dark mode is one block of
token overrides under `.dark`; components carry no `dark:` classes.

The dark palette is not the light one dimmed — `--primary` is lifted and
desaturated, because the light-mode indigo fails contrast against a dark
ground.

---

## Implementation status

**Working**

- App Router structure with all four route groups and their layouts
- Design tokens, light and dark themes, theme toggle that survives reload
- API client with token refresh, typed errors and upload progress
- Auth context: restore session on load, cross-tab sync, login, signup, logout
- Route guards for the learner and admin areas
- Sign-in and sign-up forms — validated with zod, API field errors mapped back
  onto the form (features UA1, UA2, UA5)
- Landing page (UP1), public navbar (UP5), footer (UP6)
- 404 page (UI7), error boundary (UI8), toasts (UI4), skeletons and empty
  states (UI2, UI3)

**Scaffolded, showing a placeholder**

Every remaining Phase 1 route is registered and reachable, each naming the
feature IDs that will replace it: catalog (UP2), course preview (UP3),
certificate verification (UP4), forgot/reset password (UA3, UA4), learner
dashboard (LD1–LD2), course player (LC1–LC8), certificates (LCT1–LCT3),
profile (LP1–LP3), and the admin dashboard, course editor, module editor, user
management and analytics (AD1–ACA1).

---

## Docker

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
  --build-arg NEXT_PUBLIC_SITE_URL=https://learn.example.com \
  -t learna-ui .

docker run -p 3000:3000 learna-ui
```

`NEXT_PUBLIC_*` values are inlined into the client bundle at build time, not
read at runtime — changing the API URL means rebuilding the image.
