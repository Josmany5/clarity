import React, { useState, useEffect } from 'react';
import { WidgetCard } from './WidgetCard';

const TOTAL_SECONDS = 25 * 60;

export const FocusTimer: React.FC = () => {
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_SECONDS);
  const [isActive, setIsActive] = useState(false);

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
    if (timeRemaining === 0) setTimeRemaining(TOTAL_SECONDS);
    setIsActive(!isActive);
  };

  const resetTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActive(false);
    setTimeRemaining(TOTAL_SECONDS);
  };

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeRemaining / TOTAL_SECONDS) * 100;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      onClick={toggleTimer}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleTimer()}
      role="button"
      tabIndex={0}
      aria-label={isActive ? 'Pause focus timer' : 'Start focus timer'}
      className="cursor-pointer transition-transform duration-200 hover:scale-[1.03] hover:shadow-xl rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent"
    >
      <WidgetCard className="flex items-center justify-between">
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
          {(isActive || timeRemaining !== TOTAL_SECONDS) && (
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
  );
};