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
the sprite-sheet importer, the Pixel Creator, the Garden, and switches dark mode and the colour theme.

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
while a pop-up is open.

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

### Sound
8-bit chimes made with the Web Audio API (no audio files): click, task complete, session end.
Toggle and volume are in Settings → Sound.

## Data and privacy
Everything stays in your browser. Settings, tasks, theme, palette and garden use `localStorage`
(`focusquest`, `fq_garden`, `fq_pix_pal`, `fq_pix_draft`, `fq_custom`). Banners and custom tiles use
IndexedDB (database `focusquest`). **Settings → Reset data** clears all of it.

## Project layout

```
index.html              Vite entry (loads the Press Start 2P font)
vercel.json             Vercel build and routing config
CLAUDE.md               Guide for AI coding assistants working on this repo
src/
  main.jsx              React entry
  App.jsx               Composes the layout and pop-ups, starts the engine
  index.css             Design tokens, themes and page styles, then Tailwind layers
  components/           React components holding the markup
    Dashboard, Banner, Timer, Calendar, Tasks, Buddy
    MenuModal, SettingsModal, AboutModal, BannerModal, GardenModal,
    TileManagerModal, SheetImportModal, PixelCreatorModal
  engine/app.js         Interactive logic (timer, tasks, buddy, banners, garden, tiles, pixel creator)
  assets/               cats.png, saga.png (buddy sheets), atlas.png (garden sprites)
  data/atlasMeta.js     Garden sprite index
```

## Credits
Garden tiles and nature sprites come from the sprite sheets supplied by the project owner.
