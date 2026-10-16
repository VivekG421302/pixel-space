import { memo } from 'react';
import { PATHS } from '../data/pixelIcons.js';

// Icons are drawn on a 16 x 16 grid in src/data/pixelIcons.js.
function PixelIcon({ name, size = 32 }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} />
    </svg>
  );
}

export default memo(PixelIcon);
