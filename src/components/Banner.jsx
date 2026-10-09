import { memo } from 'react';

// Static markup. Behaviour is attached by src/engine/app.js (see README).
function Banner() {
  return (
    <section className="box ban" id="ban">
      <div id="cov"></div>
      <div className="bempty">
        <span>NO BANNER YET</span>
        <button className="gb sm on" id="bup">UPLOAD</button>
      </div>
      <div className="bbt">
        <button className="gb sq" id="cvc" title="Banner library" aria-label="Banner library">✎</button>
        <button className="gb sq" id="cvr" title="Hide banner" aria-label="Hide banner">✕</button>
      </div>
    </section>
  );
}

export default memo(Banner);
