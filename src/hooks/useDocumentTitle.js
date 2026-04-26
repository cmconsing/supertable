import { useEffect } from 'react';

// Sets document.title to the given string while the component is mounted.
// On unmount we don't restore — the next page's hook overwrites immediately.
export function useDocumentTitle(title) {
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);
}
