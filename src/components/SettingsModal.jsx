import { memo } from 'react';

// Static markup. Behaviour is attached by src/engine/app.js (see README).
function SettingsModal() {
  return (
    <div className="modal" id="ms">
      <div className="box sheet" role="dialog" aria-label="Settings">
        <div className="sh">
          <h2 className="text-[12px]">SETTINGS</h2>
          <button className="gb !px-2 !py-1" data-close="" aria-label="Close">✕</button>
        </div>
        <div className="sb">
          <h3>TIMERS (minutes)</h3>
          <div className="tbl" id="durs"></div>
          <h3>SOUND</h3>
          <div className="row">
            <span>Chimes</span>
            <button className="gb !py-1" id="snd">ON</button>
          </div>
          <div className="row">
            <span>Volume</span>
            <input type="range" id="vol" min="0" max="100" style={{width: '55%'}} />
          </div>
          <h3>SHORTCUTS</h3>
          <div className="row">
            <span>Enabled</span>
            <button className="gb sm" id="kbt">ON</button>
          </div>
          <div id="keys"></div>
          <p className="text-[8px] opacity-70 my-2">Click a key, then press the new one. Shortcuts pause while you type in a text field.</p>
          <button className="gb sm" id="kbr">RESET KEYS</button>
          <h3>THEME</h3>
          <div className="cbar" id="ths"></div>
          <h3>BANNER</h3>
          <div className="row">
            <span>Cover image</span>
            <button className="gb sm" id="bsb">LIBRARY</button>
          </div>
          <h3>TILES</h3>
          <div className="row">
            <span>Custom garden tiles</span>
            <button className="gb sm" id="btm">MANAGER</button>
          </div>
          <div className="row">
            <span>Slice a sprite sheet</span>
            <button className="gb sm" id="bsl">IMPORT</button>
          </div>
          <div className="row">
            <span>Draw pixel art</span>
            <button className="gb sm" id="bpx">CREATOR</button>
          </div>
          <h3>BUDDY</h3>
          <div id="pets" className="grid grid-cols-2 sm:grid-cols-4 gap-2"></div>
          <h3>SAGA CREW</h3>
          <div id="pets2" className="grid grid-cols-2 sm:grid-cols-4 gap-2"></div>
          <details className="mt-4">
            <summary className="cursor-pointer">Use my own sprite sheet</summary>
            <div className="mt-3">
              <label className="fld">
                Image
                <input type="file" id="cf" accept="image/*" />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="fld">
                  Columns
                  <input id="cc" type="number" min="1" defaultValue="4" />
                </label>
                <label className="fld">
                  Rows
                  <input id="cr" type="number" min="1" defaultValue="1" />
                </label>
              </div>
              <p className="text-[8px] opacity-70 mb-2">Frame numbers count from 0, left to right, top to bottom. Separate with commas.</p>
              <label className="fld">
                Walk frames
                <input id="cwk" defaultValue="0,1,2,3" />
              </label>
              <label className="fld">
                Idle frames
                <input id="cid" defaultValue="0" />
              </label>
              <label className="fld">
                Sleep frames
                <input id="csl" defaultValue="0" />
              </label>
              <label className="fld">
                Jump frames (up, mid, down)
                <input id="cj" defaultValue="1,2,3" />
              </label>
              <label className="fld">
                Sprite faces
                <select id="cfc">
                  <option value="-1">Left</option>
                  <option value="1">Right</option>
                </select>
              </label>
              <button className="gb on" id="cs">APPLY SPRITE</button>
            </div>
          </details>
        </div>
        <div className="sf">
          <button className="gb" id="rs">RESET DATA</button>
          <button className="gb on" id="sc">SAVE</button>
        </div>
      </div>
    </div>
  );
}

export default memo(SettingsModal);
