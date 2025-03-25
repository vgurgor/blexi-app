'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 hover:bg-white/5 dark:hover:bg-white/5 hover:bg-gray-100 rounded-lg relative group transition-colors"
      title={theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
      ) : (
        <Moon className="h-5 w-5 text-gray-600 group-hover:text-cyan-600 transition-colors" />
      )}
    </button>
  );
}