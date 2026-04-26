import { useEffect, useState } from 'react';
import TeamRow from './TeamRow.jsx';
import { ordinal } from '../utils/formatters.js';
import { formatTimeAgo } from '../utils/timeAgo.js';

// Re-renders this column once a minute so the "Updated X min ago" label
// stays current without a full-table tick.
function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export default function LeagueColumn({ data, flipLeft }) {
  if (!data) return null;
  const { league, teams, currentMatchday, fetchedAt, stale } = data;
  const now = useNow();
  const ago = formatTimeAgo(fetchedAt, now);

  return (
    <section className="league-col" aria-label={`${league.name} standings`}>
      <header className="league-col__header">
        <div className="league-col__title-row">
          <span className="league-col__flag" aria-hidden="true">{league.flag}</span>
          <h2 className="league-col__name">{league.name}</h2>
        </div>
        <div className="league-col__meta">
          <span>MD {currentMatchday} of {league.totalMatchdays}</span>
          <span className="league-col__rank">{ordinal(league.uefaRank)} UEFA</span>
        </div>
      </header>

      <div className="league-col__col-headers" role="row">
        <span>#</span>
        <span>Club</span>
        <span>Pts</span>
        <span>GD</span>
        <span>GP</span>
      </div>

      <div className="league-col__rows" role="rowgroup">
        {teams.map((t) => (
          <TeamRow key={t.name} team={t} flipLeft={flipLeft} />
        ))}
      </div>

      {ago && (
        <div
          className={'league-col__updated' + (stale ? ' is-stale' : '')}
          title={fetchedAt ? new Date(fetchedAt).toLocaleString() : ''}
        >
          Updated {ago}
        </div>
      )}
    </section>
  );
}
