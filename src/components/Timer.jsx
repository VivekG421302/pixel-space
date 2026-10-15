import { memo } from 'react';
import PixelIcon from './PixelIcon';

// Static markup. Behaviour is attached by src/engine/app.js (see README).
function Timer() {
  return (
    <section className="box tim" aria-labelledby="timer-h">
      <h2 className="sr-only" id="timer-h">Focus timer</h2>
      <div className="sbar">
        <p id="status" className="cur" aria-hidden="true"></p>
        <button className="gb sm" id="addcov" style={{display: 'none'}}>+ BANNER</button>
      </div>
      <div className="face">
        <div className="fhead">
          <select id="msel" className="gb msel" aria-label="Timer mode"></select>
          <span id="badge" className="bdg">FOCUS</span>
          <div className="ftools">
            <button className="gb ibtn" id="pip" aria-pressed="false" aria-label="Picture in picture" title="Pop the clock out into a small floating window">
              <PixelIcon name="pip" />
            </button>
            <button className="gb ibtn" id="auto" aria-pressed="false" aria-label="Auto cycle" title="Automatic Pomodoro cycle: focus, chime, break, chime, repeat">
              <PixelIcon name="cycle" />
            </button>
          </div>
        </div>
        <div id="clock" className="digits" role="timer" aria-label="Time remaining" data-l="clock">
          <div className="dg" id="mm" data-l="dm">25</div>
          <div className="colon">
            <i></i>
            <i></i>
          </div>
          <div className="dg" id="ss" data-l="ds">00</div>
        </div>
        <div className="hprow sr-only">
          <b id="hpl">TIME LEFT</b>
          <div className="hp flex-1" role="progressbar" aria-labelledby="hpl" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100">
            <div id="hpb"></div>
          </div>
        </div>
        <div className="ctl">
          <button className="gb cbtn" id="reset">
            <span>RESET</span>
            <small className="kh" aria-hidden="true" id="kr"></small>
          </button>
          <button className="gb cbtn main" id="play">
            <span id="plabel">START</span>
            <small className="kh" aria-hidden="true" id="kp"></small>
          </button>
          <button className="gb cbtn" id="skip">
            <span>SKIP</span>
            <small className="kh" aria-hidden="true" id="ks"></small>
          </button>
        </div>
      </div>
      <div className="dock">
        <button className="gb" id="bm">MENU</button>
        <button className="gb" id="bg">GARDEN</button>
      </div>
    </section>
  );
}

export default memo(Timer);
