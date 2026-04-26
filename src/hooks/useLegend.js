import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'supertable-legend-open';
const FIRST_VISIT_AUTO_COLLAPSE_MS = 8000;
const MOBILE_QUERY = '(max-width: 720px)';

// Returns the persisted preference plus a first-visit flag. On first visit
// (no stored value), the default is "expanded on desktop, collapsed on mobile".
function readInitial() {
  if (typeof window === 'undefined') return { open: true, isFirstVisit: false };
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'true') return { open: true, isFirstVisit: false };
  if (stored === 'false') return { open: false, isFirstVisit: false };
  const isMobile = window.matchMedia(MOBILE_QUERY).matches;
  return { open: !isMobile, isFirstVisit: true };
}

// Open/closed state for the legend panel, with localStorage persistence and
// a first-visit auto-collapse so the user sees the legend once but doesn't
// have it eat space forever.
export function useLegend() {
  const [{ open, isFirstVisit }, setState] = useState(readInitial);

  const setOpen = useCallback((next) => {
    setState({ open: next, isFirstVisit: false });
    try { localStorage.setItem(STORAGE_KEY, String(next)); } catch {}
  }, []);

  const toggle = useCallback(() => {
    setState((s) => {
      const next = !s.open;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch {}
      return { open: next, isFirstVisit: false };
    });
  }, []);

  // First visit + currently open: schedule an auto-collapse after 8s. The
  // CSS transition handles the smooth fade.
  useEffect(() => {
    if (!isFirstVisit || !open) return;
    const t = setTimeout(() => {
      setState({ open: false, isFirstVisit: false });
      try { localStorage.setItem(STORAGE_KEY, 'false'); } catch {}
    }, FIRST_VISIT_AUTO_COLLAPSE_MS);
    return () => clearTimeout(t);
  }, [isFirstVisit, open]);

  return { open, setOpen, toggle };
}
