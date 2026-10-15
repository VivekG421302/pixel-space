import { memo } from 'react';

// 16 x 16 pixel-art icons drawn as filled pixel runs (no strokes, so they stay crisp at any size).
// To add an icon: draw it on a 16 x 16 grid and add its path here.
const PATHS = {
  pip: 'M1 2h14v1h-14zM1 3h14v1h-14zM1 4h1v1h-1zM14 4h1v1h-1zM1 5h1v1h-1zM14 5h1v1h-1zM1 6h1v1h-1zM14 6h1v1h-1zM1 7h1v1h-1zM8 7h5v1h-5zM14 7h1v1h-1zM1 8h1v1h-1zM8 8h5v1h-5zM14 8h1v1h-1zM1 9h1v1h-1zM8 9h5v1h-5zM14 9h1v1h-1zM1 10h1v1h-1zM8 10h5v1h-5zM14 10h1v1h-1zM1 11h1v1h-1zM14 11h1v1h-1zM1 12h1v1h-1zM14 12h1v1h-1zM1 13h14v1h-14z',
  cycle: 'M4 2h8v1h-8zM2 3h3v1h-3zM11 3h3v1h-3zM1 4h3v1h-3zM9 4h5v1h-5zM1 5h2v1h-2zM10 5h3v1h-3zM1 6h2v1h-2zM11 6h1v1h-1zM1 7h2v1h-2zM1 8h2v1h-2zM1 9h2v1h-2zM13 9h2v1h-2zM1 10h2v1h-2zM13 10h2v1h-2zM2 11h2v1h-2zM12 11h2v1h-2zM2 12h3v1h-3zM11 12h3v1h-3zM4 13h8v1h-8z',
};

function PixelIcon({ name, size = 32 }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} />
    </svg>
  );
}

export default memo(PixelIcon);
