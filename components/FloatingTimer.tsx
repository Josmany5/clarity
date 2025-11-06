import React, { useEffect, useState } from 'react';

interface FloatingTimerProps {
  duration: number;
  timeRemaining: number;
  isActive: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export const FloatingTimer: React.FC<FloatingTimerProps> = ({
  duration,
  timeRemaining,
  isActive,
  onPause,
  onResume,
  onStop,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const progress = ((duration - timeRemaining) / duration) * 100;

  const formatTime = (mins: number, secs: number) => {
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-4 right-16 md:right-24 z-40">
      <div
        className={`bg-card-bg backdrop-blur-xl border-2 border-accent shadow-2xl rounded-2xl transition-all duration-300 ${
          isExpanded ? 'w-80' : 'w-48'
        }`}
      >
        {/* Compact View */}
        {!isExpanded && (
          <div
            onClick={() => setIsExpanded(true)}
            className="p-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors rounded-2xl"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                  <svg className="transform -rotate-90 w-12 h-12">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-text-secondary opacity-20"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 20}`}
                      strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
                      className="text-accent transition-all duration-1000"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-accent">⏱️</span>
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-text-primary tabular-nums">
                    {formatTime(minutes, seconds)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expanded View */}
        {isExpanded && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-text-primary">Focus Timer</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Minimize"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Progress Ring */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-32 h-32 mb-4">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-text-secondary opacity-20"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 58}`}
                    strokeDashoffset={`${2 * Math.PI * 58 * (1 - progress / 100)}`}
                    className="text-accent transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-text-primary tabular-nums">
                    {formatTime(minutes, seconds)}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              <button
                onClick={isActive ? onPause : onResume}
                className="flex-1 px-4 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-secondary transition-colors text-base"
              >
                {isActive ? '⏸' : '▶️'}
              </button>
              <button
                onClick={onStop}
                className="px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors text-base"
              >
                ⏹
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
