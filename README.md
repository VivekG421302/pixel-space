# Pixel Space

**Focus Quest**: a pixel-art focus timer with a roaming buddy, a banner library, a garden builder,
a tile manager with sprite-sheet slicing, and a pixel-art creator. Built with React, Vite and Tailwind CSS.
The look is inspired by Pokémon LeafGreen: flat dialog boxes, chunky buttons, 8-bit chimes.

Everything runs in the browser. There is no backend and nothing is uploaded anywhere.

## Quick start

```bash
npm install
npm run dev       # local dev server
npm run build     # production build in dist/
npm run preview   # serve the production build
```

Deploy on Vercel by importing the repo. `vercel.json` already sets the Vite build, the `dist` output,
a single-page rewrite, and long-lived caching for built assets. No environment variables are needed.

## Features and how to use them

### Menu
Press **MENU** (or `,`) for a game-style pop-up in the middle of the screen. Move with the mouse or
`↑` `↓`, choose with `Enter`, close with `Esc`. It opens Settings, About, Banners, the Tile Manager,
the sprite-sheet importer, the Pixel Creator, the Garden, switches dark mode and the colour theme, and ends with the account item (log in / sign up).

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

**Picture in picture:** the **PIP** button pops the clock out into a small always-on-top window with Start / Pause and
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

### Garden builder
A 128 × 256 tile ground to decorate. Open it from the dock, the menu, or `G`.
- Pick a sprite from the dock (tabs: **Ground**, **Props**, **Nature**, plus any categories you create).
- **Paint** (click or drag), **Erase** (right click or the Erase tool), **Move** (drag the top tile of a
  cell to another cell), **Pan** (Pan tool, `Space` + drag, or middle mouse drag).
- Each tile holds at most **two layers**. Placing on an empty tile puts the item there; placing on a
  filled tile stacks on top; placing on a full tile replaces the top layer.
- **Zoom** with `Ctrl` + mouse wheel, `Ctrl +` / `Ctrl -` (with the pointer over the canvas), or the
  +/- buttons. `Ctrl 0` resets. The garden saves automatically.
- **Full screen:** the **Full** button fills the screen (browser fullscreen where supported, otherwise the whole viewport).
- **Layout:** on desktop the controls sit in a left column (tools) and a right column (zoom, grid, tiles, clear, full screen).
  On phones they move to a bar above the canvas (tools, close) and a bar below it (zoom and actions).
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
Menu → Pixel Creator (or **Draw** in the garden).
- **Canvas size**: 8, 16, 32, 64, 128, 256 or any width × height up to 256.
- **Tools**: Pencil, Eraser, Fill, Pick, Line, Rect (outline or filled), Move Ref; brush size 1 to 4;
  undo / redo (40 steps); grid toggle.
- **Layers**: Layer 1 is the **reference image** (picture icon), Layer 2 is the **drawing** (pencil icon).
  Each has an eye button to hide it. The reference sits under the drawing and is never saved into the tile.
- **Reference image**: load one, set opacity and scale, drag it with Move Ref, **Fit**, **Remove**.
  **Pick** also samples the reference where a cell is empty. **From Ref** adds its main colours to the
  palette. **Trace to Palette** fills the canvas using only your palette colours.
- **Palette**: always docked at the bottom. Add colours with the colour picker, remove them, click to use.
  The palette and your draft are remembered.
- **Zoom and pan**: `Ctrl` + wheel or `Ctrl +` / `Ctrl -` zooms toward the pointer (only over the canvas),
  `Ctrl 0` fits, middle mouse drag pans freely.
- **Save**: name, category, type, optional trim, then **Add to Tiles** (selected in the garden dock
  straight away). **Update Tile** saves changes when editing an existing tile. **PNG** downloads the image.

### Keyboard shortcuts
All defaults can be changed in Settings → Shortcuts. They pause while you type in a text field or
while a pop-up is open. `Space` presses a focused button instead of starting the timer.

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

Inside the Pixel Creator: `P` pencil, `E` eraser, `F` fill, `I` pick, `L` line, `R` rect, `M` move
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
The interface is built to WCAG 2.2 AA and was checked with the axe-core engine on the main screen and every dialog
(light, dark and high contrast) with zero violations.
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
- **Touch:** controls are at least 40 to 44 px tall on touch screens, and mission checkboxes have enlarged hit areas.
- **Safer actions:** destructive actions (reset all data, clear the garden, delete a tile, clear the canvas) ask first in an
  in-app dialog with Cancel selected by default.

### Sound
8-bit chimes made with the Web Audio API (no audio files): click, task complete, session end.
Toggle and volume are in Settings → Sound.

## Backend API reference

