import React, { useState } from 'react';
import type { Task } from '../App';

interface MiniCalendarProps {
  tasks?: Task[];
  projects?: Array<{ id: string; name: string; dueDate?: string }>;
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({ tasks = [], projects = [] }) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const hasScheduledItems = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const hasTask = tasks.some(task => task.dueDate === dateStr);
    const hasProject = projects.some(project => project.dueDate === dateStr);

    return hasTask || hasProject;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg text-text-primary">{monthName} {year}</h3>
        <div className="flex space-x-2">
            <button
              onClick={goToPreviousMonth}
              aria-label="Previous month"
              className="text-text-secondary hover:text-text-primary transition-colors px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
            >
              &lt;
            </button>
            <button
              onClick={goToNextMonth}
              aria-label="Next month"
              className="text-text-secondary hover:text-text-primary transition-colors px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
            >
              &gt;
            </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-2 text-center text-sm">
        {weekdays.map((day, index) => (
          <div key={`weekday-${index}`} className="font-semibold text-text-secondary">{day}</div>
        ))}

        {paddingDays.map((_, index) => (
            <div key={`padding-${index}`} />
        ))}

        {days.map((day) => (
          <div
            key={day}
            className={`relative p-1 rounded-full cursor-pointer dark:hover:bg-white/20 hover:bg-black/10 transition-colors ${
                isToday(day) ? 'bg-accent text-white' : 'text-text-primary'
            }`}
          >
            {day}
            {hasScheduledItems(day) && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};