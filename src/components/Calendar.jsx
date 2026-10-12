import { memo } from 'react';

// Static markup. Behaviour is attached by src/engine/app.js (see README).
function Calendar() {
  return (
    <section className="box card cal" data-l="cal" aria-label="Calendar">
      <div className="ch">
        <button className="gb sm" id="pm" aria-label="Previous month">◀</button>
        <h2 id="cm" className="cmh" aria-live="polite"></h2>
        <button className="gb sm" id="nm" aria-label="Next month">▶</button>
      </div>
      <div className="cb">
        <div id="cal"></div>
      </div>
    </section>
  );
}

export default memo(Calendar);
