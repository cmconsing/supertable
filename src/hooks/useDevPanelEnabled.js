// Gates visibility of the floating cache-status DevPanel.
//
// Rules:
//   - Always visible in `vite dev` (import.meta.env.DEV === true).
//   - Hidden by default in production builds.
//   - Toggleable in production via URL params (persisted to localStorage):
//       ?dev=1 → enable
//       ?dev=0 → disable

const KEY = 'supertable.devPanel';

export function isDevPanelEnabled() {
  if (typeof window === 'undefined') return false;
  if (import.meta.env.DEV) return true;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('dev') === '1') {
      localStorage.setItem(KEY, 'true');
      return true;
    }
    if (params.get('dev') === '0') {
      localStorage.removeItem(KEY);
      return false;
    }
    return localStorage.getItem(KEY) === 'true';
  } catch {
    return false;
  }
}
