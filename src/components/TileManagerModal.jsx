import { memo } from 'react';

// Static markup. Behaviour is attached by src/engine/app.js (see README).
function TileManagerModal() {
  return (
    <div className="modal" id="mt">
      <div className="box sheet" style={{width: 'min(100%,660px)'}} role="dialog" aria-label="Tile manager">
        <div className="sh">
          <h2 className="text-[12px]">TILE MANAGER</h2>
          <button className="gb !px-2 !py-1" data-close="" aria-label="Close">✕</button>
        </div>
        <div className="sb">
          <div className="cbar" style={{marginTop: '14px'}}>
            <button className="gb sm on" id="tupb">UPLOAD TILES</button>
            <button className="gb sm" id="bsl2">IMPORT SPRITE SHEET</button>
            <button className="gb sm" id="bpx2">DRAW PIXEL ART</button>
          </div>
          <p className="text-[8px] opacity-70 my-3" id="tmmsg">
            PNG, GIF, JPG or WEBP. Pick a tile to rename, categorise, rotate, flip, trim or crop it. Use the arrows to reorder it in the garden dock.
          </p>
          <div id="tmg"></div>
          <div id="tme" className="tm-ed" style={{display: 'none'}}>
            <div>
              <canvas id="tec"></canvas>
              <p className="text-[8px] opacity-70 mt-2" id="tei"></p>
            </div>
            <div>
              <label className="fld">
                Name
                <input id="ten" maxLength="24" />
              </label>
              <label className="fld">
                Category
                <input id="tcat" maxLength="14" list="tcats" />
                <datalist id="tcats"></datalist>
              </label>
              <label className="fld">
                Type
                <select id="tmo">
                  <option value="g">Ground (flat, under everything)</option>
                  <option value="p">Prop (snaps to the grid)</option>
                  <option value="o">Object (bottom centre)</option>
                </select>
              </label>
              <div className="cbar">
                <button className="gb sm" id="trl">ROT L</button>
                <button className="gb sm" id="trr">ROT R</button>
                <button className="gb sm" id="tfh">FLIP H</button>
                <button className="gb sm" id="tfv">FLIP V</button>
              </div>
              <div className="cbar" style={{marginTop: '10px'}}>
                <button className="gb sm" id="ttr">TRIM</button>
                <button className="gb sm" id="tcr">CROP</button>
                <button className="gb sm" id="tml" aria-label="Move earlier">◀</button>
                <button className="gb sm" id="tmr" aria-label="Move later">▶</button>
                <button className="gb sm" id="tdl">DELETE</button>
                <button className="gb sm" id="tepx">EDIT PIXELS</button>
              </div>
              <p className="text-[8px] opacity-70 mt-3">Drag on the preview to choose a crop area, then press CROP.</p>
            </div>
          </div>
        </div>
        <div className="sf">
          <button className="gb on" data-close="">CLOSE</button>
        </div>
      </div>
    </div>
  );
}

export default memo(TileManagerModal);
