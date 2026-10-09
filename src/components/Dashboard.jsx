import { memo } from 'react';
import Banner from './Banner';
import Timer from './Timer';
import Calendar from './Calendar';
import Tasks from './Tasks';

// Bento grid: banner + timer on the left, calendar + missions on the right.
function Dashboard() {
  return (
    <div className="frame">
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
    </div>
  );
}

export default memo(Dashboard);
