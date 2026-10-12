import { memo } from 'react';

// Buddy layer: the roaming character, its speech bubble, the drop marker and a screen-reader announcer.
function Buddy() {
  return (
    <>
      <div id="pet" role="button" tabIndex={0} aria-label="Your buddy. Hover, or press Enter, for a fun fact or joke."></div>
      <div id="bub" aria-hidden="true"></div>
      <div id="dm"></div>
      <div id="sr" className="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>
      <input type="file" id="cvf" accept="image/*" hidden />
    </>
  );
}

export default memo(Buddy);
