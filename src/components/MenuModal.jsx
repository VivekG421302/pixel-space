import { memo } from 'react';

// Game-style pause menu. Items with data-go forward the click to another control in the app.
function MenuModal() {
  return (
    <div className="modal" id="mnu">
      <div className="box menu" role="dialog" aria-label="Menu">
        <div className="sh">
          <h2 className="text-[12px]">MENU</h2>
          <button className="gb !px-2 !py-1" data-close="" aria-label="Close">✕</button>
        </div>
        <div className="mlist" id="mlist" role="menu">
          <button className="mi on" id="bs" role="menuitem">SETTINGS</button>
          <button className="mi" id="ba" role="menuitem">ABOUT</button>
          <button className="mi" data-go="#bsb" role="menuitem">BANNERS</button>
          <button className="mi" data-go="#btm" role="menuitem">TILE MANAGER</button>
          <button className="mi" data-go="#bsl" role="menuitem">IMPORT SPRITE SHEET</button>
          <button className="mi" data-go="#bpx" role="menuitem">PIXEL CREATOR</button>
          <button className="mi" data-go="#bg" role="menuitem">GARDEN</button>
          <button className="mi" id="mth" role="menuitem">THEME: <span id="mthn">LEAF</span></button>
          <button className="mi" data-close="" role="menuitem">RESUME</button>
        </div>
        <div className="sf mhint">▲▼ MOVE · ENTER SELECT · ESC CLOSE</div>
      </div>
    </div>
  );
}

export default memo(MenuModal);
