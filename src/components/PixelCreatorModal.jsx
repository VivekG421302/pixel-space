import { memo } from 'react';
import ToolButton from './ToolButton';
import IconButton from './IconButton';
import PixelIcon from './PixelIcon';
import HScroll from './HScroll';

// Static markup. Behaviour is attached by src/engine/app.js (see README).
function PixelCreatorModal() {
  return (
    <div className="modal gmodal" id="mp">
      <div className="box gwrap" role="dialog" aria-modal="true" aria-label="Pixel art creator">
        <div className="gtop">
          <b>PIXEL CREATOR</b>
          <ToolButton icon="pencil" label="PENCIL" tip="Pencil · P" data-px="pencil" on />
          <ToolButton icon="erase" label="ERASER" tip="Eraser · E" data-px="eraser" />
          <ToolButton icon="fill" label="FILL" tip="Fill · F" data-px="fill" />
          <ToolButton icon="pick" label="PICK" tip="Pick colour · I" data-px="pick" />
          <ToolButton icon="line" label="LINE" tip="Line · L" data-px="line" />
          <ToolButton icon="rect" label="RECT" tip="Rectangle · R" data-px="rect" />
          <ToolButton icon="move" label="MOVE REF" tip="Move reference image · M" data-px="ref" />
          <span className="sp"></span>
          <ToolButton icon="undo" label="UNDO" tip="Undo · Ctrl+Z" id="pxu" />
          <ToolButton icon="redo" label="REDO" tip="Redo · Ctrl+Y" id="pxr" />
          <ToolButton icon="zoomout" label="ZOOM -" tip="Zoom out · Ctrl and minus" id="pxzm" />
          <b id="pxzl">8x</b>
          <ToolButton icon="zoomin" label="ZOOM +" tip="Zoom in · Ctrl and plus" id="pxzp" />
          <ToolButton icon="grid" label="GRID" tip="Grid · G" id="pxgr" />
          <ToolButton icon="close" label="CLOSE" tip="Close the pixel creator · Esc" data-close="" />
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
                  <span className="lyi"><PixelIcon name="image" size={24} /></span>
                  <span className="lyt"><b>REFERENCE</b><small id="lyrs">IMAGE · none</small></span>
                </button>
                <button className="gb sm lye" id="lyre" aria-label="Show or hide the reference layer" title="Show / hide"><span className="ep"><PixelIcon name="eye" size={20} /></span><span className="es"><PixelIcon name="eyeoff" size={20} /></span></button>
              </div>
              <div className="lyr on" data-ly="draw">
                <button type="button" className="lyrsel" aria-pressed="true">
                  <span className="lyn">2</span>
                  <span className="lyi"><PixelIcon name="pencil" size={24} /></span>
                  <span className="lyt"><b>DRAWING</b><small>PIXELS</small></span>
                </button>
                <button className="gb sm lye" id="lyde" aria-label="Show or hide the drawing layer" title="Show / hide"><span className="ep"><PixelIcon name="eye" size={20} /></span><span className="es"><PixelIcon name="eyeoff" size={20} /></span></button>
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
              <IconButton icon="check" id="pxap">SET</IconButton>
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
              <IconButton icon="rectfill" id="pxfl">RECT FILL: OFF</IconButton>
              <ToolButton icon="trash" label="CLEAR" tip="Clear the whole canvas (you can undo)" id="pxcl" />
            </div>
            <div className="pxsec">REFERENCE IMAGE</div>
            <div className="cbar">
              <IconButton icon="image" className="on" id="pxrl">LOAD</IconButton>
              <IconButton icon="full" id="pxrfit">FIT</IconButton>
              <IconButton icon="trash" id="pxrx">REMOVE</IconButton>
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
              <IconButton icon="wand" id="pxtr">TRACE TO PALETTE</IconButton>
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
              <IconButton icon="rect" id="pxtm">TRIM EDGES: OFF</IconButton>
            </div>
            <div className="cbar" style={{marginTop: '10px'}}>
              <IconButton icon="plus" className="on" id="pxad">ADD TO TILES</IconButton>
              <IconButton icon="check" id="pxup" style={{display: 'none'}}>UPDATE TILE</IconButton>
              <IconButton icon="download" id="pxpn">PNG</IconButton>
            </div>
            <p className="text-[length:calc(10px*var(--ts))] opacity-[.86] mt-3" id="pxmsg">Pick a colour, then click the grid to draw. Your palette and draft are saved.</p>
          </div>
        </div>
        <div className="pxdock">
          <input type="color" id="pxcol" defaultValue="#383838" aria-label="Colour" />
          <ToolButton icon="plus" label="ADD" tip="Add this colour to the palette" id="pxadd" />
          <ToolButton icon="close" label="REMOVE" tip="Remove the selected colour from the palette" id="pxdel" />
          <HScroll className="pxpalhs" trackClass="pxpal" id="pxpal"></HScroll>
          <ToolButton icon="image" label="FROM REF" tip="Build a palette from the reference image" id="pxex" />
          <span className="text-[length:calc(10px*var(--ts))] opacity-[.86]" id="pxpos"></span>
        </div>
      </div>
    </div>
  );
}

export default memo(PixelCreatorModal);
