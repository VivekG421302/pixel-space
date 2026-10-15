import { memo } from 'react';
import PixelIcon from './PixelIcon';

// Icon button with a small always-visible name under the icon. `tip` is the longer name shown on
// hover, keyboard focus or a long press (see the tooltip block in src/engine/app.js).
function ToolButton({ icon, label, tip, className = '', on = false, ...rest }) {
  return (
    <button
      type="button"
      className={`gb tbtn ${className}${on ? ' on' : ''}`}
      data-tip={tip}
      aria-label={tip.split(' · ')[0]}
      {...rest}
    >
      <PixelIcon name={icon} size={28} />
      <span className="tl">{label}</span>
    </button>
  );
}

export default memo(ToolButton);
