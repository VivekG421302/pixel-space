import { memo } from 'react';
import PixelIcon from './PixelIcon';
import ToolButton from './ToolButton';
import HScroll from './HScroll';

// Static markup. Behaviour is attached by src/engine/app.js (see README).
// Desktop: tools on the left, the square world canvas in the middle, tiles on the right.
// Phone: tools across the top, the square canvas, tiles underneath (CSS only).
function GardenModal() {
  return (
    <div className="modal gmodal" id="mg">
      <div className="box gwrap" role="dialog" aria-modal="true" aria-label="Garden">
        <div className="gside gl">
          <b className="gtitle">GARDEN</b>
          <HScroll className="gtoolhs" trackClass="gtools" role="group" aria-label="Garden tools">
            <ToolButton icon="paint" label="PAINT" tip="Paint · place the selected tile (click or drag)" data-tool="paint" on />
            <ToolButton icon="erase" label="ERASE" tip="Erase · remove the top tile (or right click)" data-tool="erase" />
            <ToolButton icon="move" label="MOVE" tip="Move · drag a placed tile to another cell" data-tool="move" />
            <ToolButton icon="pan" label="PAN" tip="Pan · drag to scroll the world (or hold Space)" data-tool="hand" />
            <ToolButton icon="undo" label="UNDO" tip="Undo · Ctrl+Z" id="gund" disabled />
            <ToolButton icon="redo" label="REDO" tip="Redo · Ctrl+Y" id="gred" disabled />
            <ToolButton icon="grid" label="GRID" tip="Grid · show or hide the grid lines" id="ggr" aria-pressed="true" on />
            <ToolButton icon="center" label="CENTER" tip="Center · jump to the middle of the world" id="gce" />
            <ToolButton icon="zoomout" label="ZOOM -" tip="Zoom out · Ctrl and minus" id="gzm" />
            <ToolButton icon="zoomin" label="ZOOM +" tip="Zoom in · Ctrl and plus" id="gzp" />
            <ToolButton icon="tiles" label="TILES" tip="Tile manager · rename, sort and edit your tiles" id="gtm" />
            <ToolButton icon="pencil" label="DRAW" tip="Pixel creator · draw a new tile" id="gpx" />
            <ToolButton icon="trash" label="CLEAR" tip="Clear · remove everything from the garden" id="gcl" />
            <ToolButton icon="close" label="CLOSE" tip="Close the garden · Esc" className="gclose" data-close="" />
          </HScroll>
        </div>
        <div className="gmid">
          <div id="gview">
            <canvas id="gc"></canvas>
            <div className="gpos" id="gpos"></div>
            <div className="gzl" id="gzl">3x</div>
            <div className="gpvz" role="group" aria-label="Zoom">
              <button type="button" className="gb sq" id="gpvm" data-tip="Zoom out" aria-label="Zoom out"><PixelIcon name="zoomout" size={20} /></button>
              <button type="button" className="gb sq" id="gpvp" data-tip="Zoom in" aria-label="Zoom in"><PixelIcon name="zoomin" size={20} /></button>
            </div>
            <button type="button" className="gb sq gfsb" id="gfs" aria-pressed="false" aria-label="Full screen world preview" data-tip="Full screen · preview your world">
              <span className="icin"><PixelIcon name="full" size={22} /></span>
              <span className="icout"><PixelIcon name="exitfull" size={22} /></span>
            </button>
          </div>
        </div>
        <div className="gside gr">
          <HScroll className="gtabs" trackClass="gtabs-track" id="gtb"></HScroll>
          <div id="gpal"></div>
          <span className="ghint">Click paints · right click erases · MOVE drags a tile · 2 layers per tile</span>
        </div>
      </div>
    </div>
  );
}

export default memo(GardenModal);
