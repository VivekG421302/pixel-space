import { memo } from 'react';

// Static markup. Behaviour is attached by src/engine/app.js (see README).
function Timer() {
  return (
    <section className="box tim">
      <div className="sbar">
        <p id="status" className="cur"></p>
        <button className="gb sm" id="addcov" style={{display: 'none'}}>+ BANNER</button>
      </div>
      <div className="face">
        <span id="badge" className="bdg">FOCUS</span>
        <select id="msel" className="gb msel" aria-label="Timer mode"></select>
        <div id="clock" className="digits" role="timer" data-l="clock">
          <div className="dg" id="mm" data-l="dm">25</div>
          <div className="colon">
            <i></i>
            <i></i>
          </div>
          <div className="dg" id="ss" data-l="ds">00</div>
        </div>
        <div className="hprow">
          <b id="hpl">HP</b>
          <div className="hp flex-1">
            <div id="hpb"></div>
          </div>
        </div>
        <div className="ctl">
          <button className="gb cbtn" id="reset" aria-label="Reset">
            <span>RESET</span>
            <small className="kh" id="kr"></small>
          </button>
          <button className="gb cbtn main" id="play" aria-label="Start">
            <span id="plabel">START</span>
            <small className="kh" id="kp"></small>
          </button>
          <button className="gb cbtn" id="skip" aria-label="Skip phase">
            <span>SKIP</span>
            <small className="kh" id="ks"></small>
          </button>
        </div>
      </div>
      <div className="dock">
        <button className="gb" id="bs">SETTINGS</button>
        <button className="gb" id="bg">GARDEN</button>
        <button className="gb" id="ba">ABOUT</button>
      </div>
    </section>
  );
}

export default memo(Timer);
