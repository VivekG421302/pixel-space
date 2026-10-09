import { memo } from 'react';

// Static markup. Behaviour is attached by src/engine/app.js (see README).
function HiddenInputs() {
  return (
    <>
    <input type="file" id="pxrf" accept="image/*" hidden />
    <input type="file" id="tupf" accept="image/*" multiple hidden />
    </>
  );
}

export default memo(HiddenInputs);
