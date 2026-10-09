import { memo } from 'react';

// Static markup. Behaviour is attached by src/engine/app.js (see README).
function Buddy() {
  return (
    <>
    <div id="pet" aria-label="Buddy"></div>
    <div id="bub"></div>
    <div id="dm"></div>
    <input type="file" id="cvf" accept="image/*" hidden />
    </>
  );
}

export default memo(Buddy);