> The app already produces its data in these shapes and **prints them to the browser console on every page load**
> (see [Console output](#console-output-and-debug-helpers)). Nothing is sent to a server yet; this is the contract for the
> backend you are building.

**`{{Base Url}}` = `<your backend origin>/api/v1`**, for example `https://api.example.com/api/v1`.
The frontend takes the origin from `VITE_API_BASE_URL` and always adds `/api/v1`.

### Conventions
- JSON requests and responses (`Content-Type: application/json`), UTF-8.
- Field names are **kebab-case** (`sprite-name`, `create-time-stamp`).
- Timestamps are **UTC** strings `YYYY-MM-DD HH:mm:ss` (for example `2038-01-19 03:14:07`).
- Colours are hex **without** `#`.
- Protected endpoints need `Authorization: Bearer <accessToken>`. The refresh token lives in an `httpOnly` cookie
  (details and security notes in [`docs/AUTH_API.md`](docs/AUTH_API.md)).
- Every resource belongs to one user. The server takes the user from the token and **ignores any `user` value sent by the client**.
- Errors: `{ "message": "Readable text", "errors": { "field": "Field text" } }` (`errors` optional) with `400` bad request,
  `401` not signed in, `403` forbidden, `404` not found, `409` conflict, `413` payload too large, `422` validation failed,
  `429` too many requests (with `Retry-After`).

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
| `sprite-category` | string, up to 14 chars, upper case | Dock tab. Built-ins: `GROUND`, `PROPS`, `NATURE`. Default for new sprites: `CUSTOMS`. Free text otherwise. |
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

### Endpoints
All paths are relative to `{{Base Url}}`.

**Auth** (full detail in [`docs/AUTH_API.md`](docs/AUTH_API.md))

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| POST | `/auth/signup` | no | `{ name, email, password }` | `201 { accessToken, expiresIn, user }` + refresh cookie |
| POST | `/auth/login` | no | `{ email, password, remember }` | `200 { accessToken, expiresIn, user }` + refresh cookie |
| POST | `/auth/refresh` | cookie | none | `200 { accessToken, expiresIn, user }`, rotated cookie |
| POST | `/auth/logout` | cookie | none | `204`, cookie cleared |
| GET | `/auth/me` | bearer | none | `200` User DTO |
| POST | `/auth/forgot-password` | no | `{ email }` | `202` always (sends the SMTP email) |
| POST | `/auth/reset-password` | no | `{ token, password }` | `204`, all sessions revoked |
| GET | `/auth/oauth2/authorization/{provider}` | no | browser redirect | redirects to the provider, then to `<app>/?auth=success` |

**User**

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/users/me` | none | `200` User DTO |
| PUT | `/users/me` | `{ "name": "..." }` | `200` User DTO |
| DELETE | `/users/me` | none | `204` (deletes the account and all its data) |

**Sprites**

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/sprites` | none | `200` array of the user's Sprite DTOs |
| GET | `/sprites/builtin` | none (public, cacheable) | `200` array of system Sprite DTOs (ids 1 to 80). Seed data: `docs/seed/builtin-sprites.json` |
| GET | `/sprites/{id}` | none | `200` Sprite DTO (own or built-in) |
| POST | `/sprites` | Sprite DTO without `id` | `201` Sprite DTO with the new `id` |
| POST | `/sprites/batch` | `{ "sprites": [Sprite DTO] }` | `200 { "sprites": [Sprite DTO], "id-map": { "<client-id>": <id> } }` |
| PUT | `/sprites/{id}` | Sprite DTO | `200` Sprite DTO (`update-time-stamp` set by the server) |
| DELETE | `/sprites/{id}` | none | `204`. Garden cells that used it become `0` |

**Garden**

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/garden` | none | `200` Garden DTO, or `404` if the user has none yet |
| PUT | `/garden` | Garden DTO | `200` Garden DTO (creates or replaces; sets the timestamps) |
| DELETE | `/garden` | none | `204` |

**Tasks**

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/tasks` | none | `200` array of Task DTOs ordered by `sort-order` |
| POST | `/tasks` | Task DTO without `id` | `201` Task DTO |
| POST | `/tasks/batch` | `{ "tasks": [Task DTO] }` | `200 { "tasks": [Task DTO], "id-map": { "<client-id>": <id> } }` |
| PUT | `/tasks/{id}` | Task DTO | `200` Task DTO |
| DELETE | `/tasks/{id}` | none | `204` |

**Progress bundle** (one call to restore or save everything)

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/progress` | none | `200 { "user": User, "sprites": [Sprite], "garden": Garden or null, "tasks": [Task] }` |
| PUT | `/progress` | `{ "sprites": [...], "garden": {...}, "tasks": [...] }` | `200` the same shape as `GET`, plus `"id-map": { "sprites": {...}, "tasks": {...} }` |

### Ids and syncing (how the pieces fit)
- **Built-in sprites** have ids `1` to `80` and are the same for everyone (`user: null`). Reserve `1..999` for system sprites
  (for example `ALTER TABLE sprites AUTO_INCREMENT = 1000`).
- **Custom sprites** are numbered `1001, 1002, ...` inside the browser until the server assigns real ids. The garden grid
  already uses these numbers.
- **To save progress** (first sign-in on a device): send the sprites first (`POST /sprites/batch`), read the `id-map`, rewrite
  the garden grid with the new ids (`map[client-id]`), then `PUT /garden`. Or send everything with `PUT /progress`, where the
  server does the remapping in one transaction.
- **To restore progress** (new device): `GET /progress`, then draw each sprite from its `data` matrix and rebuild the garden
  from the two grids. Conflicts: compare `update-time-stamp` and keep the newer.
- Server-side checks to apply: matrix sizes match `canvas-size-*`, sizes within 1 to 256, hex strings valid, garden ids exist and are
  visible to the user, name and category lengths, and request size limits (a full garden is about 32,000 numbers per layer; gzip it).

<details>
<summary>Suggested MySQL tables for the data</summary>

```sql
CREATE TABLE sprites (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,           -- start at 1000; 1..999 are system sprites
  user_id       BIGINT NULL,                                 -- NULL = built-in
  client_id     VARCHAR(40) NULL,
  name          VARCHAR(24)  NOT NULL,
  category      VARCHAR(14)  NOT NULL,
  type          ENUM('GROUND','PROPS','OBJECTS') NOT NULL,
  canvas_size_x SMALLINT UNSIGNED NOT NULL,
  canvas_size_y SMALLINT UNSIGNED NOT NULL,
  data          JSON NOT NULL,                               -- or a compressed BLOB of RGBA bytes
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sprites_user (user_id),
  UNIQUE KEY uq_sprites_client (user_id, client_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE gardens (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT NOT NULL UNIQUE,
  canvas_size_x SMALLINT UNSIGNED NOT NULL DEFAULT 128,
  canvas_size_y SMALLINT UNSIGNED NOT NULL DEFAULT 256,
  tile_size     SMALLINT UNSIGNED NOT NULL DEFAULT 16,
  layer_1       JSON NOT NULL,                               -- array of rows of sprite ids
  layer_2       JSON NOT NULL,
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
  INDEX idx_tasks_user (user_id),
  UNIQUE KEY uq_tasks_client (user_id, client_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```
</details>

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
Without an account everything stays in your browser. Signing in only adds the session (the refresh cookie and an in-memory access token); nothing else is sent to the server yet. Settings, tasks, theme, palette and garden use `localStorage`
(`focusquest`, `fq_garden`, `fq_garden_meta`, `fq_sid_seq`, `fq_pix_pal`, `fq_pix_draft`, `fq_custom`). Banners and custom tiles use
IndexedDB (database `focusquest`). **Settings → Reset data** clears all of it.

## Project layout

```
index.html              Vite entry (loads the Press Start 2P font)
vercel.json             Vercel build and routing config
CLAUDE.md               Guide for AI coding assistants working on this repo
docs/AUTH_API.md        Auth deep dive: cookies, JWT, OAuth, SMTP reset
docs/seed/              builtin-sprites.json (built-in sprites in the DTO format)
scripts/mock-api.mjs    Dev-only mock of the auth API (npm run mock:api)
scripts/export-builtin-sprites.mjs   Writes docs/seed/builtin-sprites.json (npm run export:builtin)
.env.example            Frontend settings
src/
  main.jsx              React entry
  App.jsx               Composes the layout and pop-ups, starts the engine
  index.css             Design tokens, themes and page styles, then Tailwind layers
  components/           React components holding the markup
    Dashboard, Banner, Timer, Calendar, Tasks, Buddy
    MenuModal, SettingsModal, AboutModal, BannerModal, GardenModal,
    TileManagerModal, SheetImportModal, PixelCreatorModal
  auth/                 Login / sign up (React): api client, context, modal, validation
  engine/app.js         Interactive logic (timer, tasks, buddy, banners, garden, tiles, pixel creator)
  assets/               cats.png, saga.png (buddy sheets), atlas.png (garden sprites)
  data/atlasMeta.js     Garden sprite index
  data/dto.js           Backend DTO builders (sprite, garden, task, user)
  data/funFacts.js      Buddy facts and jokes (public APIs with offline fallback)
```

## Credits
Garden tiles and nature sprites come from the sprite sheets supplied by the project owner.
