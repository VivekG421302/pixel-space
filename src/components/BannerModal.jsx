import { memo } from 'react';

// Static markup. Behaviour is attached by src/engine/app.js (see README).
function BannerModal() {
  return (
    <div className="modal" id="mb">
      <div className="box sheet" role="dialog" aria-label="Banners">
        <div className="sh">
          <h2 className="text-[12px]">BANNERS</h2>
          <button className="gb !px-2 !py-1" data-close="" aria-label="Close">✕</button>
        </div>
        <div className="sb">
          <div className="row" style={{marginTop: '14px'}}>
            <button className="gb sm on" id="bup2">UPLOAD NEW</button>
            <button className="gb sm" id="bno">HIDE BANNER</button>
          </div>
          <p className="text-[8px] opacity-70 mb-3" id="bmsg">
            GIF, PNG, JPG or WEBP. Wide images (3:1) fit best. Past banners are kept here; click one to use it. You can also drop an image onto the page.
          </p>
          <div id="bgrid" className="grid grid-cols-1 sm:grid-cols-2 gap-3"></div>
        </div>
        <div className="sf">
          <button className="gb on" data-close="">CLOSE</button>
        </div>
      </div>
    </div>
  );
}

export default memo(BannerModal);
