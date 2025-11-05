import React from 'react';
import { LocationIcon, UserIcon, SunIcon, MoonIcon, SearchIcon } from './Icons';

interface HeaderProps {
    title: string;
    themeMode: 'light' | 'dark';
    toggleTheme: () => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ title, themeMode, toggleTheme, searchQuery, onSearchChange }) => {
  return (
    <header className="flex-shrink-0 flex items-center justify-between p-4 md:px-8 md:py-6 gap-4">
      <div className="flex items-center">
         <h1 className="text-2xl md:text-3xl font-bold text-text-primary whitespace-nowrap">{title}</h1>
      </div>

      <div className="flex-1 flex justify-center px-4 lg:px-8">
        <div className="relative w-full max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-text-secondary" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes..."
            className="w-full bg-black/5 dark:bg-white/5 text-text-primary placeholder-text-secondary rounded-full py-2.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 border border-transparent"
            aria-label="Search notes"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Toggle dark mode"
          title={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
        >
          {themeMode === 'light' ? <MoonIcon className="w-6 h-6 text-text-primary" /> : <SunIcon className="w-6 h-6 text-text-primary" />}
        </button>
      </div>
    </header>
  );
};