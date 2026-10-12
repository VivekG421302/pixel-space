import { memo } from 'react';

// Static markup. Behaviour is attached by src/engine/app.js (see README).
function Tasks() {
  return (
    <section className="box card tsk" data-l="tasks" aria-labelledby="missions-h">
      <div className="ch">
        <h2 id="missions-h">MISSIONS</h2>
        <div className="flex gap-2" role="tablist" aria-label="Missions view">
          <button className="gb sm pick on" id="t1" role="tab" aria-selected="true" aria-controls="act">TASKS</button>
          <button className="gb sm pick" id="t2" role="tab" aria-selected="false" aria-controls="his">HISTORY</button>
        </div>
      </div>
      <div className="cb">
        <div id="act" role="tabpanel" aria-labelledby="t1">
          <div className="flex gap-2 mb-4 addrow">
            <label htmlFor="ti" className="sr-only">New mission</label>
            <input id="ti" placeholder="Add a mission, then press Enter" maxLength="80" autoComplete="off" />
            <button className="gb" id="ta" aria-label="Add mission">+</button>
          </div>
          <ul id="tl" className="space-y-3" aria-label="Open missions"></ul>
        </div>
        <div id="his" className="hidden" role="tabpanel" aria-labelledby="t2"></div>
      </div>
    </section>
  );
}

export default memo(Tasks);
