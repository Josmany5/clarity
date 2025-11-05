import React, { useState } from 'react';
import { WidgetCard } from './WidgetCard';
import { CalendarIcon } from './Icons';
import type { Task } from '../App';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'task' | 'project';
  completed?: boolean;
}

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
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

    return events.sort((a, b) => {
      const dateA = new Date(`${a.date}${a.time ? `T${a.time}` : ''}`).getTime();
      const dateB = new Date(`${b.date}${b.time ? `T${b.time}` : ''}`).getTime();
      return dateA - dateB;
    });
  };

  const events = loadEvents();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPreviousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const getEventsForSelectedDate = () => {
    if (!selectedDate) return [];
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const handleDayClick = (day: number) => setSelectedDate(new Date(year, month, day));

  return (
    <div className="space-y-6">
      <WidgetCard>
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-accent" />
              <div>
                <h2 className="text-3xl font-bold text-text-primary">{monthName} {year}</h2>
                <p className="text-sm text-text-secondary mt-1">{events.length} scheduled items</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={goToToday} className="px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent">Today</button>
              <button onClick={goToPreviousMonth} className="p-2 bg-black/5 dark:bg-white/5 text-text-primary rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-accent" aria-label="Previous month">←</button>
              <button onClick={goToNextMonth} className="p-2 bg-black/5 dark:bg-white/5 text-text-primary rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-accent" aria-label="Next month">→</button>
            </div>
          </div>
        </div>
      </WidgetCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WidgetCard>
            <div className="p-6">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {weekdays.map((day, index) => (
                  <div key={`weekday-${index}`} className="text-center font-semibold text-text-secondary text-sm">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {paddingDays.map((_, index) => (<div key={`padding-${index}`} className="aspect-square" />))}
                {days.map((day) => {
                  const dayEvents = getEventsForDate(day);
                  const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === month && selectedDate?.getFullYear() === year;
                  return (
                    <button key={day} onClick={() => handleDayClick(day)} className={`aspect-square rounded-lg p-2 text-sm font-medium transition-all duration-200 relative ${isToday(day) ? 'bg-accent text-white shadow-lg' : isSelected ? 'bg-accent/20 text-accent border-2 border-accent' : 'text-text-primary hover:bg-black/10 dark:hover:bg-white/10'}`}>
                      <div>{day}</div>
                      {dayEvents.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                          {dayEvents.slice(0, 3).map((event, i) => (
                            <div key={i} className={`w-1 h-1 rounded-full ${event.completed ? 'bg-green-500' : event.type === 'task' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 pt-6 border-t border-card-border flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-text-secondary">Tasks</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div><span className="text-text-secondary">Projects</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-text-secondary">Completed</span></div>
              </div>
            </div>
          </WidgetCard>
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