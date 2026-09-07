import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Persist state in localStorage. Reads once after hydration (never in the
 * useState initializer) so SSR markup and first client render match.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validate?: (value: unknown) => value is T
) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);
  const validateRef = useRef(validate);
  validateRef.current = validate;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw);
        const check = validateRef.current;
        if (!check || check(parsed)) {
          setValue(parsed as T);
        }
      }
    } catch {
      /* corrupt or unavailable storage — keep the seed value */
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or disabled — stay in-memory */
    }
  }, [key, value, hydrated]);

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }, [key]);

  return [value, setValue, { hydrated, clear }] as const;
}
