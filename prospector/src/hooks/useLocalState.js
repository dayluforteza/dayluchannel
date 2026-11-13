import { useEffect, useState } from 'react';
import { load, save } from '../lib/storage';

/** useState que persiste en localStorage. */
export function useLocalState(key, initial) {
  const [value, setValue] = useState(() => load(key, initial));
  useEffect(() => save(key, value), [key, value]);
  return [value, setValue];
}
