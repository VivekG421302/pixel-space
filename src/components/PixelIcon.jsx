import { memo } from 'react';

// 16 x 16 pixel-art icons drawn as filled pixel runs (no strokes, so they stay crisp at any size).
// Keep every icon inside a 12 x 12 area (2 px margin) with a 2 px stroke so they look the same size.
// To add an icon: draw it on a 16 x 16 grid and add its path here.
const PATHS = {
  pip: 'M2 3h12v1h-12zM2 4h12v1h-12zM2 5h2v1h-2zM12 5h2v1h-2zM2 6h2v1h-2zM12 6h2v1h-2zM2 7h2v1h-2zM7 7h4v1h-4zM12 7h2v1h-2zM2 8h2v1h-2zM7 8h4v1h-4zM12 8h2v1h-2zM2 9h2v1h-2zM7 9h4v1h-4zM12 9h2v1h-2zM2 10h2v1h-2zM12 10h2v1h-2zM2 11h12v1h-12zM2 12h12v1h-12z',
  cycle: 'M4 2h6v1h-6zM3 3h2v1h-2zM9 3h5v1h-5zM2 4h2v1h-2zM10 4h3v1h-3zM2 5h2v1h-2zM11 5h1v1h-1zM2 6h2v1h-2zM2 7h2v1h-2zM12 7h2v1h-2zM2 8h2v1h-2zM12 8h2v1h-2zM2 9h2v1h-2zM12 9h2v1h-2zM2 10h2v1h-2zM12 10h2v1h-2zM3 11h2v1h-2zM11 11h2v1h-2zM4 12h2v1h-2zM10 12h2v1h-2zM5 13h6v1h-6z',
};

function PixelIcon({ name, size = 32 }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} />
    </svg>
  );
}

export default memo(PixelIcon);
