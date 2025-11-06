import React, { useState } from 'react';
import type { Task } from '../App';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  endTime?: string;
  type: 'task' | 'project' | 'event';
  eventType?: 'class' | 'meeting' | 'appointment' | 'other';
  completed?: boolean;
}

interface AdvancedCalendarProps {
  events: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
}

type ViewMode = 'month' | 'week' | 'day';

export const AdvancedCalendar: React.FC<AdvancedCalendarProps> = ({ events, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const goToPrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 1);
      setCurrentDate(newDate);
    }
  };

  const goToNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 1);
      setCurrentDate(newDate);
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const getEventColor = (event: CalendarEvent) => {
    if (event.completed) return 'bg-green-500 border-green-600';
    if (event.type === 'task') return 'bg-blue-500 border-blue-600';
    if (event.type === 'project') return 'bg-purple-500 border-purple-600';
    return 'bg-orange-500 border-orange-600';
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const renderMonthView = () => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div>
        <div className="grid grid-cols-7 gap-3 mb-4">
          {weekdays.map((day, index) => (
            <div key={`weekday-${index}`} className="text-center font-bold text-text-secondary text-sm py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-3">
          {paddingDays.map((_, index) => (
            <div key={`padding-${index}`} className="aspect-square" />
          ))}
          {days.map((day) => {
            const date = new Date(year, month, day);
            const dayEvents = getEventsForDate(date);
            const isSelected = selectedDate?.toDateString() === date.toDateString();

            return (
              <button
                key={day}
                onClick={() => handleDateClick(date)}
                className={`aspect-square p-2 text-base font-semibold transition-all duration-200 relative flex flex-col items-center justify-start ${
                  isToday(date)
                    ? 'bg-accent text-white shadow-lg'
                    : isSelected
                    ? 'bg-accent/20 text-accent'
                    : 'text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div>{day}</div>
                {dayEvents.length > 0 && (
                  <div className="mt-auto flex gap-1 justify-center w-full">
                    {dayEvents.slice(0, 3).map((event, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${getEventColor(event)}`}
                        title={event.title}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });

    const timeSlots = Array.from({ length: 18 }, (_, i) => i + 5); // 5 AM to 11 PM

    return (
      <div className="overflow-auto max-h-[600px]">
        <div className="grid grid-cols-8 gap-px bg-card-border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-card-bg p-2 text-xs font-bold text-text-secondary">Time</div>
          {weekDays.map((date, i) => (
            <div
              key={i}
              className={`bg-card-bg p-2 text-center ${isToday(date) ? 'bg-accent/10' : ''}`}
            >
              <div className="text-xs font-bold text-text-secondary">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-lg font-bold ${isToday(date) ? 'text-accent' : 'text-text-primary'}`}>
                {date.getDate()}
              </div>
            </div>
          ))}

          {/* Time slots */}
          {timeSlots.map((hour) => (
            <React.Fragment key={hour}>
              <div className="bg-card-bg p-2 text-xs text-text-secondary border-t border-card-border">
                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
              {weekDays.map((date, i) => {
                const dayEvents = getEventsForDate(date).filter((event) => {
                  if (!event.time) return false;
                  const eventHour = parseInt(event.time.split(':')[0]);
                  return eventHour === hour;
                });

                return (
                  <div
                    key={i}
                    className={`bg-card-bg p-1 min-h-[60px] border-t border-card-border ${
                      isToday(date) ? 'bg-accent/5' : ''
                    }`}
                  >
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`${getEventColor(event)} text-white text-xs p-1 rounded mb-1 border-l-2`}
                      >
                        <div className={`font-semibold truncate ${event.completed ? 'line-through' : ''}`}>
                          {event.title}
                        </div>
                        {event.time && (
                          <div className="text-[10px] opacity-90">
                            {new Date(`2000-01-01T${event.time}`).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const timeSlots = Array.from({ length: 18 }, (_, i) => i + 5); // 5 AM to 11 PM
    const dayEvents = getEventsForDate(currentDate);

    return (
      <div>
        <div className="space-y-px">
          {timeSlots.map((hour) => {
            const hourEvents = dayEvents.filter((event) => {
              if (!event.time) return false;
              const eventHour = parseInt(event.time.split(':')[0]);
              return eventHour === hour;
            });

            return (
              <div key={hour} className="flex items-stretch min-h-[60px] border-b border-card-border">
                <div className="w-20 flex-shrink-0 p-3 text-xs font-medium text-text-secondary">
                  {hour === 12 ? '12:00 PM' : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                </div>
                <div className="flex-1 p-2 space-y-1">
                  {hourEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`${getEventColor(event)} text-white px-3 py-2 rounded-lg border-l-4 shadow-sm`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${event.completed ? 'line-through' : ''}`}>
                            {event.title}
                          </p>
                          {event.time && (
                            <p className="text-xs opacity-90 mt-0.5">
                              {new Date(`2000-01-01T${event.time}`).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                              {event.endTime && ` - ${new Date(`2000-01-01T${event.endTime}`).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}`}
                            </p>
                          )}
                          <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded text-[10px] uppercase tracking-wide">
                            {event.type}
                          </span>
                        </div>
                        {event.completed && (
                          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card-bg rounded-xl border border-card-border overflow-hidden flex flex-col max-h-[800px]">
      {/* Header Controls */}
      <div className="p-4 border-b border-card-border flex-shrink-0">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              {viewMode === 'month' && `${monthName} ${year}`}
              {viewMode === 'week' && `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
              {viewMode === 'day' && currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              {events.length} total events
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap" style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>
            {/* View mode selector */}
            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-lg p-1.5" style={{ pointerEvents: 'auto' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setViewMode('month');
                }}
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                  viewMode === 'month'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                Month
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setViewMode('week');
                }}
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                  viewMode === 'week'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                Week
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setViewMode('day');
                }}
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                  viewMode === 'day'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                Day
              </button>
            </div>

            {/* Navigation */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goToToday();
              }}
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              className="px-5 py-2.5 text-sm font-semibold bg-accent text-white rounded-lg hover:bg-accent-secondary transition-colors shadow-sm"
            >
              Today
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goToPrevious();
              }}
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              className="px-4 py-2.5 text-lg bg-black/5 dark:bg-white/10 text-text-primary rounded-lg hover:bg-black/10 dark:hover:bg-white/15 transition-colors"
              aria-label="Previous"
            >
              ←
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goToNext();
              }}
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              className="px-4 py-2.5 text-lg bg-black/5 dark:bg-white/10 text-text-primary rounded-lg hover:bg-black/10 dark:hover:bg-white/15 transition-colors"
              aria-label="Next"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 pb-4 flex flex-wrap gap-4 text-xs flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-text-secondary">Tasks</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-text-secondary">Projects</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-text-secondary">Events</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-text-secondary">Completed</span>
        </div>
      </div>
    </div>
  );
};
