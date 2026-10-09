import { memo } from 'react';

// Static markup. Behaviour is attached by src/engine/app.js (see README).
function AboutModal() {
  return (
    <div className="modal" id="ma">
      <div className="box sheet" role="dialog" aria-label="About">
        <div className="sh">
          <h2 className="text-[12px]">ABOUT</h2>
          <button className="gb !px-2 !py-1" data-close="" aria-label="Close">✕</button>
        </div>
        <div className="sb">
          <p className="mt-4">
            A wild productivity session appeared! Pick a rhythm and stay in the zone while your buddy roams the screen.
          </p>
          <h3>RHYTHMS</h3>
          <div id="ab" className="space-y-2"></div>
          <h3>BUDDY TIPS</h3>
          <ul className="space-y-2">
            <li>▶ Walks the edges of the panels</li>
            <li>▶ Naps during breaks</li>
            <li>▶ Cheers when you finish a mission</li>
            <li>▶ Click it for a spin and a star burst</li>
            <li>▶ Drag it anywhere. It lands on the nearest panel below, or falls to the ground</li>
            <li>▶ Keyboard shortcuts are listed in Settings</li>
          </ul>
          <h3>DATA</h3>
          <p>Everything is saved in this browser only.</p>
        </div>
        <div className="sf">
          <button className="gb on" data-close="">CLOSE</button>
        </div>
      </div>
    </div>
  );
}

export default memo(AboutModal);
