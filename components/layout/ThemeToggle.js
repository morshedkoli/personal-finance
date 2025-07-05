'use client';

import { useTheme } from '@/app/ThemeProvider';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
      aria-label="Toggle dark mode"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <SunIcon className="h-5 w-5 text-yellow-400 hover:text-yellow-500 transition-colors" aria-hidden="true" />
      ) : (
        <MoonIcon className="h-5 w-5 text-primary/80 hover:text-primary transition-colors" aria-hidden="true" />
      )}
    </button>
  );
}