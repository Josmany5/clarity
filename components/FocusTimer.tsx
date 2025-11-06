import React, { useState, useEffect } from 'react';
import { WidgetCard } from './WidgetCard';

interface FocusTimerProps {
  duration: number;
  timeRemaining: number;
  isActive: boolean;
  onDurationChange: (duration: number) => void;
  onTimeRemainingChange: (timeRemaining: number) => void;
  onIsActiveChange: (isActive: boolean) => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  duration,
  timeRemaining,
  isActive,
  onDurationChange,
  onTimeRemainingChange,
  onIsActiveChange
}) => {
  const [showSettings, setShowSettings] = useState(false);

  // Timer countdown logic has been moved to App.tsx to run globally

  const toggleTimer = () => {
    if (timeRemaining === 0) onTimeRemainingChange(duration * 60);
    onIsActiveChange(!isActive);
  };

  const resetTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    onIsActiveChange(false);
    onTimeRemainingChange(duration * 60);
  };

  const handleDurationChange = (newDuration: number) => {
    if (newDuration >= 1 && newDuration <= 90) {
      onDurationChange(newDuration);
      onTimeRemainingChange(newDuration * 60);
      onIsActiveChange(false);
      setShowSettings(false);
    }
  };

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const totalSeconds = duration * 60;
  const progress = (timeRemaining / totalSeconds) * 100;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative">
      <div
        onClick={toggleTimer}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleTimer()}
        role="button"
        tabIndex={0}
        aria-label={isActive ? 'Pause focus timer' : 'Start focus timer'}
        className="cursor-pointer transition-transform duration-200 hover:scale-[1.03] hover:shadow-xl rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <WidgetCard className="flex flex-col items-center justify-center p-6">
        <div className="relative w-24 h-24 mb-4">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              className="text-black/10 dark:text-white/10"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="50"
              cy="50"
            />
            {/* Progress circle */}
            <circle
              className="text-accent transition-all duration-300"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="50"
              cy="50"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
          </div>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold text-text-primary">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </p>
          <p className="text-text-secondary mt-1">{isActive ? 'Work Session' : 'Paused'}</p>
          <div className="flex items-center gap-2 mt-3 justify-center">
            {(isActive || timeRemaining !== duration * 60) && (
              <button
                onClick={resetTimer}
                className="text-xs text-text-secondary hover:text-text-primary underline"
                aria-label="Reset timer"
              >
                Reset
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(!showSettings);
              }}
              className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-text-secondary hover:text-text-primary text-base"
              aria-label="Timer settings"
              title="Timer settings"
            >
              ⚙️
            </button>
          </div>
        </div>
      </WidgetCard>
    </div>

    {/* Settings Modal */}
    {showSettings && (
      <div className="absolute top-full mt-2 right-0 z-50 bg-card-bg/80 backdrop-blur-xl border border-card-border rounded-xl shadow-2xl p-4 w-72">
        <h4 className="text-sm font-semibold text-text-primary mb-3">Timer Duration</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="90"
              value={duration}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val)) setDuration(val);
              }}
              className="flex-1 px-3 py-2 bg-black/5 dark:bg-white/5 text-text-primary rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <span className="text-sm text-text-secondary">min</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[5, 15, 25, 45, 60, 90].map((mins) => (
              <button
                key={mins}
                onClick={() => handleDurationChange(mins)}
                className={`px-3 py-2 text-xs rounded-lg transition-colors font-medium ${
                  duration === mins
                    ? 'bg-accent text-white'
                    : 'bg-black/5 dark:bg-white/5 text-text-secondary hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
          <button
            onClick={() => handleDurationChange(duration)}
            className="w-full px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-secondary transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    )}
  </div>
  );
};
