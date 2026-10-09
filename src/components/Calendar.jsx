import { memo } from 'react';

// Static markup. Behaviour is attached by src/engine/app.js (see README).
function Calendar() {
  return (
    <section className="box card cal" data-l="cal">
      <div className="ch">
        <button className="gb sm" id="pm" aria-label="Previous month">◀</button>
        <b id="cm"></b>
        <button className="gb sm" id="nm" aria-label="Next month">▶</button>
      </div>
      <div className="cb">
        <div id="cal" className="grid grid-cols-7 gap-1 text-center"></div>
      </div>
    </section>
  );
}

export default memo(Calendar);
