import { memo } from 'react';
import Banner from './Banner';
import Timer from './Timer';
import Calendar from './Calendar';
import Tasks from './Tasks';

// Bento grid: banner + timer on the left, calendar + missions on the right.
function Dashboard() {
  return (
    <main className="frame" id="main">
      <h1 className="sr-only">Focus Quest</h1>
      <div id="bento">
        <div className="lc">
          <Banner />
          <Timer />
        </div>
        <div className="rc">
          <Calendar />
          <Tasks />
        </div>
      </div>
    </main>
  );
}

export default memo(Dashboard);
