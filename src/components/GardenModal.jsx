import { memo } from 'react';

// Static markup. Behaviour is attached by src/engine/app.js (see README).
function GardenModal() {
  return (
    <div className="modal gmodal" id="mg">
      <div className="box gwrap" role="dialog" aria-modal="true" aria-label="Garden">
        <div className="gside gl">
          <b className="gtitle">GARDEN</b>
          <div className="gtools" role="group" aria-label="Garden tools">
            <button className="gb sm on" data-tool="paint">PAINT</button>
            <button className="gb sm" data-tool="erase">ERASE</button>
            <button className="gb sm" data-tool="move">MOVE</button>
            <button className="gb sm" data-tool="hand">PAN</button>
          </div>
          <button className="gb sm gclose" data-close="" aria-label="Close">✕</button>
        </div>
        <div className="gmain">
          <div id="gview">
            <canvas id="gc"></canvas>
            <div className="gpos" id="gpos"></div>
          </div>
          <div className="gdock">
            <div className="gtabs">
              <span id="gtb" className="gtabs"></span>
              <span className="text-[length:calc(10px*var(--ts))] opacity-[.86]">Click paints · right click erases · MOVE drags a tile · 2 layers per tile</span>
            </div>
            <div id="gpal"></div>
          </div>
        </div>
        <div className="gside gr">
          <div className="gzoom" role="group" aria-label="Zoom">
            <button className="gb sm" id="gzm" aria-label="Zoom out">−</button>
            <b id="gzl">3x</b>
            <button className="gb sm" id="gzp" aria-label="Zoom in">+</button>
          </div>
          <button className="gb sm" id="ggr">GRID</button>
          <button className="gb sm" id="gce">CENTER</button>
          <button className="gb sm" id="gtm">TILES</button>
          <button className="gb sm" id="gpx">DRAW</button>
          <button className="gb sm" id="gcl">CLEAR</button>
          <button className="gb sm" id="gfs" aria-pressed="false">FULL</button>
        </div>
      </div>
    </div>
  );
}

export default memo(GardenModal);
