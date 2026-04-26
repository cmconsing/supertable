import { useEffect, useState } from 'react';
import { LEAGUES } from '../config/leagues.js';
import { formatTimeAgo, getCacheStatus } from '../utils/timeAgo.js';
import { isDevPanelEnabled } from '../hooks/useDevPanelEnabled.js';

// Floating bottom-right panel showing per-league cache freshness with a
// "Force refresh all leagues" button. Always visible in `vite dev`; hidden
// in production unless explicitly enabled via ?dev=1.
export default function DevPanel({ standings, refreshing, onRefresh, error }) {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!isDevPanelEnabled()) return null;

  return (
    <aside className={'dev-panel' + (open ? ' is-open' : '')} aria-label="Cache dev tools">
      <button
        type="button"
        className="dev-panel__chip"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="dev-panel__chip-dot" />
        Dev {open ? '▾' : '▴'}
      </button>

      {open && (
        <div className="dev-panel__body">
          <div className="dev-panel__header">
            <span className="dev-panel__title">Cache status</span>
            <div className="dev-panel__header-actions">
              <button
                type="button"
                className="dev-panel__refresh"
                onClick={onRefresh}
                disabled={refreshing}
              >
                {refreshing ? 'Refreshing…' : 'Force refresh all'}
              </button>
              <button
                type="button"
                className="dev-panel__close"
                onClick={() => setOpen(false)}
                aria-label="Close dev panel"
                title="Close"
              >×</button>
            </div>
          </div>

          <ul className="dev-panel__leagues">
            {LEAGUES.map((l) => {
              const data = standings[l.id];
              const fetchedAt = data?.fetchedAt ?? null;
              const status = getCacheStatus(fetchedAt, now);
              return (
                <li key={l.id} className="dev-panel__league" data-status={status}>
                  <span
                    className={'dev-panel__dot dev-panel__dot--' + status}
                    aria-label={`Cache ${status}`}
                  />
                  <span className="dev-panel__league-id">{l.id}</span>
                  <span className="dev-panel__league-flag" aria-hidden="true">{l.flag}</span>
                  <span className="dev-panel__time">
                    {fetchedAt ? formatTimeAgo(fetchedAt, now) : '—'}
                  </span>
                </li>
              );
            })}
          </ul>

          {error && <div className="dev-panel__error">{error}</div>}

          <div className="dev-panel__legend">
            <span><i className="dev-panel__dot dev-panel__dot--fresh" /> &lt;30 min</span>
            <span><i className="dev-panel__dot dev-panel__dot--aging" /> 30 min–2 hr</span>
            <span><i className="dev-panel__dot dev-panel__dot--stale" /> &gt;2 hr</span>
          </div>
        </div>
      )}
    </aside>
  );
}
