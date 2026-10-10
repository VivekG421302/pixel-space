import { memo } from 'react';

// Static markup. Behaviour is attached by src/engine/app.js (see README).
function SheetImportModal() {
  return (
    <div className="modal" id="msl">
      <div className="box sheet" style={{width: 'min(100%,720px)'}} role="dialog" aria-label="Import sprite sheet">
        <div className="sh">
          <h2 className="text-[12px]">IMPORT SPRITE SHEET</h2>
          <button className="gb !px-2 !py-1" data-close="" aria-label="Close">✕</button>
        </div>
        <div className="sb">
          <label className="fld" style={{marginTop: '14px'}}>
            Sprite sheet image
            <input type="file" id="slf" accept="image/*" />
          </label>
          <div className="fld">Tile size in pixels (width x height)</div>
          <div className="gsz" id="slg">
            <button className="gb sm" data-g="16">16</button>
            <button className="gb sm on" data-g="32">32</button>
            <button className="gb sm" data-g="64">64</button>
            <button className="gb sm" data-g="128">128</button>
            <button className="gb sm" data-g="256">256</button>
            <span className="text-[8px]">W</span>
            <input id="slw" type="number" min="1" max="1024" defaultValue="32" style={{width: '84px'}} aria-label="Tile width in pixels" />
            <span className="text-[8px]">H</span>
            <input id="slh" type="number" min="1" max="1024" defaultValue="32" style={{width: '84px'}} aria-label="Tile height in pixels" />
            <button className="gb sm" id="slap">SET</button>
          </div>
          <div className="cbar" style={{marginBottom: '12px'}}>
            <button className="gb sm on" id="slsk">SKIP EMPTY: ON</button>
            <button className="gb sm" id="slky">CORNER COLOUR CLEAR: OFF</button>
          </div>
          <canvas id="slp"></canvas>
          <div className="row" style={{margin: '10px 0'}}>
            <span id="slcnt" className="text-[8px]">Choose an image to begin.</span>
            <span className="cbar">
              <button className="gb sm" id="sla">ALL</button>
              <button className="gb sm" id="sln">NONE</button>
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <label className="fld">
              Name prefix
              <input id="slnm" defaultValue="tile" maxLength="18" />
            </label>
            <label className="fld">
              Category
              <input id="slcat" defaultValue="CUSTOM" maxLength="14" list="tcats" />
            </label>
            <label className="fld">
              Type
              <select id="slmo" defaultValue="o">
                <option value="g">Ground</option>
                <option value="p">Prop</option>
                <option value="o">Object</option>
              </select>
            </label>
          </div>
          <p className="text-[8px] opacity-70" id="slmsg">Click cells to include or skip them. Tiles are cut at the grid size you pick.</p>
        </div>
        <div className="sf">
          <button className="gb" data-close="">CLOSE</button>
          <button className="gb on" id="slim">IMPORT</button>
        </div>
      </div>
    </div>
  );
}

export default memo(SheetImportModal);
