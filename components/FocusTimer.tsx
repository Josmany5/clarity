import React, { useState, useEffect } from 'react';
import { WidgetCard } from './WidgetCard';

export const FocusTimer: React.FC = () => {
  const [duration, setDuration] = useState(25); // minutes
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // seconds
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (!isActive && timeRemaining !== 0) {
      clearInterval(interval);
    } else if (timeRemaining === 0) {
        setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  const toggleTimer = () => {
    if (timeRemaining === 0) setTimeRemaining(duration * 60);
    setIsActive(!isActive);
  };

  const resetTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActive(false);
    setTimeRemaining(duration * 60);
  };

  const handleDurationChange = (newDuration: number) => {
    if (newDuration >= 1 && newDuration <= 120) {
      setDuration(newDuration);
      setTimeRemaining(newDuration * 60);
      setIsActive(false);
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
        <WidgetCard className="flex items-center justify-between">
          {/* Settings Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSettings(!showSettings);
            }}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-text-secondary hover:text-text-primary"
            aria-label="Timer settings"
          >
            ⚙️
          </button>
        <div className="relative w-24 h-24">
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
        <div className="text-right flex-1">
          <p className="text-4xl font-bold text-text-primary">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </p>
          <p className="text-text-secondary mt-1">{isActive ? 'Work Session' : 'Paused'}</p>
          {(isActive || timeRemaining !== duration * 60) && (
            <button
              onClick={resetTimer}
              className="mt-2 text-xs text-text-secondary hover:text-text-primary underline"
              aria-label="Reset timer"
            >
              Reset
            </button>
          )}
        </div>
      </WidgetCard>
    </div>

    {/* Settings Modal */}
    {showSettings && (
      <div className="absolute top-full mt-2 right-0 z-50 bg-card-bg border border-card-border rounded-xl shadow-2xl p-4 w-72">
        <h4 className="text-sm font-semibold text-text-primary mb-3">Timer Duration</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="120"
              value={duration}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val)) setDuration(val);
              }}
              className="flex-1 px-3 py-2 bg-black/5 dark:bg-white/5 text-text-primary rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <span className="text-sm text-text-secondary">min</span>
          </div>
          <div className="flex gap-2">
            {[5, 15, 25, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => handleDurationChange(mins)}
                className={`flex-1 px-2 py-1 text-xs rounded-lg transition-colors ${
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