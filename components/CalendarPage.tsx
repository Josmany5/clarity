import React, { useState } from 'react';
import { WidgetCard } from './WidgetCard';
import { CalendarIcon, SunIcon, MoonIcon } from './Icons';
import { AdvancedCalendar } from './AdvancedCalendar';
import { CalendarEventModal } from './CalendarEventModal';
import type { Task, Note, Event } from '../App';
import { parseLocalDate } from '../utils/dateUtils';

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
  notes: Note[];
  tasks: Task[];
  events: Event[];
  onUpdateNote: (note: Note) => void;
  onUpdateTask: (task: Task) => void;
  onUpdateEvent: (event: Event) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  notes,
  tasks: propTasks,
  events: propEvents,
  onUpdateNote,
  onUpdateTask,
  onUpdateEvent,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEventType, setModalEventType] = useState<'task' | 'event' | 'note'>('task');
  const [modalEventId, setModalEventId] = useState<string>('');

  // Convert tasks and events to calendar events format
  const loadEvents = (): CalendarEvent[] => {
    const events: CalendarEvent[] = [];

    // Add tasks with due dates
    propTasks.forEach((task: Task) => {
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

    // Add events (expand multi-day events)
    propEvents.forEach((event: Event) => {
      const startDate = parseLocalDate(event.startDate);
      const endDate = event.endDate ? parseLocalDate(event.endDate) : startDate;

      // For each day in the range, create a calendar event entry
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        events.push({
          id: event.id,
          title: event.title,
          date: dateStr,
          time: event.startTime,
          endTime: event.endTime,
          type: 'event',
          eventType: event.type,
          recurring: event.recurring,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

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

  const handleEventClick = (eventId: string, eventType: 'task' | 'event') => {
    setModalEventId(eventId);
    setModalEventType(eventType);
    setModalOpen(true);
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-6">
      {/* Calendar - Full Width */}
      <AdvancedCalendar
        events={events}
        onDateSelect={(date) => setSelectedDate(date)}
        notes={notes}
        tasks={propTasks}
        calendarEvents={propEvents}
        onUpdateNote={onUpdateNote}
        onUpdateTask={onUpdateTask}
        onUpdateEvent={onUpdateEvent}
      />

      {/* Sidebar Boxes - Horizontal Grid Below */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Selected Date Events */}
        <WidgetCard>
          <div className="p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-text-primary mb-4">
              {selectedDate ? (<>{selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}<div className="text-sm text-text-secondary font-normal mt-1">{selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div></>) : 'Select a date'}
            </h3>
            {selectedDate ? (
              <div className="space-y-3">
                {getEventsForSelectedDate().length > 0 ? getEventsForSelectedDate().map((event) => (
                  <button
                    key={event.id}
                    onClick={() => handleEventClick(event.id, event.type)}
                    className={`w-full text-left p-3 rounded-lg border-l-4 transition-all hover:scale-[1.02] hover:shadow-md ${event.completed ? 'bg-green-500/10 border-green-500 hover:bg-green-500/20' : event.type === 'task' ? 'bg-blue-500/10 border-blue-500 hover:bg-blue-500/20' : 'bg-purple-500/10 border-purple-500 hover:bg-purple-500/20'}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{event.type === 'task' ? '✓' : '📁'}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-text-primary ${event.completed ? 'line-through' : ''}`}>{event.title}</h4>
                        {event.time && (<p className="text-xs text-text-secondary mt-1">{new Date(`2000-01-01T${event.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>)}
                        <span className="inline-block mt-1 px-2 py-0.5 bg-black/10 dark:bg-white/10 rounded text-xs text-text-secondary capitalize">{event.type}</span>
                      </div>
                    </div>
                  </button>
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

        {/* Upcoming Events */}
        <WidgetCard>
          <div className="p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-text-primary mb-4">Upcoming Events</h3>
            <div className="space-y-2">
              {events.filter(event => !event.completed).slice(0, 5).map((event) => (
                <button
                  key={event.id}
                  onClick={() => handleEventClick(event.id, event.type)}
                  className="w-full text-left p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{event.type === 'task' ? '✓' : '📁'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{event.title}</p>
                      <p className="text-xs text-text-secondary">{parseLocalDate(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{event.time && ` • ${new Date(`2000-01-01T${event.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}</p>
                    </div>
                  </div>
                </button>
              ))}
              {events.filter(event => !event.completed).length === 0 && (<p className="text-sm text-text-secondary text-center py-4">No upcoming events</p>)}
            </div>
          </div>
        </WidgetCard>
      </div>

      {/* Event Modal */}
      <CalendarEventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        eventType={modalEventType}
        eventId={modalEventId}
        tasks={propTasks}
        events={propEvents}
        notes={notes}
        onUpdateTask={onUpdateTask}
        onUpdateEvent={onUpdateEvent}
        onUpdateNote={onUpdateNote}
      />
    </div>
  );
};