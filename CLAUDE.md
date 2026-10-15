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

## PWA (installable, offline)
- `vite.config.js` configures `vite-plugin-pwa` (manifest, Workbox precache of the build, Google Fonts runtime cache, `/api` excluded from
  the navigation fallback). `registerType: 'prompt'`: a new service worker waits until the user accepts the reload.
- `src/pwa.js` registers the worker and holds the state (`pwa`: `offlineReady`, `needRefresh`, `installEvent`, `installed`); it emits the window event
  `fq:pwa`. The engine's "PWA" section renders it (`#minst` menu item, Settings → App `#pwai`) and asks before reloading (not while a timer runs).
- The worker only exists in production builds. Test with `npm run build && npm run preview`. Never cache `/api` or auth responses.
- Icons: `scripts/make-pwa-icons.py` -> `public/icons/`. If you add a new top-level static file type, add it to `workbox.globPatterns`.
- `vercel.json` serves `/sw.js` with `no-cache` so updates are picked up.

## Backend DTOs (keep these in sync)
The README "Backend API reference" is the contract with the Spring Boot backend. The engine rebuilds the DTOs from live state
(`fq.dto.*` in the console, logged on every page load): `src/data/dto.js` has the pure builders, and the "backend DTOs"
section at the end of `engine/app.js` wires them to the state.
- Sprites: every tile (Pixel Creator, upload, sprite-sheet slice, edits) is a custom sprite with a numeric `sid` (from 1001),
  `created` / `updated` stamps, and a category (default `CUSTOMS`). Built-ins are ids `index + 1` (1 to 699; animated ones export their first frame).
- Garden: `G.cells` (cell key -> up to two ids) maps to the `layer-1` / `layer-2` 256 x 128 grids; timestamps live in `fq_garden_meta`.
- Tasks: `S.tasks` maps to the Task DTO (`id` doubles as creation time; `at` is the completion time).
- If you add a field or a feature that changes sprites, the garden, tasks or users, update the builders, the README tables and the
  seed file (`npm run export:builtin`) in the same change. Never send a client-supplied `user` to the server.

## UI, accessibility and UX rules
- **Font sizes:** never hard-code a `font-size` in px. In CSS use `calc(10px*var(--ts))`; in Tailwind use
  `text-[length:calc(10px*var(--ts))]`. `--ts` is the Text size and Readable font multiplier. Keep 10px as the smallest size.
- **Colours:** text colours come from tokens (`--ink`, `--acc-text`); backgrounds with white text use `--acc`. The engine
  recomputes `--acc` and `--acc-text` in `ui()` so they stay at 4.5:1 or better in every theme, mode and dark mode. Do not
  use `--acc` as a text colour on a light panel. Avoid `opacity` below .84 on text.
- **Interactive elements** must be real `<button>`, `<a>` or form controls (never a clickable `div` or `span`), have an accessible
  name, and show `:focus-visible` (global ring). Touch targets stay at least 40 px tall (44 px on coarse pointers).
- **Dialogs** need `role="dialog"` (or `alertdialog`), `aria-modal="true"` and a label. The engine's MutationObserver
  ("dialog accessibility" section) handles inert background, focus in/out, Tab trap and scroll lock for every `.modal`; just toggle
  the `open` class. Use `ask()` instead of `window.confirm()`, and `announce()` for screen-reader messages.
- **Motion:** respect `prefers-reduced-motion` and the in-app Motion setting (`reducedMotion()` in the engine, CSS under
  `[data-motion]`). Do not rely on animation to convey information.
- **Shortcuts** must not fire while typing, in dialogs, or when the key natively activates the focused control (Space on a button).
- **Buddy talk** (`src/data/funFacts.js`): keep requests user-initiated (hover, focus, tap), without cookies or referrer, with a
  timeout, length cap and offline fallback. Do not add prefetching on page load.
- **Verify:** after UI changes run an axe-core scan (every dialog, light, dark, high contrast) and exercise keyboard paths.

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
- `src/assets/atlas.png` + `src/data/atlasMeta.js`: garden sprite atlas. Entries are `[kind,x,y,w,h,category?,frames?]`
  with kind `g` ground tile, `p` prop tile, `n` nature object. `category` overrides the default tab (`GROUND`/`PROPS`/`NATURE`);
  `frames` > 1 means an animation whose frames are stacked vertically (frame k at `y + k*h`). Keep them in sync if you repack.
  The Craftpix dungeon pack (ids 81 to 699) was appended by `scripts/pack-dungeon.py`; the atlas is now 512 x 826 (`AH` in the engine).
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

## Clock header and PiP
- Clock header row (`.fhead`): mode select, badge, then icon buttons `#pip` and `#auto` (icon-only; state is `aria-pressed` + `.on`, never `textContent`).
- The visual progress bar is `sr-only` on the main clock (still drives `#hpb`, which the PiP window mirrors).
- PiP window markup is built in `pipToggle()`; layouts are pure CSS under `.pip` (tall vs `@media(max-height:149px)`, hover / `:focus-within` reveal).

## Garden and pixel creator UI
- Icons: `src/components/PixelIcon.jsx` holds every icon as a 16 x 16 ASCII grid (`#` = pixel). `ToolButton.jsx` is the icon + small label button; its `tip` text is shown by the tooltip block in app.js (hover, keyboard focus, or long press on touch).
- Garden layout is CSS only: desktop = tools | square canvas | tiles; phones (<768px) = tools row, square canvas, tiles below.
- Garden undo/redo (`gstep`, `gcommit`) stores per-stroke diffs of the cells map; `ghClear()` after deleting a tile.
- The icon inside the canvas (`#gfs`) toggles the full screen world preview (`.full` on `#mg`): canvas only, no grid or tools, drag to pan, zoom buttons, Esc exits.
