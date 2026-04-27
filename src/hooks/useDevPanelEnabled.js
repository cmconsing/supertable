// Gates visibility of the floating cache-status DevPanel.
//
// Rules:
//   - Always visible in `vite dev` (import.meta.env.DEV === true).
//   - Hidden in production builds.

export function isDevPanelEnabled() {
  if (typeof window === 'undefined') return false;
  return import.meta.env.DEV;
}
