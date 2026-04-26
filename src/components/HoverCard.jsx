import TrophyBadge from './TrophyBadge.jsx';
import { ZONE_LABELS, ZONE_SHORT_LABELS, ZONES } from '../config/qualificationRules.js';
import { BADGE_TYPE } from '../utils/resolveZones.js';
import { formatGD } from '../utils/formatters.js';

const CARD_WIDTH = 240;
const GAP = 8;

const CASUAL_ZONE = {
  [ZONES.UCL_LEAGUE]: 'Champions League',
  [ZONES.UCL_QUALIFYING]: 'Champions League Qualifying',
  [ZONES.UEL_LEAGUE]: 'Europa League',
  [ZONES.UEL_QUALIFYING]: 'Europa League Qualifying',
  [ZONES.UECL_QUALIFYING]: 'Conference League',
};

function trophyTitle(badge) {
  if (badge.type === BADGE_TYPE.UCL_TITLE) return 'Champions League holders';
  if (badge.type === BADGE_TYPE.UEL_TITLE) return 'Europa League holders';
  return `${badge.competitionName} winners`;
}

function trophyDetail(badge) {
  if (badge.type === BADGE_TYPE.UCL_TITLE || badge.type === BADGE_TYPE.UEL_TITLE) {
    return 'Automatic UCL League Phase';
  }
  if (badge.case === 'A' && badge.cascadeTo) {
    const inShort = ZONE_SHORT_LABELS[badge.winnerOriginalZone] || 'Europe';
    const target = CASUAL_ZONE[badge.targetZone] || 'European';
    return `Already in ${inShort} via league — ${target} spot passes to ${badge.cascadeTo}`;
  }
  return `Earns a ${CASUAL_ZONE[badge.targetZone] || 'European'} spot`;
}

function TrophySection({ badge }) {
  return (
    <div className="hover-card__trophy" style={{ borderLeftColor: badge.color }}>
      <span className="hover-card__trophy-icon">
        <TrophyBadge type={badge.type} color={badge.color} tooltip="" />
      </span>
      <div className="hover-card__trophy-text">
        <div className="hover-card__trophy-title">{trophyTitle(badge)}</div>
        <div className="hover-card__trophy-detail">{trophyDetail(badge)}</div>
      </div>
    </div>
  );
}

// Inner content shared by both desktop hover and mobile sheet renderings.
function CardBody({ team }) {
  const badges = team.badges ?? [];
  return (
    <>
      <div className="hover-card__name">{team.name}</div>

      {badges.map((b, i) => <TrophySection key={b.type + i} badge={b} />)}

      {team.zone && team.zone !== 'NONE' && (
        <div className="hover-card__zone">{ZONE_LABELS[team.zone]}</div>
      )}

      <div className="hover-card__stats">
        <div className="stat"><span className="stat__label">Pts</span><span className="stat__val">{team.points}</span></div>
        <div className="stat"><span className="stat__label">GD</span><span className="stat__val">{formatGD(team.gd)}</span></div>
        <div className="stat"><span className="stat__label">GP</span><span className="stat__val">{team.played}</span></div>
      </div>

      {team.form && (
        <div className="hover-card__form" aria-label="Last 5 results">
          {team.form.map((r, i) => (
            <span key={i} className={'form-pill form-pill--' + r}>{r}</span>
          ))}
        </div>
      )}

      {team.nextFixture && (
        <div className="hover-card__fixture">
          <span className="hover-card__fixture-label">Next</span>
          <span>{team.nextFixture}</span>
        </div>
      )}
    </>
  );
}

// Card has two modes:
//   - mode="hover" (default, desktop): position: fixed at the row's anchor
//     rect, using flipLeft for the rightmost columns to keep it on-screen.
//   - mode="sheet" (mobile): full-width bottom sheet with backdrop. onClose
//     is required for sheet mode (close button + backdrop tap).
export default function HoverCard({ team, flipLeft, anchorRect, mode = 'hover', onClose }) {
  if (!team) return null;

  if (mode === 'sheet') {
    return (
      <div className="hover-card-sheet" role="dialog" aria-modal="true">
        <div className="hover-card-sheet__backdrop" onClick={onClose} />
        <div
          className="hover-card hover-card--sheet"
          data-zone={team.zone}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="hover-card__close"
            onClick={onClose}
            aria-label="Close"
          >×</button>
          <CardBody team={team} />
        </div>
      </div>
    );
  }

  // Hover mode
  if (!anchorRect) return null;
  const style = flipLeft
    ? { top: anchorRect.top, left: anchorRect.left - CARD_WIDTH - GAP }
    : { top: anchorRect.top, left: anchorRect.right + GAP };

  return (
    <div
      className={'hover-card' + (flipLeft ? ' hover-card--left' : '')}
      role="tooltip"
      data-zone={team.zone}
      style={style}
    >
      <CardBody team={team} />
    </div>
  );
}
