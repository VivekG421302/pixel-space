import { memo } from 'react';
import PixelIcon from './PixelIcon';

// A horizontally scrolling row with arrow buttons that appear only when there is more to scroll to.
// Behaviour (arrow visibility and scrolling) is attached by src/engine/app.js for every .hs element.
function HScroll({ className = '', trackClass = '', children, ...track }) {
  return (
    <div className={`hs ${className}`}>
      <button type="button" className="gb sq hs-btn hs-l" data-hs="-1" aria-label="Scroll left" tabIndex={-1}><PixelIcon name="left" size={18} /></button>
      <div className={`hs-track ${trackClass}`} {...track}>{children}</div>
      <button type="button" className="gb sq hs-btn hs-r" data-hs="1" aria-label="Scroll right" tabIndex={-1}><PixelIcon name="right" size={18} /></button>
    </div>
  );
}

export default memo(HScroll);
