import React from 'react';
import { LocationIcon, UserIcon, SunIcon, MoonIcon, SearchIcon } from './Icons';

interface HeaderProps {
    title: string;
    themeMode: 'light' | 'dark';
    toggleTheme: () => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    // Canvas-specific props
    canvasMode?: 'DO' | 'REVIEW' | 'PLAN';
    onCanvasModeChange?: (mode: 'DO' | 'REVIEW' | 'PLAN') => void;
    onCanvasInsertFrame?: (frameType: 'task-list' | 'project-card' | 'calendar' | 'notes', filterType?: 'today' | 'tomorrow' | 'week') => void;
    // Auth props
    userEmail?: string;
    onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  themeMode,
  toggleTheme,
  searchQuery,
  onSearchChange,
  canvasMode,
  onCanvasModeChange,
  onCanvasInsertFrame,
  userEmail,
  onSignOut
}) => {
  const isDark = themeMode === 'dark';
  const isCanvasPage = title === 'Canvas';

  return (
    <header className="flex-shrink-0 border-b border-border">
      {/* Top row: Title and Search */}
      <div className="flex items-center justify-between p-4 md:px-8 md:py-6 gap-4">
        <div className="flex items-center pl-12 lg:pl-0">
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
              placeholder="Search..."
              className="w-full bg-black/5 dark:bg-white/5 text-text-primary placeholder-text-secondary rounded-full py-2.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 border border-transparent"
              aria-label="Search notes"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {userEmail && onSignOut && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary hidden md:inline">{userEmail}</span>
              <button
                onClick={onSignOut}
                className="px-3 py-1.5 text-sm bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Canvas toolbar - integrated seamlessly */}
      {isCanvasPage && canvasMode && onCanvasModeChange && onCanvasInsertFrame && (
        <div className="px-4 md:px-8 pb-3 pt-1 border-t border-border">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-text-muted mr-1">Mode:</span>
            <button
              onClick={() => onCanvasModeChange('DO')}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                canvasMode === 'DO'
                  ? 'bg-accent-primary text-white'
                  : isDark ? 'bg-gray-800 text-gray-400 hover:text-gray-200' : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              🔥 DO
            </button>
            <button
              onClick={() => onCanvasModeChange('REVIEW')}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                canvasMode === 'REVIEW'
                  ? 'bg-accent-primary text-white'
                  : isDark ? 'bg-gray-800 text-gray-400 hover:text-gray-200' : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 REVIEW
            </button>
            <button
              onClick={() => onCanvasModeChange('PLAN')}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                canvasMode === 'PLAN'
                  ? 'bg-accent-primary text-white'
                  : isDark ? 'bg-gray-800 text-gray-400 hover:text-gray-200' : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              🧠 PLAN
            </button>

            <div className={`w-px h-3 mx-1 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>

            <button onClick={() => onCanvasInsertFrame('task-list')} className={`px-2 py-0.5 rounded text-xs transition-colors ${isDark ? 'bg-gray-800 text-gray-400 hover:text-gray-200' : 'bg-gray-100 text-gray-600 hover:text-gray-900'}`}>
              📋 Tasks
            </button>
            <button onClick={() => onCanvasInsertFrame('project-card')} className={`px-2 py-0.5 rounded text-xs transition-colors ${isDark ? 'bg-gray-800 text-gray-400 hover:text-gray-200' : 'bg-gray-100 text-gray-600 hover:text-gray-900'}`}>
              📊 Projects
            </button>
            <button onClick={() => onCanvasInsertFrame('calendar')} className={`px-2 py-0.5 rounded text-xs transition-colors ${isDark ? 'bg-gray-800 text-gray-400 hover:text-gray-200' : 'bg-gray-100 text-gray-600 hover:text-gray-900'}`}>
              📅 Calendar
            </button>
            <button onClick={() => onCanvasInsertFrame('notes')} className={`px-2 py-0.5 rounded text-xs transition-colors ${isDark ? 'bg-gray-800 text-gray-400 hover:text-gray-200' : 'bg-gray-100 text-gray-600 hover:text-gray-900'}`}>
              📝 Notes
            </button>

            <div className={`w-px h-3 mx-1 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>

            <button onClick={() => onCanvasInsertFrame('task-list', 'today')} className={`px-2 py-0.5 rounded text-xs transition-colors ${isDark ? 'bg-blue-900 text-blue-300 hover:text-blue-100' : 'bg-blue-50 text-blue-700 hover:text-blue-900'}`}>
              ☀️ Today
            </button>
            <button onClick={() => onCanvasInsertFrame('task-list', 'tomorrow')} className={`px-2 py-0.5 rounded text-xs transition-colors ${isDark ? 'bg-purple-900 text-purple-300 hover:text-purple-100' : 'bg-purple-50 text-purple-700 hover:text-purple-900'}`}>
              🌙 Tomorrow
            </button>
            <button onClick={() => onCanvasInsertFrame('task-list', 'week')} className={`px-2 py-0.5 rounded text-xs transition-colors ${isDark ? 'bg-green-900 text-green-300 hover:text-green-100' : 'bg-green-50 text-green-700 hover:text-green-900'}`}>
              📆 This Week
            </button>
          </div>
        </div>
      )}
    </header>
  );
};