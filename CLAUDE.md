# CLAUDE.md

Guidance for Claude Code and other AI assistants working in this repository.

## What this is
**Pixel Space / Focus Quest**: a single-page, client-only React + Vite + Tailwind app (focus timer, tasks,
calendar, roaming buddy, banner library, garden builder, tile manager, sprite-sheet importer, pixel creator).
See `README.md` for the full feature list. There is no backend, no router and no test suite.

## Commands
```bash
npm install
npm run dev       # Vite dev server
npm run build     # production build -> dist/ (must pass before committing)
npm run preview   # serve dist/ locally (port 4173)
```
Node 18+ (`.nvmrc` says 20). Deploys to Vercel from `vercel.json`.

## Architecture (read this first)
- `src/components/*.jsx` render **static markup only**. They hold no state and must not re-render.
  Every one is wrapped in `memo` and receives no props.
- `src/engine/app.js` exports `initApp()`, called once from `App.jsx` in `useEffect`. It finds elements by
  **id**, `data-*` attributes and classes, attaches listeners, and mutates the DOM directly
  (`innerHTML`, `classList`, canvas drawing). It runs as an ES module, so it is in strict mode.
- `main.jsx` deliberately does not use `StrictMode` (the engine registers global listeners and a render loop once).
- Because the engine owns the DOM inside those components, **do not add React state or props that re-render
  them**. If you port a feature to real React, move it out of `app.js`, delete its engine code, and keep the
  markup and ids consistent.

## The id / attribute contract
The engine and the JSX must agree. When you rename or remove an element, search `engine/app.js` for the id.
- **Ids must be unique across all components.** (A past bug: a menu modal id collided with the minutes box id `mm`.)
- Modals are `div.modal#<id>`; open/close by toggling the `open` class through the engine's `open(id, bool)`.
  `[data-close]` buttons close their nearest modal.
- `[data-l]` marks "ledges" the buddy can stand on. Do not reuse `data-l` for anything else.
- Menu items: `.mi`; `data-go="#id"` forwards the click to another control.
- Layer rows in the pixel creator use `data-ly`; tools use `data-px`; garden tools `data-tool`, tabs `data-cat`.

- **Never return a falsy value from a DOM0 handler** (`el.onkeydown = e => cond && fn()`): returning `false` cancels
  the event, which silently blocked typing in the task input once. Use a block body: `e => { if (cond) fn(); }`.

## Authentication (login / sign up)
Unlike the rest of the UI, auth is a **real React feature** in `src/auth/` (state, hooks, controlled forms):
- `api.js`: fetch client. **Access token in memory only** (never `localStorage`); refresh via the `httpOnly` cookie;
  single-flight refresh and one retry on `401`; sends `credentials: 'include'` and `X-Requested-With`.
- `AuthContext.jsx`: `AuthProvider` / `useAuth()` (`status`: `checking | guest | authed`, `user`, `login`, `signup`,
  `logout`, `forgotPassword`, `resetPassword`, `openAuth`, `authFetch`). Handles `?reset=` and `?auth=success|error`
  on load, silent session restore (via the `fq_session` hint), proactive refresh, cross-tab logout. Emits the window
  event `fq:auth-changed` (`detail: { status, user }`) so the imperative engine can react later (e.g. progress sync).
- `AuthModal.jsx`: login / signup / forgot / reset / account views. It uses `.amodal` (not `.modal`) because the engine
  toggles `.modal` classes directly and would fight React; it is mounted only while open. Element ids use the `au-` prefix.
- `AccountMenuItem.jsx`: the **last** item in the game menu (keeps a constant `className="mi"` so the menu cursor works).
- The app is **guest-first**; never block gameplay on auth. Keep error text generic for credentials and for
  forgot-password (no account enumeration).
- Backend contract: README "Backend API reference" and `docs/AUTH_API.md` (`{{Base Url}}` = backend origin + `/api/v1`). Local mock: `npm run mock:api` (needs `npm run dev` or `npm run preview`, both proxy `/api`).
- For future sync code, call `authFetch()` from `src/auth/api.js` (or `useAuth().authFetch`); do not read tokens elsewhere.

