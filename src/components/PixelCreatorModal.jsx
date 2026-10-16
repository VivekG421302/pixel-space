import { memo } from 'react';
import ToolButton from './ToolButton';
import IconButton from './IconButton';
import PixelIcon from './PixelIcon';
import HScroll from './HScroll';

// Collapsible group of options. Native <details> keeps it keyboard and screen reader friendly.
function Section({ icon, title, id, open = false, children }) {
  return (
    <details className="acc" id={id} open={open}>
      <summary>
        <PixelIcon name={icon} size={20} />
        <span className="acct">{title}</span>
        <span className="accc"><PixelIcon name="down" size={16} /></span>
      </summary>
      <div className="accb">{children}</div>
    </details>
  );
}

// Static markup. Behaviour is attached by src/engine/app.js (see CLAUDE.md).
// Desktop: tools | canvas with colours above it | options. Phone: one page that scrolls vertically:
// top bar, colours, canvas, tools (two rows that scroll sideways), then the options.
function PixelCreatorModal() {
  return (
    <div className="modal gmodal" id="mp">
      <div className="box pxapp" data-step="2" role="dialog" aria-modal="true" aria-label="Pixel art creator">
        <div className="pxhead">
          <nav className="pxsteps" aria-label="Steps">
            <button type="button" className="gb sm pxstep" data-step="1"><b>1</b><span>SETUP</span></button>
            <button type="button" className="gb sm pxstep on" data-step="2"><b>2</b><span>DRAW</span></button>
            <button type="button" className="gb sm pxstep" data-step="3"><b>3</b><span>SAVE</span></button>
          </nav>
          <header className="pxbar b1">
            <ToolButton icon="left" label="HOME" tip="Home · leave the pixel creator" data-close="" />
            <b className="pxbt">STEP 1 · ABOUT AND GRID</b>
            <ToolButton icon="right" label="DRAW" tip="Next · start drawing" id="pxnext1" />
          </header>
          <header className="pxbar b2">
            <ToolButton icon="left" label="HOME" tip="Home · leave the pixel creator" className="pxhome" data-close="" />
            <label className="pxtitle" data-tip="Sprite title · click to rename">
              <input id="pxtt" defaultValue="pixel art" maxLength="24" aria-label="Sprite title" autoComplete="off" />
              <PixelIcon name="pencil" size={18} />
            </label>
            <ToolButton icon="sliders" label="META" tip="Update meta · name, type and grid size" id="pxmetab" />
            <ToolButton icon="save" label="FINISH" tip="Finish · review and save your sprite" className="pxfinish" id="pxfin" />
          </header>
          <header className="pxbar b3">
            <ToolButton icon="left" label="DRAW" tip="Back · keep drawing" id="pxback3" />
            <b className="pxbt">STEP 3 · SAVE</b>
            <ToolButton icon="home" label="DONE" tip="Done · close the pixel creator" id="pxdone" />
          </header>
        </div>
        <div className="pxcolrow">
          <input type="color" id="pxcol" defaultValue="#383838" aria-label="Colour" />
          <HScroll className="pxpalhs" trackClass="pxpal" id="pxpal" aria-label="Palette"></HScroll>
          <ToolButton icon="plus" label="ADD" tip="Add this colour to the palette" className="mini" id="pxadd" />
          <ToolButton icon="close" label="REMOVE" tip="Remove the selected colour from the palette" className="mini" id="pxdel" />
        </div>
        <div className="pxstage">
          <div className="pxview" id="pxview">
            <div className="pxwrap">
              <canvas id="pxc"></canvas>
            </div>
          </div>
          <button type="button" className="gb pxchip pxgs" id="pxgs" aria-expanded="false" aria-controls="pxgp" data-tip="Grid size · click to change">
            <span id="pxgst">32 x 32</span>
            <PixelIcon name="pencil" size={16} />
          </button>
          <div className="box pxgp pxgcfg" id="pxgp" hidden role="group" aria-label="Grid size">
            <div className="cbar" id="pxs">
              <button className="gb sm" data-s="8">8</button>
              <button className="gb sm" data-s="16">16</button>
              <button className="gb sm on" data-s="32">32</button>
              <button className="gb sm" data-s="64">64</button>
              <button className="gb sm" data-s="128">128</button>
              <button className="gb sm" data-s="256">256</button>
            </div>
            <div className="cbar" style={{marginTop: '8px'}}>
              <input className="pxw" id="pxw" type="number" min="4" max="256" style={{width: '72px'}} aria-label="Width" />
              <span>x</span>
              <input className="pxh" id="pxh" type="number" min="4" max="256" style={{width: '72px'}} aria-label="Height" />
              <IconButton icon="check" className="pxap" id="pxap">SET</IconButton>
            </div>
          </div>
          <button type="button" className="gb sq pxchip pxgrid" id="pxgr" aria-pressed="true" aria-label="Grid lines" data-tip="Grid lines · G"><PixelIcon name="grid" size={22} /></button>
          <div className="pxzoom" role="group" aria-label="Zoom">
            <button type="button" className="gb sq" id="pxzl" data-tip="Zoom level · click to fit the canvas" aria-label="Fit canvas to the screen">8x</button>
            <button type="button" className="gb sq" id="pxzp" data-tip="Zoom in · Ctrl and plus" aria-label="Zoom in"><PixelIcon name="zoomin" size={20} /></button>
            <button type="button" className="gb sq" id="pxzm" data-tip="Zoom out · Ctrl and minus" aria-label="Zoom out"><PixelIcon name="zoomout" size={20} /></button>
          </div>
          <span className="pxpos" id="pxpos"></span>
          <div className="pxtoast" id="pxtoast" role="status" aria-live="polite"></div>
        </div>
        <HScroll className="pxtoolhs" trackClass="pxtools" role="group" aria-label="Drawing tools">
          <ToolButton icon="pencil" label="PENCIL" tip="Pencil · P" data-px="pencil" on />
          <ToolButton icon="erase" label="ERASER" tip="Eraser · E" data-px="eraser" />
          <ToolButton icon="fill" label="FILL" tip="Fill · F" data-px="fill" />
          <ToolButton icon="pick" label="PICK" tip="Pick colour · I" data-px="pick" />
          <ToolButton icon="line" label="LINE" tip="Line · L" data-px="line" />
          <ToolButton icon="rect" label="RECT" tip="Rectangle · R" data-px="rect" />
          <ToolButton icon="move" label="MOVE REF" tip="Move reference image · M" data-px="ref" />
          <ToolButton icon="trash" label="CLEAR" tip="Clear the whole canvas (you can undo)" id="pxcl" />
          <ToolButton icon="undo" label="UNDO" tip="Undo · Ctrl+Z" id="pxu" />
          <ToolButton icon="redo" label="REDO" tip="Redo · Ctrl+Y" id="pxr" />
        </HScroll>
        <div className="pxopts">
          <Section icon="layers" title="LAYERS" id="pxlayers" open>
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
          </Section>
          <Section icon="pencil" title="BRUSH & SHAPES" id="pxbrush">
            <div className="cbar">
              <label className="pxnote">
                BRUSH SIZE{' '}
                <select id="pxbs" style={{width: '64px'}}>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                </select>
              </label>
              <IconButton icon="rectfill" id="pxfl">RECT FILL: OFF</IconButton>
            </div>
          </Section>
          <Section icon="image" title="REFERENCE & TRACE" id="pxref">
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
              <IconButton icon="drop" id="pxex">COLOURS FROM IMAGE</IconButton>
            </div>
            <p className="pxnote">Drag the image into place with MOVE REF. PICK also samples the reference where a cell is empty.</p>
          </Section>
        </div>
        <section className="pxpage p1" aria-label="Step 1: about your sprite and grid size">
          <div className="pxcard">
            <h3 className="pxhd"><PixelIcon name="sliders" size={20} /> ABOUT YOUR SPRITE</h3>
            <div id="pxmeta1" className="pxmetahost">
              <div id="pxmeta">
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
              </div>
            </div>
            <h3 className="pxhd"><PixelIcon name="grid" size={20} /> GRID SIZE</h3>
            <div className="pxgcfg">
              <div className="cbar">
                <button className="gb sm" data-s="8">8</button>
                <button className="gb sm" data-s="16">16</button>
                <button className="gb sm on" data-s="32">32</button>
                <button className="gb sm" data-s="64">64</button>
                <button className="gb sm" data-s="128">128</button>
                <button className="gb sm" data-s="256">256</button>
              </div>
              <div className="cbar" style={{marginTop: '8px'}}>
                <input className="pxw" type="number" min="4" max="256" style={{width: '72px'}} aria-label="Width" />
                <span>x</span>
                <input className="pxh" type="number" min="4" max="256" style={{width: '72px'}} aria-label="Height" />
                <IconButton icon="check" className="pxap">SET</IconButton>
              </div>
            </div>
            <p className="pxnote">Pixels are counted in cells. You can change the name, type and grid size again at any time with the META icon while you draw. Changing the grid keeps your drawing.</p>
            <div className="cbar" style={{marginTop: '14px'}}>
              <IconButton icon="pencil" className="on" id="pxgo">START DRAWING</IconButton>
            </div>
          </div>
        </section>
        <section className="pxpage p3" aria-label="Step 3: save your sprite">
          <div className="pxcard pxsave3">
            <div className="pxprevcol">
              <h3 className="pxhd"><PixelIcon name="eye" size={20} /> YOUR SPRITE</h3>
              <div className="pxprevbox"><canvas id="pxprev" role="img" aria-label="Preview of your sprite"></canvas></div>
              <small id="pxprevinfo" className="pxnote"></small>
            </div>
            <div className="pxmetacol">
              <h3 className="pxhd"><PixelIcon name="sliders" size={20} /> ABOUT</h3>
              <div id="pxmeta3" className="pxmetahost"></div>
              <div className="cbar" style={{marginTop: '10px'}}>
                <IconButton icon="plus" className="on" id="pxad">ADD TO TILES</IconButton>
                <IconButton icon="check" id="pxup" style={{display: 'none'}}>UPDATE TILE</IconButton>
                <IconButton icon="download" id="pxpn">PNG</IconButton>
              </div>
              <p className="pxnote" id="pxmsg">Check your sprite, adjust the details, then add it to your tiles.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default memo(PixelCreatorModal);
