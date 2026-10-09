import { memo } from 'react';

// Static markup. Behaviour is attached by src/engine/app.js (see README).
function Tasks() {
  return (
    <section className="box card tsk" data-l="tasks">
      <div className="ch">
        <b>MISSIONS</b>
        <div className="flex gap-2">
          <button className="gb sm pick on" id="t1">TASKS</button>
          <button className="gb sm pick" id="t2">HISTORY</button>
        </div>
      </div>
      <div className="cb">
        <div id="act">
          <div className="flex gap-2 mb-4 addrow">
            <input id="ti" placeholder="Add new mission..." maxLength="80" />
            <button className="gb" id="ta" aria-label="Add">+</button>
          </div>
          <ul id="tl" className="space-y-3"></ul>
        </div>
        <div id="his" className="hidden"></div>
      </div>
    </section>
  );
}

export default memo(Tasks);
