// Compact "Updated X min ago" formatter for the column header indicator.
export function formatTimeAgo(timestamp, now = Date.now()) {
  if (!timestamp) return '';
  const ms = now - new Date(timestamp).getTime();
  const sec = Math.max(0, Math.floor(ms / 1000));
  if (sec < 30) return 'just now';
  if (sec < 60) return 'less than 1 min ago';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  return `${day} day${day === 1 ? '' : 's'} ago`;
}

// Cache freshness bucket — drives the dev panel dot color.
//   fresh: <30 min   (green)
//   aging: 30 min – 2 hr (amber)
//   stale: >2 hr     (red)
export function getCacheStatus(timestamp, now = Date.now()) {
  if (!timestamp) return 'unknown';
  const ageMin = (now - new Date(timestamp).getTime()) / 60_000;
  if (ageMin < 30) return 'fresh';
  if (ageMin < 120) return 'aging';
  return 'stale';
}
