import { Icon } from '../icons/Icon';

export function Placeholder({ label = "foto", style, className = "" }) {
  return (
    <div className={"ph " + className} style={style}>
      <span className="ph-label"><Icon name="sparkle" size={13} /> {label}</span>
    </div>
  );
}
