import { useState, useEffect, Dispatch, SetStateAction } from 'react';

function getStorageValue<T,>(key: string, defaultValue: T): T {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
        return JSON.parse(saved);
    } catch (e) {
        return defaultValue;
    }
  }
  return defaultValue;
}

export function useLocalStorage<T,>(baseKey: string, defaultValue: T, profileId?: number): [T, Dispatch<SetStateAction<T>>] {
  const key = profileId ? `profile-${profileId}-${baseKey}` : baseKey;
  
  const [value, setValue] = useState<T>(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}