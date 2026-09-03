"use client";

import { useEffect, useState } from "react";

/**
 * Returns `value` after it has stopped changing for `delay` ms.
 *
 * Used by the catalog search box so typing does not fire a request per
 * keystroke.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    // Clearing on every change is what makes this a debounce rather than a
    // series of delayed updates.
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
