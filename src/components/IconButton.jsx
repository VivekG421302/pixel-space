import { memo } from 'react';
import PixelIcon from './PixelIcon';

// Small button with a pixel icon next to its text. The text lives in .bt so the engine can change it.
function IconButton({ icon, children, className = '', ...rest }) {
  return (
    <button type="button" className={`gb sm ib ${className}`} {...rest}>
      <PixelIcon name={icon} size={18} />
      <span className="btx">{children}</span>
    </button>
  );
}

export default memo(IconButton);
