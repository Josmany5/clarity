import React, { useState } from 'react';
import { WidgetCard } from './WidgetCard';
import { CalendarIcon, SunIcon, MoonIcon } from './Icons';
import { AdvancedCalendar } from './AdvancedCalendar';
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
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    daysOfWeek?: number[];
    endDate?: string;
  };
}

interface CalendarPageProps {
  themeMode: 'light' | 'dark';
  toggleTheme: () => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ themeMode, toggleTheme }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Load events from localStorage
  const loadEvents = (): CalendarEvent[] => {
    const events: CalendarEvent[] = [];

    try {
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      tasks.forEach((task: Task) => {
        if (task.dueDate) {
          events.push({
            id: task.id,
            title: task.title,
            date: task.dueDate,
            time: task.dueTime,
            type: 'task',
            completed: task.completed,
          });
        }
      });
    } catch {}

    try {
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      projects.forEach((project: any) => {
        if (project.dueDate) {
          events.push({
            id: project.id,
            title: project.name,
            date: project.dueDate,
            time: project.dueTime,
            type: 'project',
          });
        }
      });
    } catch {}

    // Load events (classes, meetings, appointments)
    try {
      const storedEvents = JSON.parse(localStorage.getItem('events') || '[]');
      storedEvents.forEach((event: any) => {
        // Add single or first occurrence
        events.push({
          id: event.id,
          title: event.title,
          date: event.startDate,
          time: event.startTime,
          endTime: event.endTime,
          type: 'event',
          eventType: event.type,
          recurring: event.recurring,
        });
      });
    } catch {}

    return events.sort((a, b) => {
      const dateA = new Date(`${a.date}${a.time ? `T${a.time}` : ''}`).getTime();
      const dateB = new Date(`${b.date}${b.time ? `T${b.time}` : ''}`).getTime();
      return dateA - dateB;
    });
  };

  const events = loadEvents();

  const getEventsForSelectedDate = () => {
    if (!selectedDate) return [];
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0 pb-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Calendar</h1>
        <button
          onClick={toggleTheme}
          className="p-2 md:p-3 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
          aria-label="Toggle theme"
        >
          {themeMode === 'light' ? <MoonIcon className="w-5 h-5 md:w-6 md:h-6 text-text-primary" /> : <SunIcon className="w-5 h-5 md:w-6 md:h-6 text-text-primary" />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AdvancedCalendar
            events={events}
            onDateSelect={(date) => setSelectedDate(date)}
          />
        </div>

        <div className="lg:col-span-1">
          <WidgetCard>
            <div className="p-6">
              <h3 className="text-xl font-bold text-text-primary mb-4">
                {selectedDate ? (<>{selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}<div className="text-sm text-text-secondary font-normal mt-1">{selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div></>) : 'Select a date'}
              </h3>
              {selectedDate ? (
                <div className="space-y-3">
                  {getEventsForSelectedDate().length > 0 ? getEventsForSelectedDate().map((event) => (
                    <div key={event.id} className={`p-3 rounded-lg border-l-4 ${event.completed ? 'bg-green-500/10 border-green-500' : event.type === 'task' ? 'bg-blue-500/10 border-blue-500' : 'bg-purple-500/10 border-purple-500'}`}>
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{event.type === 'task' ? '✓' : '📁'}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold text-text-primary ${event.completed ? 'line-through' : ''}`}>{event.title}</h4>
                          {event.time && (<p className="text-xs text-text-secondary mt-1">{new Date(`2000-01-01T${event.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>)}
                          <span className="inline-block mt-1 px-2 py-0.5 bg-black/10 dark:bg-white/10 rounded text-xs text-text-secondary capitalize">{event.type}</span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-text-secondary">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No events scheduled</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Click a date to view events</p>
                </div>
              )}
            </div>
          </WidgetCard>

          <WidgetCard className="mt-6">
            <div className="p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Upcoming Events</h3>
              <div className="space-y-2">
                {events.slice(0, 5).map((event) => (
                  <div key={event.id} className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{event.type === 'task' ? '✓' : '📁'}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium text-text-primary truncate ${event.completed ? 'line-through' : ''}`}>{event.title}</p>
                        <p className="text-xs text-text-secondary">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{event.time && ` • ${new Date(`2000-01-01T${event.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {events.length === 0 && (<p className="text-sm text-text-secondary text-center py-4">No upcoming events</p>)}
              </div>
            </div>
          </WidgetCard>
        </div>
      </div>
    </div>
  );
};