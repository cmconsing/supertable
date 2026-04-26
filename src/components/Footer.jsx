// Small monospace credit line shown on every route. Lives outside <Routes>
// in App.jsx so it's permanent.
export default function Footer() {
  return (
    <footer className="app-footer">
      <span>
        Data via{' '}
        <a
          href="https://www.football-data.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          football-data.org
        </a>
      </span>
      <span className="app-footer__sep" aria-hidden="true">·</span>
      <span>Built with Claude Code</span>
    </footer>
  );
}