## Backend DTOs (keep these in sync)
The README "Backend API reference" is the contract with the Spring Boot backend. The engine rebuilds the DTOs from live state
(`fq.dto.*` in the console, logged on every page load): `src/data/dto.js` has the pure builders, and the "backend DTOs"
section at the end of `engine/app.js` wires them to the state.
- Sprites: every tile (Pixel Creator, upload, sprite-sheet slice, edits) is a custom sprite with a numeric `sid` (from 1001),
  `created` / `updated` stamps, and a category (default `CUSTOMS`). Built-ins are ids `index + 1` (1 to 80).
- Garden: `G.cells` (cell key -> up to two ids) maps to the `layer-1` / `layer-2` 256 x 128 grids; timestamps live in `fq_garden_meta`.
- Tasks: `S.tasks` maps to the Task DTO (`id` doubles as creation time; `at` is the completion time).
- If you add a field or a feature that changes sprites, the garden, tasks or users, update the builders, the README tables and the
  seed file (`npm run export:builtin`) in the same change. Never send a client-supplied `user` to the server.

## Styling
- `src/index.css`: design tokens in `:root` (`--g1`, `--g2`, `--acc`, `--box`, `--panel`, `--ink`, `--line`,
  `--edge`, `--bd`, `--r`), then component styles, then the Tailwind layers at the end (this order matches the
  original page; utilities win ties).
- Two independent switches on `<html>`: `data-theme` (`leaf` default, `berry`; colour theme) and `data-scheme`
  (`light` / `dark`; dark mode, with a user setting of light / dark / auto). Both are token overrides in `index.css`.
  The engine sets them in `ui()` and tints the grass colours per timer mode. `index.html` has a tiny inline script that
  applies the saved values before first paint; keep it in sync with the engine's storage shape (`focusquest.theme`,
  `focusquest.scheme`).
- Use `var(--line)` for borders and hard shadows, `var(--ink)` for text, `var(--panel)` for input/inner
  backgrounds. Do not hard-code `#fff`/`#383838` in new rules.
- The look is flat pixel art: no gradients, no blur, no soft shadows. Font: Press Start 2P.
- Tailwind scans `src/**/*.{js,jsx}`, so classes inside engine template strings are picked up.

## Data
- `localStorage`: `focusquest` (settings, tasks, theme, shortcuts, banner choice), `fq_garden`, `fq_garden_meta`, `fq_sid_seq`,
  `fq_pix_pal`, `fq_pix_draft`, `fq_custom`.
- IndexedDB `focusquest` (version 2): stores `banners` and `tiles` (Blobs).
- Garden cells store ids: numbers index `src/data/atlasMeta.js`; strings (`c...`) are custom tiles.
  **Never reorder or insert into `META`**, append only. Removing the tail is safe (the engine drops unknown ids).
- Reset path: Settings → Reset data clears all of the above.

## Assets
- `src/assets/atlas.png` + `src/data/atlasMeta.js`: garden sprite atlas. Entries are `[kind,x,y,w,h]`
  with kind `g` ground tile, `p` prop tile, `n` nature object. Keep them in sync if you repack.
- `cats.png`, `saga.png`: buddy sprite sheets (frame indexes are defined in the engine's pet definitions).

## Conventions
- Keep the engine's section comments (`/* ---- name ---- */`) and add new features as new sections.
- Keyboard shortcuts are defined in `DK` (defaults), `ACT` (labels) and `ACTS` (handlers) in the engine;
  shortcuts must stay inactive while typing or while a modal is open.
- Canvas zoom shortcuts (`Ctrl +/-/0`, `Ctrl` + wheel) apply only while the pointer is over that canvas.
- Prefer small, verified changes: run `npm run build`, then exercise the feature in a browser
  (Playwright works well; the page loads Google Fonts, which may be blocked offline and is harmless).

## Known gaps / ideas
- Port features from `engine/app.js` into hooks and components one at a time.
- No automated tests yet (the auth flows were verified end to end against `scripts/mock-api.mjs` with Playwright). A Playwright smoke test (timer, tasks, banner upload, garden paint, pixel creator)
  would be a good first addition.
