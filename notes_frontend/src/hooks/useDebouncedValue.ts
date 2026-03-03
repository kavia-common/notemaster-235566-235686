"use client";

import { useEffect, useState } from "react";

// PUBLIC_INTERFACE
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  /** Debounces a value by delayMs. Useful for search inputs. */
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}
