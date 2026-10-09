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
          <div className="fld">Grid size (px per tile)</div>
          <div className="gsz" id="slg">
            <button className="gb sm" data-g="16">16</button>
            <button className="gb sm on" data-g="32">32</button>
            <button className="gb sm" data-g="64">64</button>
            <button className="gb sm" data-g="128">128</button>
            <button className="gb sm" data-g="256">256</button>
            <input id="slc" type="number" min="4" max="512" placeholder="custom" style={{width: '96px'}} aria-label="Custom grid size" />
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
