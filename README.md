# Pixel Space

Focus Quest: a pixel-art focus timer with a roaming cat buddy, a banner library, a garden builder
(128 x 256 tiles), a tile manager with sprite-sheet slicing, and a pixel-art creator.
Built with React, Vite and Tailwind CSS.

## Scripts

```bash
npm install
npm run dev      # local dev server
npm run build    # production build in dist/
npm run preview  # serve the production build
```

## Deploy to Vercel

`vercel.json` is already set up (Vite framework, `dist` output, SPA rewrite, long-lived asset caching).
Import the repository in Vercel and deploy. No environment variables are needed.

## Project layout

```
index.html              Vite entry (loads the Press Start 2P font)
vercel.json             Vercel build and routing config
src/
  main.jsx              React entry
  App.jsx               Composes the layout and modals, starts the engine
  index.css             Page styles, then Tailwind layers
  components/           React components holding the markup
    Dashboard, Banner, Timer, Calendar, Tasks, Buddy
    SettingsModal, AboutModal, BannerModal, GardenModal,
    TileManagerModal, SheetImportModal, PixelCreatorModal
  engine/app.js         Interactive logic (timer, tasks, buddy, banner, garden, tiles, pixel creator)
  assets/               cats.png, saga.png (buddy sprite sheets), atlas.png (garden sprites)
  data/atlasMeta.js     Garden sprite index
```

## How it works

The components render the layout. `engine/app.js` attaches behaviour to that markup once on mount
(timer, shortcuts, canvas editors, drag and drop). It is the original single-file logic, moved into a
module with images split out into `src/assets`. Next steps if you want a fuller React port: move each
feature (timer, tasks, garden, pixel creator) into hooks and components with real state.

## Data

Everything is stored in the browser: settings and tasks in `localStorage`, banners and custom tiles in
IndexedDB. Resetting data in Settings clears all of it.
