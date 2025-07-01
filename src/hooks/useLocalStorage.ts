import { useState, useEffect } from 'react';

export default function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return initial;
      }
    }
    return initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === key) {
        if (e.newValue) {
          try {
            setValue(JSON.parse(e.newValue));
          } catch {
            setValue(initial);
          }
        } else {
          setValue(initial);
        }
      }
    };
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('storage', handler);
    };
  }, [key, initial]);

  return [value, setValue] as const;
}
