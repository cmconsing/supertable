import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';
import ZoneLegend from './ZoneLegend.jsx';
import { useLegend } from '../hooks/useLegend.js';
import { SEASON_LABEL } from '../config/leagues.js';

// The football-data key now lives server-side, so the client can't introspect
// it. "Live" simply means we're not in mock mode — if the proxy isn't
// configured the request will surface as an error in StatusBar.
const IS_LIVE = import.meta.env.VITE_USE_MOCK_DATA !== 'true';

export default function Header() {
  const { open, setOpen, toggle } = useLegend();
  const wrapperRef = useRef(null);

  // Click / tap outside the legend dismisses it. Only attach the listener
  // while open so we're not running it for nothing.
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open, setOpen]);

  return (
    <header className="app-header">
      <div className="app-header__left">
        <span className="wordmark">SuperTable</span>
        <span className="season">{SEASON_LABEL}</span>
        {IS_LIVE && (
          <span className="live-pill" aria-label="Live data from API-Football">
            <span className="live-pill__dot" aria-hidden="true" />
            LIVE
          </span>
        )}
      </div>

      <nav className="app-nav" aria-label="Primary">
        <NavLink to="/" end className={({ isActive }) => 'nav-link' + (isActive ? ' is-active' : '')}>
          SuperTable
        </NavLink>
        <NavLink to="/ucl-race" className={({ isActive }) => 'nav-link' + (isActive ? ' is-active' : '')}>
          UCL Race
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => 'nav-link' + (isActive ? ' is-active' : '')}>
          About
        </NavLink>
      </nav>

      <div className="app-header__right">
        <div className="legend-wrapper" ref={wrapperRef}>
          <button
            type="button"
            className="legend-toggle"
            onClick={toggle}
            aria-expanded={open}
            aria-controls="legend-panel"
          >
            <span className="legend-toggle__label">Legend</span>
            <span className="legend-toggle__chevron" aria-hidden="true">{open ? '▴' : '▾'}</span>
          </button>
          <div
            id="legend-panel"
            className={'legend-panel' + (open ? ' is-open' : '')}
            aria-hidden={!open}
          >
            <ZoneLegend />
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
