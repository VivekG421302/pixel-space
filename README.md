# Pixel Space

**Focus Quest**: a pixel-art focus timer with a roaming buddy, a banner library, a garden builder,
a tile manager with sprite-sheet slicing, and a pixel-art creator. Built with React, Vite and Tailwind CSS.
The look is inspired by Pokémon LeafGreen: flat dialog boxes, chunky buttons, 8-bit chimes.

The app is **local-first**: everything runs in the browser and works offline, with no account. An optional backend
(sign-in today, sync later) is specified in the [Backend API reference](#backend-api-reference).

## Quick start

```bash
npm install
npm run dev       # local dev server
npm run build     # production build in dist/
npm run preview   # serve the production build
npm test          # build, then run the end-to-end and accessibility tests (see Testing)
```

Deploy on Vercel by importing the repo. `vercel.json` already sets the Vite build, the `dist` output,
a single-page rewrite, and long-lived caching for built assets. No environment variables are needed.

## Features and how to use them

### Pages and navigation
Every screen except the little "are you sure?" box is a **page with its own address**, not a pop-up:
`#/menu`, `#/settings`, `#/banners`, `#/tiles`, `#/import`, `#/garden`, `#/draw` and `#/about`. Opening one adds a browser history
entry, so the **Back button** (or the phone's back gesture) returns to the previous page, and `Esc` does the same. Focus moves into the
page when it opens and returns to the button you used when it closes. Reloading a page address returns you to the dashboard (the draw page
needs its tile, so Forward does not reopen it).

### Menu
Press **MENU** (or `,`) to open the menu page. Move with the mouse or `↑` `↓`, choose with `Enter`, go back with `Esc`.
It opens Settings, About, Banners, the Tile Manager, the sprite-sheet importer, the Pixel Creator, the Garden, **Install app**
(only when your browser can install it), switches dark mode and the colour theme, and ends with the account item (log in / sign up).

### Dark mode and themes
- **Dark mode** has three settings: **Light** (default), **Dark** and **Auto** (follows your device).
  Switch it from the menu (DARK MODE item), Settings → Dark Mode, or press `D` to flip between light and dark.
- **Colour themes**: **Leaf** (default green) and **Berry** (soft pink). Pick one in the menu (THEME item)
  or Settings → Colour Theme. Dark mode works with either theme.
- Each timer mode keeps its own colour palette; the theme and dark mode tint it. Your choices are remembered
  and applied before the page paints, so there is no flash.

### Focus timer
Pick a mode from the drop-down on the clock face:

| Mode | Focus | Break |
|---|---|---|
| Pomodoro | 25 min | 5 min |
| 52/17 | 52 min | 17 min |
| 90-Min (ultradian) | 90 min | 20 min |
| Timebox | 60 min | 10 min |
| Custom | 30 min | 10 min |

Every duration can be changed in Settings → Timers. Controls: **Reset**, **Start / Pause / Resume**,
**Skip** (jump to the next phase). The HP bar drains as time runs out. The page title shows the
countdown. A chime plays when a phase ends, and the status line shows a random message per state.

**Auto mode** (the **AUTO** button under the controls, or Settings → Timers) runs the selected mode as a continuous
cycle: focus, a 5 second chime, break, a 5 second chime, then focus again, and so on (25 / 5 minutes in Pomodoro).
Turning it on starts the timer; turning it off lets the current phase finish and stop as usual.

**Picture in picture:** the **PIP** icon (top right of the clock) pops the clock out into a small always-on-top window with Start / Pause and
Skip buttons (Document Picture-in-Picture in Chrome and Edge; a video-based PiP in browsers that only support that).

### Missions (tasks) and calendar
- Add a mission with the input box (Enter or `+`). Tick it to complete it with a two-tone chime.
- **History** groups completed missions by completion date.
- The calendar highlights today and has previous / next month buttons.

### Buddy
A pixel character roams over the page, walking along panel edges, hopping between them, grooming,
napping on the clock during breaks, and cheering when you finish a mission or a session.
- **Click** it for a spin and a burst of hearts.
- **Drag** it anywhere. A dashed marker shows where it will land. It lands on the nearest surface
  below, or falls to the ground if nothing is underneath.
- Choose a buddy in Settings → Buddy: four cats (Snow, Shadow, Ginger, Tuxedo) and the 32-character
  Saga crew. You can also upload your own sprite sheet (columns, rows, frame lists, facing direction).

### Buddy facts and jokes
Hover your buddy (or focus it with the keyboard and press Enter, or tap it on a phone) and it says a **fresh fact or joke**
from a free public API: jokes from [JokeAPI](https://v2.jokeapi.dev) in its family-friendly safe mode, facts from
[Useless Facts](https://uselessfacts.jsph.pl). Two-part jokes show the setup first, then the punchline. The buddy holds still
while you read, repeats the last line if you hover again within 20 seconds, and never repeats a recent one.
If you are offline, the APIs are blocked, or a result is too long, it uses built-in lines and marks them **(OFFLINE)**.
Settings → Buddy Talk turns it off or limits it to **Facts** or **Jokes**. Requests are made from your browser only when you hover,
focus or tap the buddy, with no cookies and no referrer, so those two services can see your IP address as with any website.

### Banner
The banner above the timer keeps a fixed 3:1 shape (images are cropped to fit, never stretched).
- ✎ opens the **banner library**: upload GIF / PNG / JPG / WEBP (up to 15 MB), click a past banner to
  use it, delete old ones. The library keeps your 24 most recent.
- ✕ hides the banner. A **+ Banner** button brings it back. You can also drop an image anywhere on the page.

### Installable app (PWA)
Focus Quest is a Progressive Web App.
- **Install:** **MENU → INSTALL APP** installs it when your browser offers installation (Chrome, Edge, Android; elsewhere it shows how),
  and Settings → App has an **Install** button. On iPhone and iPad use Share → Add to Home Screen. The installed app opens in its own window.
- **Offline:** after the first visit everything (timer, tasks, garden, tiles, pixel creator, fonts) works without a connection. Buddy facts and
  jokes fall back to the built-in lines when offline. Your data never leaves the browser, so nothing needs to sync.
- **Updates:** a new version downloads in the background and the app asks before reloading (it waits if a timer is running).
  Settings → App → **Check now** looks for one on demand. The app also checks when you return to it and hourly.
- The service worker is generated at build time by `vite-plugin-pwa` (see `vite.config.js`) and only runs in the built app, not in `npm run dev`.
  Try it with `npm run build && npm run preview`. The `/api` backend is never cached. Icons are drawn by `scripts/make-pwa-icons.py`.

### Garden builder
A 128 × 256 tile ground to decorate. Open it from the dock, the menu, or `G`. It is a page with three areas:
- **Desktop:** tools in a column on the left, **the canvas filling all the space in the middle**, and the tile categories and tiles on the right.
- **Phone:** the tools in a row across the top (swipe it, or use the arrows that appear), the canvas below, and the tiles at the bottom.

Tools (each has an icon, its name in small text underneath, and a longer name on hover, keyboard focus or a long press):
**Paint**, **Erase**, **Move**, **Pan**, **Undo**, **Redo**, **Grid**, **Center**, **Zoom −/+**, **Tiles** (Tile Manager), **Draw** (Pixel Creator),
**Clear** and **Close**.
- **Paint** (click or drag), **Erase** (right click or the Erase tool), **Move** (drag the top tile of a cell to another cell),
  **Pan** (Pan tool, `Space` + drag, or middle mouse drag).
- **Cursors follow the tool:** a brush for Paint (or *not allowed* if no tile is selected), an eraser, a grab hand over a tile for Move,
  and an open or closed hand for Pan.
- **Undo / Redo** (`Ctrl Z` / `Ctrl Y`): every paint drag, erase drag, move or Clear is one step, up to 100 steps.
- Each tile holds at most **two layers**. Placing on an empty tile puts the item there; placing on a filled tile stacks on top;
  placing on a full tile replaces the top layer.
- **Zoom** with `Ctrl` + mouse wheel, `Ctrl +` / `Ctrl -` (with the pointer over the canvas), or the buttons. The garden saves automatically.
- **Tiles panel:** category tabs (**Ground**, **Props**, **Nature**, **Dungeon**, plus any categories you create) and the tiles.
  **Dungeon** is one category with sections: Walls & Floor, Cracks & Decor, Objects, Doors, Lever & Chest, and Fire. Animated sprites
  play while they are on screen and show their first frame when Motion is set to reduced.
- **World preview:** the icon in the corner of the canvas opens a full screen preview of your world with no grid or panels. Drag to pan,
  scroll or use the − / + buttons to zoom, `Esc` or the same icon to leave.
- The ground is plain green grass edge to edge; everything else is something you place.

### Tile Manager
Menu → Tile Manager (or the **Tiles** button in the garden).
- **Upload tiles** (one or many images).
- Select a tile to **rename**, set its **category** (new names create new dock tabs), set its **type**
  (Ground = flat and under everything, Prop = snaps to the grid at its own size, Object = bottom-centred),
  **rotate** left/right, **flip** horizontally/vertically, **trim** empty edges, **crop** (drag a box on
  the preview, then Crop), **reorder** (◀ ▶) and **delete**.
- **Edit Pixels** reopens a tile (up to 256 px) in the Pixel Creator.

### Import a sprite sheet
Menu → Import Sprite Sheet.
- Choose an image, then set the **tile size in pixels as width × height** (presets 16, 32, 64, 128, 256,
  or any size such as 128 × 64).
- A preview shows the grid. Click cells to include or skip them. **Skip empty** leaves out blank cells.
  **Corner colour clear** makes the top-left colour transparent (handy for JPG sheets).
- Set a name prefix, category and type, then **Import**. Tiles appear in the Tile Manager and the garden dock.

### Pixel Creator
Menu → Pixel Creator (or **Draw** in the garden). It works in **three steps**; the chips at the top (1 Setup, 2 Draw, 3 Save) show where you are
and jump between steps.
1. **Setup** – name, category, type (Ground, Prop or Object), optional trim, and the **grid size** (8, 16, 32, 64, 128, 256 or any width × height from 4 to 256;
   out-of-range values show an error instead of being changed silently). A new sprite starts here.
2. **Draw** – the studio. Editing an existing tile starts here. The **META** icon returns to Setup at any time and keeps your drawing.
3. **Save** – **Finish** (the save icon) opens a read-only preview of the sprite with its size, the details to edit, and **Add to Tiles**,
   **Update Tile** (when editing) and **PNG**. After saving you can jump straight to **See it in the garden** or **Draw another**.

The studio layout:
- **Top bar:** Home on the left, the sprite title with a pencil in the middle (tap to rename), Meta and Finish on the right.
- **Colours** sit above the canvas: the colour picker, your palette (scrolls sideways with arrows), Add and Remove.
- **On the canvas:** the **grid size** at the top left (tap to change it), the **grid lines** toggle at the top right, and the zoom level,
  **+** and **−** stacked at the bottom right (tap the zoom level to fit the canvas to the screen).
- **Tools** (two rows that scroll sideways on a phone, a two-column list on desktop): Pencil, Eraser, Fill, Pick, Line, Rect, Move Ref, Clear,
  Undo, Redo (40 steps). The cursor changes with the tool.
- **Options** are collapsible sections below (phone) or at the right (desktop): **Layers**, **Brush & Shapes** (size 1 to 4, filled rectangles),
  **Reference & Trace**.
- **Layers:** Layer 1 is the **reference image**, Layer 2 is the **drawing**. Each has an eye button. The reference sits under the drawing
  and is never saved into the tile.
- **Reference image:** load one, set opacity and scale, drag it with Move Ref, **Fit**, **Remove**. **Pick** also samples the reference where
  a cell is empty. **Colours from image** adds its main colours to the palette. **Trace to Palette** redraws it using only your palette.
- **Touch:** one finger draws; **two fingers pan** the canvas and **pinch to zoom**. A second finger landing cancels the pixel the first
  finger started, and Fill and Pick act when the finger lifts so a pinch never fills by accident. The rest of the page scrolls normally.
- **Mouse and keys:** `Ctrl` + wheel or `Ctrl +` / `Ctrl -` zooms toward the pointer, `Ctrl 0` fits, middle mouse drag pans.
- Your palette and draft are remembered.

### Keyboard shortcuts
All defaults can be changed in Settings → Shortcuts. They pause while you type in a text field or
while another page is open. `Space` presses a focused button instead of starting the timer.

| Action | Default |
|---|---|
| Start / pause | `Space` |
| Reset | `R` |
| Skip phase | `S` |
| Next timer mode | `M` |
| New mission | `N` |
| Tasks / history | `T` |
| Toggle sound | `X` |
| Open menu | `,` |
| Open garden | `G` |
| Toggle dark mode | `D` |
| Banner library | `B` |

In the Garden: `Ctrl Z` / `Ctrl Y` undo / redo, `Space` + drag pans, `Esc` leaves the world preview first.

Inside the Pixel Creator (Draw step): `P` pencil, `E` eraser, `F` fill, `I` pick, `L` line, `R` rect, `M` move
reference, `G` grid, `[` `]` brush size, `Ctrl Z` / `Ctrl Y` undo / redo.

### Accounts: log in and sign up
The app starts in **guest mode** and works fully without an account. Open **Menu**; the **last item** is
**LOGIN / SIGN UP** (it shows your name once signed in). From there:
- **Log in** with email and password (with "keep me signed in", show/hide password), or continue with **Google** or **GitHub**.
- **Sign up** with a display name, email and a password (live strength meter and rules, confirm field).
- **Forgot password** sends a reset link by email; opening that link shows the **new password** screen.
- **Account** shows who you are and lets you **sign out**. Signing out in one tab signs out the others.

Sessions use a short-lived **JWT access token** kept in memory and an `httpOnly` **refresh cookie** set by your Spring Boot
backend, so a page reload restores the session silently. Progress sync across devices is the next step; for now
everything is still stored on the device. The backend contract, cookie rules, MySQL schema and SMTP flow are in
[`docs/AUTH_API.md`](docs/AUTH_API.md) and the **Backend API reference** below. To try the screens without a backend, run `npm run mock:api` in one terminal and
`npm run dev` in another (the mock prints reset links to its console).

Configuration lives in `.env.local` (see `.env.example`): `VITE_API_BASE_URL`, `VITE_OAUTH_PROVIDERS`, `DEV_API_PROXY`.

### Accessibility and comfort
The interface is built to WCAG 2.2 AA and is checked by an automated axe-core test on the dashboard, garden and Pixel Creator
(desktop and phone, light and dark) with zero violations.
- **Keyboard:** everything works without a mouse. A **Skip to timer controls** link comes first. Dialogs trap focus, move
  focus in when they open and back to the button you used when they close, and `Esc` closes only the top dialog. Shortcut keys
  never steal `Space` from a focused button. Keyboard shortcuts are listed under **Menu → Keyboard shortcuts**.
- **Screen readers:** real headings and landmarks, a tab list for Tasks / History, mission checkboxes as proper buttons with
  names, the calendar as a table with `aria-current` on today, a progress bar and timer with spoken values, and polite
  announcements for timer start, pause and finish, missions added, completed or deleted, and buddy facts.
- **Settings → Accessibility:**
  - **Font:** Pixel (default) or **Readable** (Atkinson Hyperlegible, designed for low vision).
  - **Text size:** Normal, Large or Extra (scales all text without breaking the layout).
  - **Contrast:** Normal or **High** (black and white, thicker borders, no faded text).
  - **Motion:** Auto (follows your device), Reduced or Full. Reduced motion stops animations and keeps the buddy calm.
- **Colours:** accent colours are adjusted automatically in every theme, mode and dark mode so text and buttons keep at least a
  4.5:1 contrast ratio.
- **Touch:** every button, field, slider and swatch is at least 44 × 44 px on touch screens (checked by a test), and mission checkboxes have enlarged hit areas.
- **Focus and announcements:** a page moves focus into itself when it opens; the Pixel Creator keeps focus on the step chip when the step changes and announces "Step 2 of 3: Draw".
- **High contrast mode (Windows forced colours):** selected tools, steps and tiles keep a visible outline.
- **Tool names:** icon buttons always show a small name, and the full name appears on hover, keyboard focus or a long press. The name tooltip is high contrast in every theme.
- **Safer actions:** destructive actions (reset all data, clear the garden, delete a tile, clear the canvas) ask first in an
  in-app dialog with Cancel selected by default.

### Sound
8-bit chimes made with the Web Audio API (no audio files): click, task complete, session end.
Toggle and volume are in Settings → Sound.

## Backend API reference

> **Status:** the app is local-first and sends nothing to a server yet, except the optional sign-in calls. Everything below is the
> contract for the Spring Boot + MySQL service you are building. The app already **produces its data in these shapes and prints them to the
> browser console on every page load** (see [Console output](#console-output-and-debug-helpers)), so you can copy real payloads.
> A dependency-free mock of the auth endpoints lives in `scripts/mock-api.mjs` (`npm run mock:api`).

```
 Browser (React + engine, local-first)            Spring Boot API  (/api/v1)                 MySQL
 ┌──────────────────────────────┐   HTTPS JSON   ┌───────────────────────────┐   JPA   ┌────────────┐
 │ localStorage + IndexedDB     │ ─────────────▶ │ auth · sync · CRUD · files │ ──────▶ │ users, ... │
 │ (source of truth when offline)│ ◀───────────── │ rate limit · validation    │         └────────────┘
 └──────────────────────────────┘                └──────────────┬────────────┘
                                                                └──▶ object storage (banners, buddy sheets)
```

**Design principles**
1. **Guest first.** Every feature works without an account. The API exists for backup and for the same progress on another device.
2. **The browser is the source of truth while offline.** The server stores a copy and resolves conflicts (see [Syncing](#syncing-how-the-pieces-fit)).
3. **One user owns every resource.** The server reads the user from the access token and **ignores any `user` value sent by the client**.
4. **Additive evolution.** New fields may appear in responses at any time; clients ignore unknown fields. Breaking changes ship as `/api/v2`.

**`{{Base Url}}` = `<your backend origin>/api/v1`**, for example `https://api.example.com/api/v1`.
The frontend takes the origin from `VITE_API_BASE_URL` and always adds `/api/v1`.

### Contents
[Conventions](#conventions) ·
[Errors](#errors) ·
[Limits and rate limits](#limits-and-rate-limits) ·
[Endpoint summary](#endpoint-summary) ·
[DTOs](#dtos) ·
[Endpoints](#endpoints) ·
[Syncing](#syncing-how-the-pieces-fit) ·
[MySQL schema](#mysql-schema) ·
[Security checklist](#security-checklist) ·
[Operations](#operations) ·
[Frontend integration plan](#frontend-integration-plan) ·
[Spring Boot checklist](#spring-boot-checklist)

### Conventions

| Topic | Rule |
|---|---|
| Format | JSON in and out, `Content-Type: application/json; charset=utf-8`. File uploads use `multipart/form-data`. |
| Field names | **kebab-case** (`sprite-name`, `create-time-stamp`). Enum values are UPPER_CASE (`GROUND`, `PROPS`). |
| Timestamps | **UTC** strings `YYYY-MM-DD HH:mm:ss` (for example `2038-01-19 03:14:07`). Servers store `TIMESTAMP` in UTC. |
| Colours | Hex **without** `#`, upper case: `RRGGBB` or `RRGGBBAA`. A transparent pixel is `00000000`. |
| Ids | Numeric server ids (`BIGINT`). Browser-made objects also carry a stable `client-id` string so the two sides can be matched (see [Syncing](#syncing-how-the-pieces-fit)). |
| Auth | Protected endpoints need `Authorization: Bearer <accessToken>`. The refresh token lives in an `httpOnly` cookie. Details: [`docs/AUTH_API.md`](docs/AUTH_API.md). |
| Cookies and CORS | Every request is sent with `credentials: "include"` and `X-Requested-With: XMLHttpRequest`. Same-site deployment is preferred (see the auth doc). |
| Request id | Send `X-Request-Id` (UUID) if you like; the server echoes it (or makes one) in the response header and in every error body, and logs it. |
| Idempotency | `POST` requests that create things accept `Idempotency-Key: <uuid>`. Repeating the same key within 24 hours returns the first response instead of creating a duplicate. The sync queue always sends one. |
| Concurrency | Singleton documents (`/settings`, `/garden`, `/progress`) return an `ETag` and accept `If-Match`. A stale `If-Match` gets `412` with the current document so the client can merge. |
| Pagination | List endpoints return a plain JSON array. Optional `?page=0&size=100&sort=update-time-stamp,desc`. Default `size` 100, maximum 500. Totals are in the headers `X-Total-Count`, `X-Page`, `X-Page-Size`. |
| Delta sync | List endpoints accept `?updated-since=YYYY-MM-DD HH:mm:ss` (URL-encoded) and return only newer rows. Deletions are reported by `/progress` (see below). |
| Compression | Honour `Accept-Encoding: gzip`. A full garden is about 64,000 numbers, so compress it. |
| Caching | `GET /sprites/builtin`, `/meta` and image endpoints are cacheable (`Cache-Control: public, max-age=86400` with `ETag`). Everything else: `Cache-Control: no-store`. |
| Unknown input | Reject unknown `sprite-type`, `scheme`, etc. with `422`. Ignore unknown extra fields. |

### Errors
One shape everywhere:

```json
{
  "status": 422,
  "code": "VALIDATION_FAILED",
  "message": "Please check the highlighted fields.",
  "errors": { "sprite-name": "Use 1 to 24 characters." },
  "request-id": "5c1f6b7e-2c1d-4c8e-9f0a-61b3a3f3b1de"
}
```
`message` is safe to show to people. `errors` is optional and maps a field name to a message. `code` is for programs.

| Status | `code` | When |
|---|---|---|
| 400 | `BAD_REQUEST` | Malformed JSON, wrong types, bad query string |
| 401 | `UNAUTHENTICATED` | Missing, invalid or expired access token (the client refreshes once, then asks the person to sign in) |
| 401 | `BAD_CREDENTIALS` | Login failed. Same message for an unknown email and a wrong password |
| 403 | `FORBIDDEN` | Valid token but not allowed (for example writing a built-in sprite) |
| 404 | `NOT_FOUND` | Unknown id, or an id that belongs to someone else (never reveal which) |
| 409 | `EMAIL_TAKEN`, `CONFLICT` | Duplicate email, duplicate `client-id`, name clash |
| 412 | `PRECONDITION_FAILED` | `If-Match` does not match. Body includes `"current": { ... }` |
| 413 | `PAYLOAD_TOO_LARGE` | Body or upload over the limit |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Upload is not a supported image |
| 422 | `VALIDATION_FAILED` | Field rules broken (see [Limits](#limits-and-rate-limits)) |
| 429 | `RATE_LIMITED` | Too many requests. Always send `Retry-After` (seconds) |
| 5xx | `INTERNAL`, `UNAVAILABLE` | Server problem. Never leak stack traces or SQL |

### Limits and rate limits

`GET /meta` returns these numbers so the client can use the server's values instead of hard-coding them.

| Item | Limit |
|---|---|
| Sprite width and height | 1 to 256 pixels each |
| Sprite name / category / section | 1 to 24 / 1 to 14 (upper case) / 1 to 24 characters |
| Custom sprites per user | 2,000 (configurable) |
| Garden size | `128 x 256` tiles, 2 layers (fixed in v1), `tile-size` 16 |
| Task title / tasks per user | 1 to 80 characters / 2,000 |
| Banner upload | PNG, JPEG, GIF, WEBP, up to 15 MB, up to 8,000 x 8,000 px, 24 banners per user |
| Buddy sprite sheet | PNG, up to 4 MB, up to 4,096 x 4,096 px, `cols` and `rows` 1 to 32 |
| Settings document | 16 KB |
| JSON body (`/progress`, batches) | 8 MB uncompressed |
| Password | 8 to 72 characters, one lower case, one upper case, one digit |

| Endpoint group | Rate limit (per minute unless noted) |
|---|---|
| `POST /auth/login` | 10 per IP and 5 per email |
| `POST /auth/signup` | 5 per IP per hour |
| `POST /auth/forgot-password`, `/auth/reset-password` | 5 per IP and 3 per email per hour |
| `POST /auth/refresh` | 30 per user |
| Uploads (`/banners`, `/buddy/custom`) | 20 per user per hour |
| Everything else (authenticated) | 120 per user |
| Public (`/health`, `/meta`, `/sprites/builtin`) | 60 per IP |

Send `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` on every response and `Retry-After` on `429`.

### Endpoint summary

Phase **MVP** is what the app needs to sign in and keep progress. **Next** adds the rest of the features that are local today.
**Later** is not called by the app yet.

| Area | Method and path | Auth | Purpose | Phase |
|---|---|---|---|---|
| Meta | `GET /health` | no | Liveness and readiness | MVP |
| Meta | `GET /meta` | no | Version, limits, enabled OAuth providers | MVP |
| Auth | `POST /auth/signup` `login` `refresh` `logout` | see doc | Account and session | MVP |
| Auth | `POST /auth/forgot-password` `reset-password` | no | Password reset by email | MVP |
| Auth | `GET /auth/oauth2/authorization/{provider}` | no | Google or GitHub sign-in | MVP |
| Auth | `GET /auth/me` | bearer | Current user | MVP |
| Auth | `POST /auth/change-password` | bearer | Change password while signed in | Next |
| Auth | `GET /auth/sessions`, `DELETE /auth/sessions/{id}`, `POST /auth/logout-all` | bearer | See and revoke devices | Later |
| Users | `GET` `PUT` `DELETE /users/me` | bearer | Profile and account deletion | MVP |
| Progress | `GET` `PUT /progress` | bearer | Restore or save everything in one call, delta sync | MVP |
| Sprites | `GET /sprites`, `/sprites/{id}`, `/sprites/builtin`, `/sprites/categories` | bearer / public | Read tiles | MVP |
| Sprites | `POST /sprites`, `/sprites/batch`; `PUT` `PATCH` `DELETE /sprites/{id}` | bearer | Create and edit tiles | MVP |
| Sprites | `GET /sprites/{id}/image` | bearer / public | Render a tile as PNG | Next |
| Garden | `GET` `PUT` `DELETE /garden`, `PATCH /garden/cells` | bearer | The garden grid | MVP |
| Tasks | `GET` `POST` `PUT` `PATCH` `DELETE /tasks`, `/tasks/batch`, `/tasks/order` | bearer | Missions and history | MVP |
| Settings | `GET` `PUT` `PATCH /settings` | bearer | Timers, theme, sound, accessibility, shortcuts, buddy | Next |
| Banners | `GET` `POST /banners`, `DELETE /banners/{id}`, `GET /banners/{id}/image` | bearer | Banner library | Next |
| Buddy | `GET` `PUT` `DELETE /buddy/custom` | bearer | Custom buddy sprite sheet | Next |
| Export | `GET /export`, `POST /import` | bearer | Download or restore all data as JSON | Next |
| Sessions | `POST /sessions`, `GET /stats` | bearer | Focus history and streaks | Later |

### DTOs

#### Sprite
A sprite is a small pixel image. Everything that creates or changes a tile in the app is a sprite in this format:
**Pixel Creator drawings, uploaded tiles, tiles cut from an imported sprite sheet, and edits** (rotate, flip, crop, rename,
re-categorise).

```json
{
  "id": 1001,
  "client-id": "cmgx3k1a9f2q",
  "sprite-name": "Sprite Name",
  "sprite-category": "CUSTOMS",
  "sprite-section": null,
  "sprite-type": "PROPS",
  "data": [
    ["FF0011", "FF1122", "FF2233", "FF3344"],
    ["FF0001", "FF1102", "FF2203", "00000000"],
    ["FF0101", "FF0202", "FF030380", "FF0404"],
    ["FF0111", "FF0212", "FF0313", "FF0414"]
  ],
  "canvas-size-x": 4,
  "canvas-size-y": 4,
  "user": 1,
  "create-time-stamp": "2038-01-19 03:14:07",
  "update-time-stamp": "2038-01-19 03:14:07"
}
```

| Field | Type | Notes |
|---|---|---|
| `id` | number or null | Sprite id used by garden layers. Built-in sprites are `1..999`, user sprites start at `1000` (see "Ids and syncing"). |
| `client-id` | string | Stable id created in the browser (`c...`; `builtin-N` for built-ins). Used to map local sprites to server ids. |
| `sprite-name` | string, 1 to 24 chars | Display name. |
| `sprite-category` | string, up to 14 chars, upper case | Dock tab. Built-ins: `GROUND`, `PROPS`, `NATURE`, `DUNGEON`. Default for new sprites: `CUSTOMS`. Free text otherwise. |
| `sprite-section` | string or null, up to 24 chars | Optional sub-group inside a category. The built-in `DUNGEON` category uses `WALLS & FLOOR`, `CRACKS & DECOR`, `OBJECTS`, `DOORS, LEVER & CHEST`, `FIRE`. |
| `sprite-type` | `GROUND`, `PROPS` or `OBJECTS` | `GROUND`: flat, drawn under everything, snaps to the grid. `PROPS`: snaps to the grid at its own size, drawn above ground. `OBJECTS`: anchored bottom-centre on the clicked cell (trees, bushes). |
| `data` | string[][] | Rows top to bottom, pixels left to right. See pixel format. |
| `canvas-size-x` | integer, 1 to 256 | Width = length of every row in `data`. |
| `canvas-size-y` | integer, 1 to 256 | Height = number of rows in `data`. |
| `user` | number or null | Owner. `null` for built-in (system) sprites. |
| `system` | boolean, optional | `true` for built-in sprites (read only). |
| `create-time-stamp`, `update-time-stamp` | string | UTC. |

**Pixel format:** `"RRGGBB"` is an opaque pixel, `"RRGGBBAA"` is translucent, and a fully transparent pixel is `"00000000"`.
Upper-case hex.

#### Garden
One garden per user: a **128 x 256** grid of tiles (`canvas-size-x` = columns, `canvas-size-y` = rows), two layers deep.
The plain grass ground is implicit and is not stored.

```json
{
  "id": null,
  "layer-1": [
    [1, 2, 1, 1, 1, 1, 2, 1, 2, 1],
    [1, 2, 1, 1, 1, 1, 2, 1, 2, 1]
  ],
  "layer-2": [
    [0, 0, 1005, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ],
  "version": 7,
  "canvas-size-x": 10,
  "canvas-size-y": 2,
  "tile-size": 16,
  "user": 1,
  "create-time-stamp": "2038-01-19 03:14:07",
  "update-time-stamp": "2038-01-19 03:14:07"
}
```
(Shortened for the docs. The real garden has 256 rows of 128 numbers in each layer.)

| Field | Notes |
|---|---|
| `layer-1`, `layer-2` | `canvas-size-y` rows, each with `canvas-size-x` integers. Each integer is a **sprite id** (`0` = empty). `layer-1` is the first thing placed on a tile, `layer-2` is stacked on top. A tile can never have more than two layers. If `layer-1` is `0`, `layer-2` is `0` too. |
| `version` | Integer, starts at 1 and goes up on every write. Same value as the `ETag`. Used for `If-Match` and `PATCH /garden/cells`. |
| `tile-size` | Pixels per tile (16). Sprites are drawn at their own pixel size, so a 32 x 32 sprite covers 2 x 2 tiles. |

Rows run top to bottom and columns left to right. Every id must be a built-in sprite or one of the user's sprites.

#### Task
```json
{
  "id": 12,
  "client-id": "1760193081234.567",
  "title": "Write docs",
  "completed": true,
  "completed-time-stamp": "2038-01-19 03:14:07",
  "sort-order": 0,
  "user": 1,
  "create-time-stamp": "2038-01-19 03:00:00",
  "update-time-stamp": "2038-01-19 03:14:07"
}
```
`title` is 1 to 80 characters. `completed-time-stamp` is `null` until the task is completed. `sort-order` is the position in the
list (0 first). The History tab is built from `completed-time-stamp`.

#### User
```json
{
  "id": 1,
  "name": "Ash",
  "email": "ash@example.com",
  "provider": "LOCAL",
  "create-time-stamp": "2038-01-19 03:14:07",
  "update-time-stamp": "2038-01-19 03:14:07"
}
```
`provider` is `LOCAL`, `GOOGLE` or `GITHUB`. `name` is 2 to 40 characters. The password hash is never returned.
A guest has no user (`user: null` on everything).

#### Settings
Everything under **Settings** and the theme/dark-mode switches, as one document per user. Maps one to one to what the app keeps in `localStorage`
(`focusquest`). Missing keys mean "use the default".

```json
{
  "timer": {
    "mode": "POMODORO",
    "durations": {
      "POMODORO": { "focus": 25, "break": 5 },
      "R52_17":   { "focus": 52, "break": 17 },
      "ULTRADIAN": { "focus": 90, "break": 20 },
      "TIMEBOX":  { "focus": 60, "break": 10 },
      "CUSTOM":   { "focus": 30, "break": 10 }
    },
    "auto-cycle": false
  },
  "sound": { "enabled": true, "volume": 60 },
  "appearance": { "theme": "LEAF", "scheme": "LIGHT" },
  "accessibility": { "font": "PIXEL", "text-size": "NORMAL", "contrast": "NORMAL", "motion": "AUTO" },
  "buddy": { "id": "cat3", "talk": { "enabled": true, "mode": "BOTH" } },
  "shortcuts": {
    "enabled": true,
    "keys": { "play": " ", "reset": "r", "skip": "s", "mode": "m", "task": "n", "tabs": "t", "sound": "x", "menu": ",", "garden": "g", "banner": "b", "dark": "d" }
  },
  "banner": { "active": "default" },
  "pip": { "size": "NORMAL" },
  "update-time-stamp": "2038-01-19 03:14:07"
}
```

| Field | Allowed values |
|---|---|
| `timer.mode` | `POMODORO`, `R52_17`, `ULTRADIAN`, `TIMEBOX`, `CUSTOM` (the app keeps them as `pomo`, `r52`, `u90`, `tbx`, `cus`) |
| `timer.durations.*.focus` / `.break` | integer minutes, 1 to 600 |
| `sound.volume` | integer 0 to 100 |
| `appearance.theme` | `LEAF`, `BERRY` |
| `appearance.scheme` | `LIGHT`, `DARK`, `AUTO` |
| `accessibility.font` | `PIXEL`, `READABLE` |
| `accessibility.text-size` | `NORMAL`, `LARGE`, `EXTRA` |
| `accessibility.contrast` | `NORMAL`, `HIGH` |
| `accessibility.motion` | `AUTO`, `REDUCED`, `FULL` |
| `buddy.id` | built-in buddy id (`cat1` to `cat4`, `sg0` to `sg31`) or `custom` |
| `buddy.talk.mode` | `BOTH`, `FACTS`, `JOKES` |
| `shortcuts.keys.*` | a single key, or `" "` for Space; each action's key must be unique |
| `banner.active` | `default` or a Banner `id` that belongs to the user |
| `pip.size` | `EXTRA_SMALL`, `NORMAL` |

Not stored on the server: the garden zoom level, the pixel-creator draft and palette (device-specific scratch data).

#### Banner
```json
{
  "id": 5,
  "client-id": "b1760193081234",
  "name": "forest.png",
  "content-type": "image/png",
  "size-bytes": 482113,
  "width": 1500,
  "height": 500,
  "url": "/api/v1/banners/5/image",
  "user": 1,
  "create-time-stamp": "2038-01-19 03:14:07"
}
```
The app always shows banners in a 3:1 frame and crops, so the original is stored untouched. At most 24 per user; adding a 25th
deletes the oldest. `url` is relative to the origin and needs the bearer token (or return a short-lived signed URL).

#### Buddy sprite sheet (custom)
```json
{
  "name": "MINE",
  "cols": 4,
  "rows": 3,
  "face": 1,
  "walk": [0, 1, 2, 3],
  "idle": [4],
  "sleep": [8, 9],
  "jump": [5, 6],
  "url": "/api/v1/buddy/custom/image",
  "update-time-stamp": "2038-01-19 03:14:07"
}
```
`face` is `1` if the artwork faces right and `-1` if it faces left. Frame lists are zero-based cell indexes (row by row). `cols x rows`
must divide the image evenly.

#### Progress bundle
```json
{
  "user": { "id": 1, "name": "Ash", "email": "ash@example.com", "provider": "LOCAL", "create-time-stamp": "...", "update-time-stamp": "..." },
  "settings": { "...": "Settings DTO" },
  "sprites": [ { "...": "Sprite DTO" } ],
  "garden": { "...": "Garden DTO" },
  "tasks": [ { "...": "Task DTO" } ],
  "banners": [ { "...": "Banner DTO (metadata only)" } ],
  "buddy": null,
  "deleted": { "sprites": [1007], "tasks": [31, 32], "banners": [] },
  "server-time": "2038-01-19 03:14:07"
}
```
`deleted` lists ids removed since `?updated-since=` (empty on a full fetch). Use `server-time` as the next `updated-since`.

#### Meta
```json
{
  "version": "1.0.0",
  "min-client-version": "1.0.0",
  "oauth-providers": ["google", "github"],
  "limits": { "sprite-max-size": 256, "banner-max-bytes": 15000000, "banners-per-user": 24, "tasks-per-user": 2000 }
}
```

### Endpoints
All paths are relative to `{{Base Url}}`. "Own" means the row must belong to the signed-in user, otherwise `404`.

#### Health and meta

| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/health` | no | `200 { "status": "UP" }` (readiness also checks the database; `503` when down) |
| GET | `/meta` | no | `200` Meta DTO. Cacheable for a few minutes |

#### Auth
Full detail, cookies, JWT, OAuth, SMTP and the MySQL tables are in [`docs/AUTH_API.md`](docs/AUTH_API.md).

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| POST | `/auth/signup` | no | `{ name, email, password }` | `201 { accessToken, expiresIn, user }` + refresh cookie. `409 EMAIL_TAKEN`, `422` |
| POST | `/auth/login` | no | `{ email, password, remember }` | `200 { accessToken, expiresIn, user }` + refresh cookie. `401 BAD_CREDENTIALS`, `429` |
| POST | `/auth/refresh` | cookie | none | `200 { accessToken, expiresIn, user }`, rotated cookie. `401` clears the cookie |
| POST | `/auth/logout` | cookie | none | `204`, token revoked, cookie cleared |
| GET | `/auth/me` | bearer | none | `200` User DTO |
| POST | `/auth/forgot-password` | no | `{ email }` | `202` always (sends the SMTP email) |
| POST | `/auth/reset-password` | no | `{ token, password }` | `204`, every session revoked. `400` for a bad or expired token |
| GET | `/auth/oauth2/authorization/{provider}` | no | browser redirect | Redirects to the provider, then to `<app>/?auth=success` |
| POST | `/auth/change-password` | bearer | `{ "current-password", "new-password" }` | `204`, other sessions revoked. `401 BAD_CREDENTIALS`, `422` (Next) |
| GET | `/auth/sessions` | bearer | none | `200 [ { id, "user-agent", "create-time-stamp", "last-used-time-stamp", current } ]` (Later) |
| DELETE | `/auth/sessions/{id}` | bearer | none | `204` (Later) |
| POST | `/auth/logout-all` | bearer | none | `204`, revokes every refresh token of the user (Later) |

#### Users

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/users/me` | none | `200` User DTO |
| PUT | `/users/me` | `{ "name": "Ash" }` | `200` User DTO. `422` if the name is not 2 to 40 characters |
| DELETE | `/users/me` | `{ "password": "..." }` (omit for OAuth-only accounts, which confirm with a fresh sign-in) | `204`. Deletes the account and **all** its data and files, then clears the cookie |

#### Progress bundle (restore or save everything in one call)

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/progress` | optional `?updated-since=` and `?include=settings,sprites,garden,tasks,banners,buddy` | `200` Progress DTO. `ETag` covers the whole bundle |
| PUT | `/progress` | `{ "settings": {...}, "sprites": [...], "garden": {...}, "tasks": [...] }` (any subset). Optional `If-Match` | `200` Progress DTO plus `"id-map": { "sprites": { "<client-id>": <id> }, "tasks": { ... } }`. `412` on a stale `If-Match` |

`PUT /progress` runs in **one transaction**: it upserts sprites (matching by `client-id`), rewrites the garden grid with the new sprite ids,
upserts tasks, then settings. It either fully succeeds or changes nothing. Banners and the buddy sheet are files, so they use their own
endpoints and are not part of `PUT`.

#### Sprites

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/sprites` | optional `?category=&type=&updated-since=&page=&size=` | `200` array of the user's Sprite DTOs |
| GET | `/sprites/builtin` | none (public, cacheable) | `200` array of system Sprite DTOs (ids 1 to 699). Seed data: `docs/seed/builtin-sprites.json` |
| GET | `/sprites/categories` | none | `200 [ { "name": "DUNGEON", "system": true, "count": 612, "sections": ["WALLS & FLOOR", "..."] } ]` (built-in and the user's own, for the garden dock tabs) |
| GET | `/sprites/{id}` | none | `200` Sprite DTO (own or built-in) |
| GET | `/sprites/{id}/image` | optional `?scale=1..16` | `200 image/png`, nearest-neighbour scaled, cacheable (Next) |
| POST | `/sprites` | Sprite DTO without `id` | `201` Sprite DTO with the new `id`. `409` if `client-id` already exists (return the existing one when `Idempotency-Key` matches) |
| POST | `/sprites/batch` | `{ "sprites": [Sprite DTO] }` (max 200) | `200 { "sprites": [...], "id-map": { "<client-id>": <id> } }` |
| PUT | `/sprites/{id}` | Sprite DTO | `200` Sprite DTO (`update-time-stamp` set by the server). `403` for a built-in sprite |
| PATCH | `/sprites/{id}` | any of `{ "sprite-name", "sprite-category", "sprite-section", "sprite-type" }` | `200` Sprite DTO. Cheap rename and re-categorise without resending pixels |
| DELETE | `/sprites/{id}` | none | `204`. Garden cells that used it become `0` in the same transaction, and the id is added to `deleted` for delta sync |

Validation: matrix is rectangular and equals `canvas-size-x` by `canvas-size-y`; every pixel matches `^[0-9A-F]{6}([0-9A-F]{2})?$`;
name, category and section lengths; the user is under their sprite quota.

```bash
curl -X POST "$BASE/sprites" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -H "Idempotency-Key: $(uuidgen)" \
  -d '{"client-id":"cmgx3k1a9f2q","sprite-name":"Torch","sprite-category":"CUSTOMS","sprite-type":"PROPS",
       "data":[["FF0011","00000000"],["FF0001","FF1102"]],"canvas-size-x":2,"canvas-size-y":2}'
```

#### Garden endpoints

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/garden` | none | `200` Garden DTO with `ETag`, or `404` if the user has none yet |
| PUT | `/garden` | Garden DTO. Optional `If-Match` | `200` Garden DTO (creates or replaces, bumps `version`). `412` on a stale `If-Match` |
| PATCH | `/garden/cells` | `{ "base-version": 12, "changes": [ { "x": 3, "y": 5, "layer-1": 12, "layer-2": 0 } ] }` (max 5,000 changes) | `200 { "version": 13, "update-time-stamp": "..." }`. `409 CONFLICT` with the current `version` if `base-version` is behind |
| DELETE | `/garden` | none | `204` |

`PATCH /garden/cells` exists so a few painted tiles do not need a 200 KB upload. One entry per changed cell; send the **final** state of
that cell (both layers). The rules still apply: `layer-2` must be `0` when `layer-1` is `0`, and every id must be a built-in sprite or one of
the user's sprites (`422` otherwise).

#### Tasks

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/tasks` | optional `?completed=true` or `false`, `from=&to=&updated-since=&page=&size=` | `200` array ordered by `sort-order`. With `completed=true` it is the History tab, ordered by `completed-time-stamp` descending |
| POST | `/tasks` | Task DTO without `id` | `201` Task DTO |
| POST | `/tasks/batch` | `{ "tasks": [Task DTO] }` (max 200) | `200 { "tasks": [...], "id-map": { "<client-id>": <id> } }` |
| PUT | `/tasks/{id}` | Task DTO | `200` Task DTO |
| PATCH | `/tasks/{id}` | `{ "title": "...", "completed": true }` (either) | `200` Task DTO. Completing sets `completed-time-stamp`, un-completing clears it |
| PUT | `/tasks/order` | `{ "ids": [12, 9, 31] }` (the full list of open task ids in the new order) | `204`. Rewrites `sort-order` |
| DELETE | `/tasks/{id}` | none | `204` |
| DELETE | `/tasks` | `?completed=true` (required, protects against deleting everything by accident) | `204`. Clears finished missions |

#### Settings endpoints

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/settings` | none | `200` Settings DTO with `ETag`. A new user gets the defaults, never `404` |
| PUT | `/settings` | Settings DTO. Optional `If-Match` | `200` Settings DTO |
| PATCH | `/settings` | JSON merge patch, for example `{ "appearance": { "scheme": "DARK" } }` | `200` Settings DTO. `null` resets a key to its default |

Validate every enum and range in the Settings table above and reject duplicate shortcut keys with `422`.
`banner.active` must be `default` or one of the user's banner ids.

#### Banners

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/banners` | none | `200` array of Banner DTOs, newest first |
| POST | `/banners` | `multipart/form-data`: `file` (required), `name` (optional), `client-id` (optional) | `201` Banner DTO. `413`, `415`, `422`. Deletes the oldest when the user already has 24 |
| GET | `/banners/{id}/image` | none | `200` the image with its `Content-Type`, `ETag`, `Cache-Control: private, max-age=86400` |
| DELETE | `/banners/{id}` | none | `204`. If it was `banner.active`, the server sets it back to `default` |

#### Buddy (custom sprite sheet)

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/buddy/custom` | none | `200` Buddy DTO, or `404` if none |
| PUT | `/buddy/custom` | `multipart/form-data`: `file` (PNG) and `meta` (JSON of `name`, `cols`, `rows`, `face`, `walk`, `idle`, `sleep`, `jump`) | `200` Buddy DTO. `422` if `cols` x `rows` does not divide the image or a frame index is out of range |
| GET | `/buddy/custom/image` | none | `200 image/png`, `ETag` |
| DELETE | `/buddy/custom` | none | `204`. If `buddy.id` was `custom`, the server resets it to `cat3` |

#### Export and import

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/export` | none | `200 application/json` with `Content-Disposition: attachment; filename="pixel-space-export.json"`. The Progress DTO with banner and buddy images embedded as `data:` URLs |
| POST | `/import` | the same JSON. `?mode=merge` (default) or `replace` | `200` Progress DTO plus `id-map`. `merge` keeps the newer `update-time-stamp` per item; `replace` wipes first. Same size limits as `PUT /progress` |

#### Sessions and stats (Later, not called by the app yet)

| Method | Path | Request | Response |
|---|---|---|---|
| POST | `/sessions` | `{ "client-id": "...", "mode": "POMODORO", "phase": "FOCUS", "planned-minutes": 25, "actual-minutes": 25, "started-time-stamp": "...", "completed": true, "task": 12 }` | `201` Session DTO |
| GET | `/sessions` | `?from=&to=&page=&size=` | `200` array |
| GET | `/stats` | `?from=&to=&group=day` or `week` | `200 { "focus-minutes": 640, "sessions": 28, "streak-days": 5, "by-day": [ { "date": "2038-01-19", "focus-minutes": 75 } ] }` |

### Syncing (how the pieces fit)

**Ids.** Built-in sprites have ids `1` to `699` and are the same for everyone (`user: null`). Reserve `1..999` for system sprites
(for example `ALTER TABLE sprites AUTO_INCREMENT = 1000`). Custom sprites are numbered `1001, 1002, ...` inside the browser until the
server assigns real ids; the garden grid already uses those numbers, so the server must **rewrite garden ids using the `id-map`**.

**First sign-in on a device** (guest data exists locally):
1. Ask the person: *keep this device's data*, *use the data from my account*, or *merge* (default).
2. `GET /progress`. If the account is empty, `PUT /progress` with the local data and store the returned `id-map` and `ETag`.
3. If both sides have data and the person chose **merge**: sprites match by `client-id` (newer `update-time-stamp` wins), tasks by `client-id`,
   garden by `version` (the higher wins; if both changed, ask which one to keep, since cells cannot be merged safely), settings by `update-time-stamp`.

**Staying in sync** (signed in):
- Changes are written locally first, then queued in an **outbox** (IndexedDB) and sent in the background: sprites and tasks with their
  `POST`/`PATCH`/`DELETE`, garden strokes with `PATCH /garden/cells` (debounced, about 2 seconds after the last stroke), settings with `PATCH /settings`.
- Every queued request has an `Idempotency-Key`, so retrying after a lost connection never duplicates anything. Retry with exponential backoff
  (1, 2, 4 ... 60 s) on network errors, `429` (honour `Retry-After`) and `5xx`. Drop and report on other `4xx`.
- On start, focus and reconnect call `GET /progress?updated-since=<last server-time>`. Apply changed rows and the `deleted` ids.
- Conflicts: **last write wins per item** using `update-time-stamp`, except the garden (`version` + `409`) and `If-Match` documents (`412`). On
  `409` or `412`, fetch the current document, re-apply the local change on top if it still makes sense, otherwise show *"This changed on another device"* with **Keep mine** / **Use theirs**.
- Deleting a sprite that another device still uses is safe: the server turns those cells to `0` and reports the id in `deleted`.

**Server-side checks to apply everywhere:** matrix sizes match `canvas-size-*` and stay within 1 to 256, hex strings are valid, garden ids exist and
are visible to the user, string lengths, quotas, and body size limits (a full garden is about 32,000 numbers per layer).

### MySQL schema

The auth tables (`users`, `oauth_accounts`, `refresh_tokens`, `password_reset_tokens`) are in [`docs/AUTH_API.md`](docs/AUTH_API.md).
Use **Flyway** migrations. Soft delete (`deleted_at`) on sprites, tasks and banners is what makes delta sync possible; purge rows older than 90 days.

<details>
<summary>Tables for sprites, garden, tasks, settings, banners, buddy, sessions</summary>

```sql
CREATE TABLE sprites (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,           -- start at 1000; 1..999 are system sprites
  user_id       BIGINT NULL,                                 -- NULL = built-in
  client_id     VARCHAR(40) NULL,
  name          VARCHAR(24)  NOT NULL,
  category      VARCHAR(14)  NOT NULL,
  section       VARCHAR(24)  NULL,                           -- sub-group inside a category (the DUNGEON sections)
  type          ENUM('GROUND','PROPS','OBJECTS') NOT NULL,
  canvas_size_x SMALLINT UNSIGNED NOT NULL,
  canvas_size_y SMALLINT UNSIGNED NOT NULL,
  data          JSON NOT NULL,                               -- or a compressed BLOB of RGBA bytes
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    TIMESTAMP NULL,
  INDEX idx_sprites_user_updated (user_id, updated_at),
  UNIQUE KEY uq_sprites_client (user_id, client_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE gardens (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT NOT NULL UNIQUE,
  version       INT NOT NULL DEFAULT 1,                      -- bumped on every write; powers ETag and 409
  canvas_size_x SMALLINT UNSIGNED NOT NULL DEFAULT 128,
  canvas_size_y SMALLINT UNSIGNED NOT NULL DEFAULT 256,
  tile_size     SMALLINT UNSIGNED NOT NULL DEFAULT 16,
  layer_1       MEDIUMBLOB NOT NULL,                         -- gzip of a flat array of sprite ids (uint32, row-major); or JSON
  layer_2       MEDIUMBLOB NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tasks (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT NOT NULL,
  client_id     VARCHAR(40) NULL,
  title         VARCHAR(80) NOT NULL,
  completed     TINYINT(1) NOT NULL DEFAULT 0,
  completed_at  TIMESTAMP NULL,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    TIMESTAMP NULL,
  INDEX idx_tasks_user_updated (user_id, updated_at),
  INDEX idx_tasks_user_completed (user_id, completed, completed_at),
  UNIQUE KEY uq_tasks_client (user_id, client_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE user_settings (
  user_id     BIGINT PRIMARY KEY,
  data        JSON NOT NULL,                                 -- the Settings DTO without update-time-stamp
  version     INT NOT NULL DEFAULT 1,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE banners (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT NOT NULL,
  client_id     VARCHAR(40) NULL,
  name          VARCHAR(120) NOT NULL,
  content_type  VARCHAR(40) NOT NULL,
  size_bytes    INT UNSIGNED NOT NULL,
  width         SMALLINT UNSIGNED NOT NULL,
  height        SMALLINT UNSIGNED NOT NULL,
  storage_key   VARCHAR(200) NOT NULL,                       -- object storage key or file path (or MEDIUMBLOB column)
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at    TIMESTAMP NULL,
  INDEX idx_banners_user (user_id, created_at),
  UNIQUE KEY uq_banners_client (user_id, client_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE buddy_sheets (
  user_id     BIGINT PRIMARY KEY,
  name        VARCHAR(24) NOT NULL,
  cols        TINYINT UNSIGNED NOT NULL,
  `rows`      TINYINT UNSIGNED NOT NULL,
  face        TINYINT NOT NULL DEFAULT -1,                   -- -1 faces left, 1 faces right
  frames      JSON NOT NULL,                                 -- { walk, idle, sleep, jump }
  storage_key VARCHAR(200) NOT NULL,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE idempotency_keys (                              -- or keep these in Redis with a 24 hour TTL
  user_id    BIGINT NOT NULL,
  idem_key   CHAR(36) NOT NULL,
  request_hash CHAR(64) NOT NULL,
  status     SMALLINT NOT NULL,
  response   MEDIUMBLOB NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, idem_key)
);

CREATE TABLE focus_sessions (                                -- Later
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id      BIGINT NOT NULL,
  client_id    VARCHAR(40) NULL,
  mode         VARCHAR(12) NOT NULL,
  phase        ENUM('FOCUS','BREAK') NOT NULL,
  planned_min  SMALLINT UNSIGNED NOT NULL,
  actual_min   SMALLINT UNSIGNED NOT NULL,
  completed    TINYINT(1) NOT NULL,
  task_id      BIGINT NULL,
  started_at   TIMESTAMP NOT NULL,
  INDEX idx_sessions_user_started (user_id, started_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```
</details>

### Security checklist
- **Tokens:** access token (10 to 15 minutes) in memory only; refresh token in an `httpOnly`, `Secure`, `SameSite` cookie, rotated on every use with reuse detection ([auth doc](docs/AUTH_API.md)).
- **Authorisation on every row:** look rows up by `(id, user_id)`. A row that belongs to someone else is a `404`, never a `403`.
- **Input:** validate with Bean Validation on DTOs, plus the checks above. Use parameterised queries only (JPA or `?` placeholders). Reject oversized bodies early (`server.tomcat.max-swallow-size`, `spring.servlet.multipart.max-file-size`).
- **Uploads (banners, buddy sheets):** check the file's magic bytes, not the extension or `Content-Type`; decode and re-encode the image (this strips EXIF and any payload hidden in metadata); cap pixel dimensions to prevent decompression bombs; store under random keys; serve with `X-Content-Type-Options: nosniff` and a fixed `Content-Type`. Prefer a separate cookie-less domain for user images.
- **Headers:** `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Cache-Control: no-store` on API JSON. Exact-origin CORS allow-list with credentials; never `*`.
- **Abuse:** rate limits above, per-account quotas, and `429` with `Retry-After`. Generic messages for login and password reset (no account enumeration). Add a short delay or CAPTCHA after repeated failures if abused.
- **Secrets:** JWT signing key, SMTP and OAuth secrets come from environment variables or a secret manager. Never log tokens, passwords, reset links or full request bodies.
- **Privacy:** `GET /export` and `DELETE /users/me` must work for every user (data export and erasure). Delete files in object storage together with the rows. Keep backups encrypted and expire deleted data from them within your retention window.
- **Dependencies:** run a dependency scanner (Dependabot or OWASP Dependency-Check) and keep Spring Boot patched.

### Operations
- **Observability:** JSON logs with `request-id`, `user-id` (hash it if you prefer), route, status and latency. Actuator `/health` and Prometheus metrics (requests, p95 latency, rate-limit hits, sync conflicts `409`/`412`, upload failures).
- **Docs for developers:** generate an OpenAPI 3.1 document with `springdoc-openapi` at `/api/v1/docs` and publish it from CI, then keep the tables above as the human-readable summary.
- **Versioning:** `/api/v1` is stable. Add fields freely; remove or change meaning only in `/api/v2`, announced with `Deprecation` and `Sunset` headers at least 90 days ahead. The `min-client-version` in `/meta` lets you force an update for a broken old client.
- **Database:** Flyway migrations, a scheduled job that purges expired tokens, idempotency keys and soft-deleted rows, and nightly backups with a tested restore.
- **Testing:** contract tests against the DTO shapes (the app prints real examples in the console), integration tests with Testcontainers (MySQL), and the mock server for frontend work.
- **Environments:** `VITE_API_BASE_URL` (frontend), and on the backend `APP_URL`, `CORS_ALLOWED_ORIGINS`, database and mail settings, JWT secret, OAuth client ids. Local development proxies `/api` through Vite (`DEV_API_PROXY`).

### Frontend integration plan
The engine (`src/engine/app.js`) is imperative and owns all state today. The sync layer should sit **beside** it so the offline experience never depends on the network.

```
src/api/
  http.js         fetch wrapper: base URL, credentials, bearer token, refresh once on 401, X-Request-Id, Idempotency-Key, error normalisation
  repositories/   sprites.js tasks.js garden.js settings.js banners.js buddy.js   (thin typed calls that mirror the endpoints)
  sync/outbox.js  IndexedDB queue: { id, method, path, body, idempotencyKey, attempts, nextTry }
  sync/engine.js  push (drain outbox), pull (GET /progress?updated-since), conflict handling, status ("synced", "syncing", "offline", "needs attention")
```

Rules for whoever builds it:
1. **Write locally first, always.** The UI never waits for the network; a sync indicator (icon plus text, not colour alone) shows the state.
2. **One place makes HTTP calls** (`http.js`). It normalises every failure into `{ status, code, message, errors }` so screens show `message` and put `errors.<field>` under the right input, exactly like the login screen does today.
3. **The engine emits events** (`sprite:saved`, `garden:changed`, `task:changed`, `settings:changed`). The sync layer listens; the engine does not import it.
4. **Never block sign-in on sync.** If the first pull fails, keep working locally and retry.
5. **Test with the mock server** (`npm run mock:api`), extended with the endpoints above, and with Playwright (`npm run test:e2e`).

### Spring Boot checklist
- Dependencies: `web`, `security`, `oauth2-client`, `data-jpa`, `mysql-connector-j`, `mail`, `validation`, a JWT library (`jjwt` or Nimbus),
  Flyway, Bucket4j (rate limiting), `springdoc-openapi`, and an image library for upload checks (`javax.imageio` is enough for PNG, JPEG and GIF; add a WEBP plugin if you accept WEBP).
- Packages by feature (`auth`, `sprite`, `garden`, `task`, `settings`, `banner`, `buddy`, `progress`), each with controller, service, repository, DTO and mapper. Map DTO kebab-case with Jackson `@JsonProperty` or `PropertyNamingStrategies.KEBAB_CASE`.
- `SecurityFilterChain`: stateless, permit `/api/v1/auth/**`, `/api/v1/health`, `/api/v1/meta`, `/api/v1/sprites/builtin`; everything else needs a valid bearer token. Keep the `X-Requested-With` check on `/refresh` and `/logout`.
- One `@RestControllerAdvice` that turns every exception into the error shape above and adds `request-id`.
- Transactions: `PUT /progress`, `DELETE /sprites/{id}` (garden clean-up) and account deletion are single transactions.
- Use `ETag` support (`ShallowEtagHeaderFilter` or manual versions) and `If-Match` checks on `/settings`, `/garden`, `/progress`.
- Time: UTC everywhere (`spring.jackson.time-zone=UTC`, `hibernate.jdbc.time_zone=UTC`).

### Console output and debug helpers
On every page load the app logs a collapsed group named **`[Pixel Space] backend DTOs · page load`** with `user`, `tasks`,
`sprites` (your custom ones), and `garden` (both 256 x 128 layers). It is logged again when the account state changes.
In the browser console:

```js
fq.dto.all()                     // { user, tasks, sprites, garden }
fq.dto.all({ builtin: true })    // same, with the 80 built-in sprites included
fq.dto.sprites()                 // custom sprites only
fq.dto.garden()                  // the 2-layer garden grid
fq.dto.tasks()
fq.dto.user()                    // null for guests
fq.print()                       // log the group again
localStorage.setItem('fq_debug_dto', '1')   // also log whenever the garden or a sprite changes
```
Regenerate the built-in seed file with `npm run export:builtin` (writes `docs/seed/builtin-sprites.json`).

## Data and privacy
Without an account everything stays in your browser. Signing in only adds the session (the refresh cookie and an in-memory access token); nothing else is sent to the server yet (sync is specified in the API reference). Settings, tasks, theme, palette and garden use `localStorage`
(`focusquest`, `fq_garden`, `fq_garden_meta`, `fq_sid_seq`, `fq_pix_pal`, `fq_pix_draft`, `fq_custom`). Banners and custom tiles use
IndexedDB (database `focusquest`). **Settings → Reset data** clears all of it.

## Front-end architecture and conventions

**Layers**
| Layer | Where | Rule |
|---|---|---|
| Markup | `src/components/*.jsx` | Static React components. No business logic. Every control has an `id` or `data-*` hook the engine uses. |
| Behaviour | `src/engine/app.js` | Imperative engine: timer, tasks, buddy, banners, garden, tiles, pixel creator, router, tooltips, scroll rows. Sectioned by comments. |
| Data | `src/data/` | Pure modules: sprite atlas index, DTO builders, icon bitmaps and cursors, buddy facts. No DOM, usable from Node scripts. |
| Auth | `src/auth/` | React context, API client and validation for sign-in. |
| Styles | `src/index.css` | Design tokens as CSS variables (`--box`, `--line`, `--ink`, `--acc`, `--bd`, `--ts` text scale), themes by `data-theme` / `data-scheme`, then page and component styles, then Tailwind layers. |

**Reusable pieces**
- `PixelIcon` (+ `iconCursor`) draws any icon from a 16 × 16 text grid in `src/data/pixelIcons.js`. Keep icons inside about 12 × 12 with 2 px strokes so they look the same size.
- `ToolButton` (icon + small name + long tooltip), `IconButton` (icon + text), `HScroll` (sideways row with arrows that appear only when needed).
- Pages are registered in `ROUTES` in `app.js`; `open('#id', 1)` pushes a history entry and `open('#id', 0)` goes back.

**Responsive rules.** One breakpoint at 768 px. Prefer CSS layout (grid areas, flex, `dvh`, container sizing) over JavaScript measuring. Phones scroll the
page vertically; only the canvas has its own gestures (`touch-action: none`). Nothing may scroll sideways at 320 px wide.

**Definition of done for a UI change**
1. Every control has an accessible name; icon-only buttons also have a `data-tip`.
2. At least 44 × 44 px on touch screens; focus is visible and moves sensibly; state is never shown by colour alone.
3. Works in light, dark and high contrast, with reduced motion, from 320 px to desktop.
4. `npm test` passes (including axe) and you added a test for new behaviour.
5. One commit per problem solved.

**Performance.** First load is about 104 kB of JavaScript and 10 kB of CSS (gzipped) plus the sprite sheets (about 260 kB of PNG), served with long-lived
caching and a service worker for offline use. The next big win needs the engine split into feature modules (timer, tasks, garden, tiles, creator) so the
garden and creator can be loaded on demand.

**Roadmap for the front end:** split `app.js` into modules with a tiny event bus, add the `src/api/` layer and outbox described in the
[Frontend integration plan](#frontend-integration-plan), introduce TypeScript for the DTOs, and add visual regression screenshots to the tests.

## Testing
```bash
npx playwright install chromium   # once
npm test                          # build, then run the end-to-end tests (or: npm run test:e2e against an existing build)
```
`tests/e2e/app.test.mjs` starts `vite preview` and checks: page addresses and the Back button, focus handling, garden painting with undo and redo,
the canvas filling its space, the DUNGEON sections, the three Pixel Creator steps and grid validation, touch pinch zoom, **zero axe-core violations**
(dashboard, garden, Pixel Creator; desktop and phone; light and dark), 44 px touch targets, and no sideways scrolling at 320 px.
A ready-made GitHub Actions workflow is in `docs/ci-workflow.yml` (copy it to `.github/workflows/ci.yml`).

## Project layout

```
index.html              Vite entry (loads the Press Start 2P font)
vercel.json             Vercel build and routing config
CLAUDE.md               Guide for AI coding assistants working on this repo
docs/AUTH_API.md        Auth deep dive: cookies, JWT, OAuth, SMTP reset
docs/ci-workflow.yml    GitHub Actions workflow to copy into .github/workflows/
docs/seed/              builtin-sprites.json (built-in sprites in the DTO format)
scripts/mock-api.mjs    Dev-only mock of the auth API (npm run mock:api)
scripts/export-builtin-sprites.mjs   Writes docs/seed/builtin-sprites.json (npm run export:builtin)
tests/e2e/              Playwright + axe-core tests (npm test)
.env.example            Frontend settings
src/
  main.jsx              React entry
  App.jsx               Composes the layout and pages, starts the engine
  index.css             Design tokens, themes and page styles, then Tailwind layers
  components/           React components holding the markup
    Dashboard, Banner, Timer, Calendar, Tasks, Buddy
    MenuModal, SettingsModal, AboutModal, BannerModal, GardenModal,
    TileManagerModal, SheetImportModal, PixelCreatorModal
    PixelIcon, ToolButton, IconButton, HScroll   (shared building blocks)
  auth/                 Login / sign up (React): api client, context, modal, validation
  engine/app.js         Interactive logic (timer, tasks, buddy, banners, garden, tiles, pixel creator, router)
  assets/               cats.png, saga.png (buddy sheets), atlas.png (garden sprites)
  data/atlasMeta.js     Garden sprite index
  data/pixelIcons.js    Pixel icon bitmaps and cursor builder
  data/dto.js           Backend DTO builders (sprite, garden, task, user)
  data/funFacts.js      Buddy facts and jokes (public APIs with offline fallback)
```

## Credits
- Garden tiles and nature sprites come from the sprite sheets supplied by the project owner.
- Dungeon tiles and sprites: [Free 2D Top-Down Pixel Dungeon Asset Pack](https://craftpix.net/) by Craftpix.net, used under the
  [Craftpix free license](https://craftpix.net/file-licenses/). `scripts/pack-dungeon.py` shows how the pack was sliced into the atlas.
