import { useEffect, useState } from 'react';
import { load, save } from '../lib/storage';

export function useTheme() {
  const [theme, setTheme] = useState(() => load('prospector.theme', null) ?? (document.documentElement.classList.contains('dark') ? 'dark' : 'light'));
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#09090b' : '#fafafa');
    save('prospector.theme', theme);
  }, [theme]);
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))];
}
