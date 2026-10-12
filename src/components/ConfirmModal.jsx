import { memo } from 'react';

// In-app replacement for window.confirm(). Opened by the engine's ask().
function ConfirmModal() {
  return (
    <div className="modal" id="mcf">
      <div className="box sheet cfbox" role="alertdialog" aria-modal="true" aria-labelledby="mcft" aria-describedby="mcfm">
        <div className="sh">
          <h2 className="text-[length:calc(12px*var(--ts))]" id="mcft">ARE YOU SURE?</h2>
        </div>
        <div className="sb">
          <p id="mcfm" className="hint" style={{ margin: '16px 0 4px', fontSize: 'calc(11px*var(--ts))' }}></p>
        </div>
        <div className="sf">
          <button className="gb" id="mcfn" data-autofocus="">CANCEL</button>
          <button className="gb on" id="mcfy">CONFIRM</button>
        </div>
      </div>
    </div>
  );
}

export default memo(ConfirmModal);
