import { memo } from 'react';

// Static markup. Behaviour is attached by src/engine/app.js (see README).
function PixelCreatorModal() {
  return (
    <div className="modal gmodal" id="mp">
      <div className="box gwrap" role="dialog" aria-modal="true" aria-label="Pixel art creator">
        <div className="gtop">
          <b>PIXEL CREATOR</b>
          <button className="gb sm on" data-px="pencil" title="Pencil (P)">PENCIL</button>
          <button className="gb sm" data-px="eraser" title="Eraser (E)">ERASER</button>
          <button className="gb sm" data-px="fill" title="Fill (F)">FILL</button>
          <button className="gb sm" data-px="pick" title="Pick colour (I)">PICK</button>
          <button className="gb sm" data-px="line" title="Line (L)">LINE</button>
          <button className="gb sm" data-px="rect" title="Rectangle (R)">RECT</button>
          <button className="gb sm" data-px="ref" title="Move reference (M)">MOVE REF</button>
          <span className="sp"></span>
          <button className="gb sm" id="pxu">UNDO</button>
          <button className="gb sm" id="pxr">REDO</button>
          <button className="gb sm" id="pxzm" aria-label="Zoom out">−</button>
          <b id="pxzl">8x</b>
          <button className="gb sm" id="pxzp" aria-label="Zoom in">+</button>
          <button className="gb sm" id="pxgr">GRID</button>
          <button className="gb sm" data-close="" aria-label="Close">✕</button>
        </div>
        <div className="pxmain">
          <div className="pxview" id="pxview">
            <div className="pxwrap">
              <canvas id="pxc"></canvas>
            </div>
          </div>
          <div className="pxside">
            <div className="pxsec">LAYERS</div>
            <div className="lyrs">
              <div className="lyr" data-ly="ref">
                <button type="button" className="lyrsel" aria-pressed="false">
                  <span className="lyn">1</span>
                  <svg className="lyi" viewBox="0 0 16 16" aria-hidden="true" shapeRendering="crispEdges"><rect x="1" y="2" width="14" height="12" fill="none" stroke="currentColor" strokeWidth="2" /><rect x="10" y="5" width="2" height="2" fill="currentColor" /><path d="M3 12 L6 8 L8 10 L10 8 L13 12 Z" fill="currentColor" /></svg>
                  <span className="lyt"><b>REFERENCE</b><small id="lyrs">IMAGE · none</small></span>
                </button>
                <button className="gb sm lye" id="lyre" aria-label="Show or hide the reference layer" title="Show / hide"><svg viewBox="0 0 16 16" aria-hidden="true" shapeRendering="crispEdges"><path d="M1 8 L4 4 H12 L15 8 L12 12 H4 Z" fill="none" stroke="currentColor" strokeWidth="2" /><rect className="ep" x="7" y="6" width="3" height="4" fill="currentColor" /><path className="es" d="M2 14 L14 2" stroke="currentColor" strokeWidth="2" /></svg></button>
              </div>
              <div className="lyr on" data-ly="draw">
                <button type="button" className="lyrsel" aria-pressed="true">
                  <span className="lyn">2</span>
                  <svg className="lyi" viewBox="0 0 16 16" aria-hidden="true" shapeRendering="crispEdges"><path d="M11 1 L15 5 L5 15 L1 15 L1 11 Z" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M9 3 L13 7" stroke="currentColor" strokeWidth="2" /></svg>
                  <span className="lyt"><b>DRAWING</b><small>PIXELS</small></span>
                </button>
                <button className="gb sm lye" id="lyde" aria-label="Show or hide the drawing layer" title="Show / hide"><svg viewBox="0 0 16 16" aria-hidden="true" shapeRendering="crispEdges"><path d="M1 8 L4 4 H12 L15 8 L12 12 H4 Z" fill="none" stroke="currentColor" strokeWidth="2" /><rect className="ep" x="7" y="6" width="3" height="4" fill="currentColor" /><path className="es" d="M2 14 L14 2" stroke="currentColor" strokeWidth="2" /></svg></button>
              </div>
            </div>
            <p className="text-[length:calc(10px*var(--ts))] opacity-[.86] mt-2">Layer 1 sits under layer 2. Click a layer to work on it. Only layer 2 is saved as the tile.</p>
            <div className="pxsec">CANVAS SIZE</div>
            <div className="cbar" id="pxs">
              <button className="gb sm" data-s="8">8</button>
              <button className="gb sm" data-s="16">16</button>
              <button className="gb sm on" data-s="32">32</button>
              <button className="gb sm" data-s="64">64</button>
              <button className="gb sm" data-s="128">128</button>
              <button className="gb sm" data-s="256">256</button>
            </div>
            <div className="cbar" style={{marginTop: '8px'}}>
              <input id="pxw" type="number" min="4" max="256" style={{width: '72px'}} aria-label="Width" />
              <span>x</span>
              <input id="pxh" type="number" min="4" max="256" style={{width: '72px'}} aria-label="Height" />
              <button className="gb sm" id="pxap">SET</button>
            </div>
            <div className="cbar" style={{marginTop: '10px'}}>
              <label className="text-[length:calc(10px*var(--ts))]">
                BRUSH{' '}
                <select id="pxbs" style={{width: '64px'}}>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                </select>
              </label>
              <button className="gb sm" id="pxfl">RECT FILL: OFF</button>
              <button className="gb sm" id="pxcl">CLEAR</button>
            </div>
            <div className="pxsec">REFERENCE IMAGE</div>
            <div className="cbar">
              <button className="gb sm on" id="pxrl">LOAD</button>
              <button className="gb sm" id="pxrfit">FIT</button>
              <button className="gb sm" id="pxrx">REMOVE</button>
            </div>
            <label className="fld" style={{marginTop: '8px'}}>
              Opacity
              <input type="range" id="pxro" min="5" max="100" defaultValue="35" />
            </label>
            <label className="fld">
              Scale
              <input type="range" id="pxrs" min="10" max="400" defaultValue="100" />
            </label>
            <div className="cbar">
              <button className="gb sm" id="pxtr">TRACE TO PALETTE</button>
            </div>
            <p className="text-[length:calc(10px*var(--ts))] opacity-[.86] mt-2">
              Drag the image into place with MOVE REF. PICK also samples the reference where a cell is empty.
            </p>
            <div className="pxsec">SAVE</div>
            <label className="fld">
              Name
              <input id="pxnm" defaultValue="pixel art" maxLength="24" />
            </label>
            <label className="fld">
              Category
              <input id="pxcat" defaultValue="CUSTOMS" maxLength="14" list="tcats" />
            </label>
            <label className="fld">
              Type
              <select id="pxmo">
                <option value="g">Ground (flat)</option>
                <option value="p">Prop (snaps to grid)</option>
                <option value="o">Object (bottom centre)</option>
              </select>
            </label>
            <div className="cbar">
              <button className="gb sm" id="pxtm">TRIM EDGES: OFF</button>
            </div>
            <div className="cbar" style={{marginTop: '10px'}}>
              <button className="gb sm on" id="pxad">ADD TO TILES</button>
              <button className="gb sm" id="pxup" style={{display: 'none'}}>UPDATE TILE</button>
              <button className="gb sm" id="pxpn">PNG</button>
            </div>
            <p className="text-[length:calc(10px*var(--ts))] opacity-[.86] mt-3" id="pxmsg">Pick a colour, then click the grid to draw. Your palette and draft are saved.</p>
          </div>
        </div>
        <div className="pxdock">
          <input type="color" id="pxcol" defaultValue="#383838" aria-label="Colour" />
          <button className="gb sm" id="pxadd">+ ADD</button>
          <button className="gb sm" id="pxdel">REMOVE</button>
          <div className="pxpal" id="pxpal"></div>
          <button className="gb sm" id="pxex">FROM REF</button>
          <span className="text-[length:calc(10px*var(--ts))] opacity-[.86]" id="pxpos"></span>
        </div>
      </div>
    </div>
  );
}

export default memo(PixelCreatorModal);
