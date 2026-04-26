import { useEffect, useRef, useState } from 'react';
import TrophyBadge from './TrophyBadge.jsx';
import { ZONE_LABELS } from '../config/qualificationRules.js';
import { formatGD } from '../utils/formatters.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';

// Hover card / mobile sheet are temporarily disabled — football-data.org's
// free tier doesn't include team form, and we haven't wired the fixtures
// endpoint, so the popup just repeats Pts/GD/GP that are already on the row.
//
// What's still here:
//   - badge `title` attributes + the row `title` attribute (cascadeNote)
//     for trophy / cascade info via native browser tooltip
//   - team-name truncation detection: when the displayed name is cut off,
//     desktop gets a native `title` tooltip; mobile gets a tap-to-reveal
//     floating popover that auto-dismisses

const TIP_DURATION_MS = 2500;

export default function TeamRow({ team }) {
  const isMobile = useMediaQuery('(max-width: 720px)');

  // Long-form team name shown in the tooltip. football-data sends both
  // `name` (short) and `fullName` (long) — fall back to the short one if
  // for whatever reason the long version is missing.
  const longName = team.fullName ?? team.name;

  // Truncation detection on the name span. Re-checked when the layout
  // resizes (orientation change, column width change, etc.).
  const nameRef = useRef(null);
  const [truncated, setTruncated] = useState(false);
  useEffect(() => {
    const el = nameRef.current;
    if (!el) return;
    const check = () => setTruncated(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [team.name]);

  // Mobile tap-to-reveal tooltip — uses position: fixed so it escapes the
  // column's overflow clipping. Auto-dismisses after a short delay.
  const [tipRect, setTipRect] = useState(null);
  useEffect(() => {
    if (!tipRect) return;
    const t = setTimeout(() => setTipRect(null), TIP_DURATION_MS);
    return () => clearTimeout(t);
  }, [tipRect]);

  const handleNameClick = (e) => {
    if (!isMobile || !truncated) return;
    e.stopPropagation();
    if (nameRef.current) setTipRect(nameRef.current.getBoundingClientRect());
  };

  return (
    <div
      className="team-row"
      data-zone={team.zone}
      role="row"
      title={team.cascadeNote || undefined}
      aria-label={`${team.rank}. ${longName} — ${team.points} points${
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
        <span
          ref={nameRef}
          className="team-row__name-text"
          // Desktop: native browser tooltip on hover, only when truncated.
          title={truncated && !isMobile ? longName : undefined}
          onClick={handleNameClick}
        >
          {team.name}
        </span>
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

      {tipRect && (
        <span
          className="name-tip"
          role="tooltip"
          style={{
            left: tipRect.left,
            top: Math.max(8, tipRect.top - 36),
          }}
        >
          {longName}
        </span>
      )}
    </div>
  );
}
