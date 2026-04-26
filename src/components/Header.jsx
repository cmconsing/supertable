import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';
import ZoneLegend from './ZoneLegend.jsx';
import { useLegend } from '../hooks/useLegend.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import { SEASON_LABEL } from '../config/leagues.js';

// The football-data key now lives server-side, so the client can't introspect
// it. "Live" simply means we're not in mock mode — if the proxy isn't
// configured the request will surface as an error in StatusBar.
const IS_LIVE = import.meta.env.VITE_USE_MOCK_DATA !== 'true';

const NAV_LINKS = [
  { to: '/',          label: 'SuperTable', end: true },
  { to: '/ucl-race',  label: 'UCL Race' },
  { to: '/about',     label: 'About' },
];

export default function Header() {
  const isMobile = useMediaQuery('(max-width: 720px)');
  return isMobile ? <MobileHeader /> : <DesktopHeader />;
}

// =============================================================================
// Desktop — unchanged from the previous design.
// =============================================================================
function DesktopHeader() {
  const { open, setOpen, toggle } = useLegend();
  const wrapperRef = useRef(null);

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
          <span className="live-pill" aria-label="Live data from football-data.org">
            <span className="live-pill__dot" aria-hidden="true" />
            LIVE
          </span>
        )}
      </div>

      <nav className="app-nav" aria-label="Primary">
        {NAV_LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => 'nav-link' + (isActive ? ' is-active' : '')}
          >
            {l.label}
          </NavLink>
        ))}
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

// =============================================================================
// Mobile — wordmark + LIVE pill + hamburger. Tap the hamburger to drop a
// full-width panel containing nav, legend, theme, and season label.
// =============================================================================
function MobileHeader() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);
  const location = useLocation();

  // Close on route change.
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Click / tap outside dismisses.
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      if (buttonRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open]);

  // Escape key closes.
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <header className={'app-header app-header--mobile' + (open ? ' is-menu-open' : '')}>
      <div className="app-header__left">
        <span className="wordmark">SuperTable</span>
        {IS_LIVE && (
          <span className="live-pill" aria-label="Live data from football-data.org">
            <span className="live-pill__dot" aria-hidden="true" />
            LIVE
          </span>
        )}
      </div>

      <button
        ref={buttonRef}
        type="button"
        className="hamburger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        <span aria-hidden="true">{open ? '✕' : '☰'}</span>
      </button>

      <div
        id="mobile-menu"
        ref={panelRef}
        className={'mobile-menu' + (open ? ' is-open' : '')}
        aria-hidden={!open}
      >
        <nav className="mobile-menu__nav" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                'mobile-menu__link' + (isActive ? ' is-active' : '')
              }
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="mobile-menu__divider" />

        <div className="mobile-menu__section">
          <div className="mobile-menu__section-label">Legend</div>
          <ZoneLegend />
        </div>

        <div className="mobile-menu__divider" />

        <div className="mobile-menu__row">
          <span className="mobile-menu__row-label">Theme</span>
          <ThemeToggle />
        </div>

        <div className="mobile-menu__row mobile-menu__row--meta">
          <span className="mobile-menu__row-label">Season</span>
          <span className="mobile-menu__row-value">{SEASON_LABEL}</span>
        </div>
      </div>
    </header>
  );
}
