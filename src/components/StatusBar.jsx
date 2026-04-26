export default function StatusBar({ loading, error, empty }) {
  if (!loading && !error && !empty) return null;

  let tone = 'info';
  let msg = '';
  if (error) { tone = 'error'; msg = `Live data error — ${error}. Showing cached data if available.`; }
  else if (loading) { tone = 'info'; msg = 'Loading standings…'; }

  if (!msg) return null;

  return (
    <div className={'status-bar status-bar--' + tone} role="status">
      <span className="status-bar__msg">{msg}</span>
    </div>
  );
}
