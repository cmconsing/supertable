import { BADGE_TYPE } from '../utils/resolveZones.js';

// Short text abbreviation rendered for each badge type.
const LABEL_BY_TYPE = {
  [BADGE_TYPE.UCL_TITLE]: 'UCL',
  [BADGE_TYPE.UEL_TITLE]: 'UEL',
  [BADGE_TYPE.CUP]: 'CUP',
};

// Outlined text pill indicating that a team qualified for European
// competition by winning a tournament.
//
// Props:
//   type     — badge type constant from BADGE_TYPE. Drives the label.
//   color    — border + text color (hex). Required.
//   tooltip  — native title attribute text shown on hover.
export default function TrophyBadge({ type, color, tooltip }) {
  const label = LABEL_BY_TYPE[type] ?? '';
  return (
    <span
      className="trophy-badge"
      style={{ borderColor: color, color }}
      title={tooltip}
      aria-label={tooltip}
      role="img"
    >
      {label}
    </span>
  );
}
