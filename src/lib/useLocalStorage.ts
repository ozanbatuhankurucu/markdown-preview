"use client";

import { useCallback, useSyncExternalStore } from "react";

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

const emptySubscribe = () => () => {};
const returnTrue = () => true;
const returnFalse = () => false;
const returnNull = () => null;

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const getSnapshot = useCallback(() => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }, [key]);

  const raw = useSyncExternalStore(subscribeToStorage, getSnapshot, returnNull);
  const isHydrated = useSyncExternalStore(emptySubscribe, returnTrue, returnFalse);

  let value: T = initialValue;
  if (raw !== null) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed !== undefined) {
        value = parsed;
      }
    } catch {
      // Corrupted JSON — will be overwritten on next edit
    }
  }

  const setValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      let current = initialValue;
      try {
        const item = window.localStorage.getItem(key);
        if (item !== null) {
          current = JSON.parse(item);
        }
      } catch {
        // fall back to initialValue
      }

      const resolved = newValue instanceof Function ? newValue(current) : newValue;
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // quota exceeded or unavailable
      }

      window.dispatchEvent(new StorageEvent("storage", { key }));
    },
    [key, initialValue]
  );

  return [value, setValue, isHydrated];
}
