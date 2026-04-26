import TrophyBadge from './TrophyBadge.jsx';
import { ZONE_LABELS } from '../config/qualificationRules.js';
import { formatGD } from '../utils/formatters.js';

// Hover card / mobile sheet are temporarily disabled — football-data.org's
// free tier doesn't include team form, and we haven't wired the fixtures
// endpoint, so the popup just repeats Pts/GD/GP that are already on the row.
// The badge `title` attributes and the row `title` attribute (cascadeNote)
// still surface trophy info via the browser's native tooltip.
//
// To re-enable when form + next-fixture data is plumbed through:
//   - Reintroduce useState/useRef/useMediaQuery + onMouseEnter/onClick
//     handlers (see git history before this change).
//   - Re-render <HoverCard> below.

export default function TeamRow({ team }) {
  return (
    <div
      className="team-row"
      data-zone={team.zone}
      role="row"
      title={team.cascadeNote || undefined}
      aria-label={`${team.rank}. ${team.name} — ${team.points} points${
        team.zone && team.zone !== 'NONE' ? ', ' + ZONE_LABELS[team.zone] : ''
      }${team.cascadeNote ? '. ' + team.cascadeNote : ''}`}
      tabIndex={0}
    >
      <span className="team-row__rank">
        {team.rank}
        {team.rankChange && (
          <span
            className={'rank-change ' + (team.rankChange.delta < 0 ? 'rank-change--up' : 'rank-change--down')}
            style={{ '--rc-ts': team.rankChange.ts }}
            aria-label={`Position ${team.rankChange.delta < 0 ? 'up' : 'down'} ${Math.abs(team.rankChange.delta)}`}
          >
            {team.rankChange.delta < 0 ? '▲' : '▼'}{Math.abs(team.rankChange.delta)}
          </span>
        )}
      </span>
      <span className="team-row__name">
        <span className="team-row__name-text">{team.name}</span>
        {team.badges?.map((b, i) => (
          <TrophyBadge key={b.type + i} type={b.type} color={b.color} tooltip={b.tooltip} />
        ))}
        {team.isChampion && <span className="badge badge--champ">CHAMP</span>}
        {team.isRelegated && <span className="badge badge--rel">REL</span>}
      </span>
      <span className="team-row__pts">
        {team.points}
        {team.gamesInHand > 0 && (
          <sup className="games-in-hand" title={`${team.gamesInHand} game(s) in hand`}>
            +{team.gamesInHand}
          </sup>
        )}
      </span>
      <span className="team-row__gd">{formatGD(team.gd)}</span>
      <span className="team-row__gp">{team.played}</span>
    </div>
  );
}
