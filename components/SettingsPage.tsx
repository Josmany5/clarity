import React, { useState, useEffect } from 'react';
import { WidgetCard } from './WidgetCard';
import { SettingsIcon } from './Icons';
import { setUsePremiumVoice as saveVoicePreference } from '../services/AIService';

interface SettingsPageProps {
  themeStyle: 'minimalist' | 'glass' | 'terminal' | 'pastel';
  themeMode: 'light' | 'dark';
  onThemeStyleChange: (style: 'minimalist' | 'glass' | 'terminal' | 'pastel') => void;
  onThemeModeChange: (mode: 'light' | 'dark') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ themeStyle, themeMode, onThemeStyleChange, onThemeModeChange }) => {
  const [usePremiumVoice, setUsePremiumVoice] = useState(false);

  // Load existing preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('usePremiumVoice') === 'true';
      setUsePremiumVoice(saved);
    } catch {}
  }, []);

  const handleTogglePremiumVoice = (value: boolean) => {
    setUsePremiumVoice(value);
    saveVoicePreference(value);
  };

  const themes = [
    { id: 'minimalist' as const, name: 'Minimalist', description: 'Clean modern design', icon: '✨' },
    { id: 'glass' as const, name: 'Glass', description: 'Glassmorphic aesthetic', icon: '💎' },
    { id: 'terminal' as const, name: 'Terminal', description: 'Retro terminal style', icon: '⌨️' },
    { id: 'pastel' as const, name: 'Pastel', description: 'Soft rounded design', icon: '🎨' },
  ];
  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const data = {
      notes: localStorage.getItem('notes'),
      tasks: localStorage.getItem('tasks'),
      projects: localStorage.getItem('projects'),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clarity-dashboard-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* AI Assistant */}
      <WidgetCard>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <span className="text-3xl mr-3">🤖</span>
            <h2 className="text-2xl font-bold text-text-primary">AI Assistant</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-blue-500/10 border-l-4 border-blue-500 rounded-lg">
              <p className="text-sm text-text-primary font-semibold mb-2">Voice-Powered AI</p>
              <p className="text-sm text-text-secondary">
                Click the AI button in the bottom-right corner to chat with your AI assistant. Use voice input to create tasks, ask questions, and get insights about your productivity.
              </p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-black/5 dark:bg-white/5 rounded-lg">
              <input
                type="checkbox"
                id="premiumVoice"
                checked={usePremiumVoice}
                onChange={(e) => handleTogglePremiumVoice(e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="premiumVoice" className="flex-1 cursor-pointer">
                <span className="font-semibold text-text-primary block">Enable Premium Voice (ElevenLabs)</span>
                <span className="text-xs text-text-secondary">
                  High-quality AI voice responses. Requires server configuration.
                </span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-3 bg-green-500/10 rounded-lg text-center">
                <div className="text-2xl mb-1">🎤</div>
                <div className="text-xs text-text-secondary">Voice Input</div>
                <div className="text-sm font-semibold text-text-primary mt-1">FREE</div>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg text-center">
                <div className="text-2xl mb-1">🧠</div>
                <div className="text-xs text-text-secondary">AI Intelligence</div>
                <div className="text-sm font-semibold text-text-primary mt-1">Gemini 1.5</div>
              </div>
            </div>
          </div>
        </div>
      </WidgetCard>

      {/* Appearance Settings */}
      <WidgetCard>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <SettingsIcon className="w-8 h-8 text-accent mr-3" />
            <h2 className="text-2xl font-bold text-text-primary">Appearance</h2>
          </div>
          <div className="space-y-6">
            {/* Light/Dark Mode Toggle */}
            <div>
              <h3 className="font-semibold text-text-primary mb-3">Appearance Mode</h3>
              <p className="text-sm text-text-secondary mb-4">Choose between light and dark mode</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => onThemeModeChange('light')}
                  className={`p-5 rounded-xl text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent ${
                    themeMode === 'light'
                      ? 'bg-accent text-white shadow-lg scale-105'
                      : 'bg-black/5 dark:bg-white/5 text-text-primary hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">☀️</span>
                      <div>
                        <h4 className="font-bold text-lg">Light Mode</h4>
                        <p className={`text-sm ${themeMode === 'light' ? 'text-white/90' : 'text-text-secondary'}`}>
                          Bright & Clear
                        </p>
                      </div>
                    </div>
                    {themeMode === 'light' && (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => onThemeModeChange('dark')}
                  className={`p-5 rounded-xl text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent ${
                    themeMode === 'dark'
                      ? 'bg-accent text-white shadow-lg scale-105'
                      : 'bg-black/5 dark:bg-white/5 text-text-primary hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🌙</span>
                      <div>
                        <h4 className="font-bold text-lg">Dark Mode</h4>
                        <p className={`text-sm ${themeMode === 'dark' ? 'text-white/90' : 'text-text-secondary'}`}>
                          Easy on Eyes
                        </p>
                      </div>
                    </div>
                    {themeMode === 'dark' && (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Theme Style Selection */}
            <div>
              <h3 className="font-semibold text-text-primary mb-3">Theme Style</h3>
              <p className="text-sm text-text-secondary mb-4">Choose from our beautifully crafted theme styles</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onThemeStyleChange(t.id)}
                    className={`p-5 rounded-xl text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent ${
                      themeStyle === t.id
                        ? 'bg-accent text-white shadow-lg scale-105'
                        : 'bg-black/5 dark:bg-white/5 text-text-primary hover:bg-black/10 dark:hover:bg-white/10 hover:scale-102'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{t.icon}</span>
                          <h4 className="font-bold text-lg">{t.name}</h4>
                        </div>
                        <p className={`text-sm ${themeStyle === t.id ? 'text-white/90' : 'text-text-secondary'}`}>
                          {t.description}
                        </p>
                      </div>
                      {themeStyle === t.id && (
                        <div className="ml-2">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </WidgetCard>

      {/* Data Management */}
      <WidgetCard>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Data Management</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-lg">
              <div>
                <h3 className="font-semibold text-text-primary">Export Data</h3>
                <p className="text-sm text-text-secondary">Download all your data as JSON</p>
              </div>
              <button
                onClick={handleExportData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Export
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-lg">
              <div>
                <h3 className="font-semibold text-text-primary">Clear All Data</h3>
                <p className="text-sm text-text-secondary">Delete all notes, tasks, and projects</p>
              </div>
              <button
                onClick={handleClearAllData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      </WidgetCard>

      {/* Storage Info */}
      <WidgetCard>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Storage Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-lg text-center">
              <div className="text-3xl font-bold text-accent">
                {JSON.parse(localStorage.getItem('notes') || '[]').length}
              </div>
              <div className="text-sm text-text-secondary mt-1">Notes</div>
            </div>
            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-lg text-center">
              <div className="text-3xl font-bold text-accent">
                {JSON.parse(localStorage.getItem('tasks') || '[]').length}
              </div>
              <div className="text-sm text-text-secondary mt-1">Tasks</div>
            </div>
            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-lg text-center">
              <div className="text-3xl font-bold text-accent">
                {JSON.parse(localStorage.getItem('projects') || '[]').length}
              </div>
              <div className="text-sm text-text-secondary mt-1">Projects</div>
            </div>
          </div>
        </div>
      </WidgetCard>

      {/* About */}
      <WidgetCard>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-text-primary mb-4">About Clarity Dashboard</h2>
          <p className="text-text-secondary mb-4">
            A modern productivity dashboard for managing your notes, tasks, and projects with an elegant glassmorphic design.
          </p>
          <div className="text-sm text-text-secondary space-y-2">
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>Features:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Notes with search and filtering</li>
              <li>Task management with Eisenhower Matrix</li>
              <li>Project tracking with status management</li>
              <li>Focus timer (Pomodoro technique)</li>
              <li>8 theme combinations (4 styles × light/dark modes)</li>
              <li>Local data storage</li>
            </ul>
          </div>
        </div>
      </WidgetCard>

      {/* Keyboard Shortcuts */}
      <WidgetCard>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Keyboard Shortcuts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between p-2 bg-black/5 dark:bg-white/5 rounded">
              <span className="text-text-secondary">New Note</span>
              <kbd className="px-2 py-1 bg-black/10 dark:bg-white/10 rounded text-text-primary font-mono">Ctrl+N</kbd>
            </div>
            <div className="flex justify-between p-2 bg-black/5 dark:bg-white/5 rounded">
              <span className="text-text-secondary">Search</span>
              <kbd className="px-2 py-1 bg-black/10 dark:bg-white/10 rounded text-text-primary font-mono">Ctrl+K</kbd>
            </div>
            <div className="flex justify-between p-2 bg-black/5 dark:bg-white/5 rounded">
              <span className="text-text-secondary">Toggle Dark Mode</span>
              <kbd className="px-2 py-1 bg-black/10 dark:bg-white/10 rounded text-text-primary font-mono">Ctrl+D</kbd>
            </div>
            <div className="flex justify-between p-2 bg-black/5 dark:bg-white/5 rounded">
              <span className="text-text-secondary">Dashboard</span>
              <kbd className="px-2 py-1 bg-black/10 dark:bg-white/10 rounded text-text-primary font-mono">Ctrl+H</kbd>
            </div>
          </div>
        </div>
      </WidgetCard>
    </div>
  );
};
