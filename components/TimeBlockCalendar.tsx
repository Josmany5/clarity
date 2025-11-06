import React, { useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { Task } from '../App';

const localizer = momentLocalizer(moment);

interface TimeBlockCalendarProps {
  tasks: Task[];
  selectedDate: Date;
  onTaskUpdate?: (task: Task) => void;
}

export const TimeBlockCalendar: React.FC<TimeBlockCalendarProps> = ({
  tasks,
  selectedDate,
  onTaskUpdate
}) => {
  // Convert tasks to calendar events
  const events = useMemo(() => {
    return tasks.map(task => {
      if (!task.dueDate) return null;

      const [year, month, day] = task.dueDate.split('-').map(Number);
      const date = new Date(year, month - 1, day);

      let start = new Date(date);
      let end = new Date(date);

      if (task.dueTime) {
        const [hours, minutes] = task.dueTime.split(':').map(Number);
        start.setHours(hours, minutes, 0);

        // Default 1 hour duration, or use estimatedTime
        const duration = task.estimatedTime || 60;
        end = new Date(start.getTime() + duration * 60000);
      } else {
        // All-day event
        start.setHours(9, 0, 0);
        end.setHours(10, 0, 0);
      }

      return {
        id: task.id,
        title: task.title,
        start,
        end,
        resource: task,
      };
    }).filter(Boolean);
  }, [tasks]);

  // Custom event styling based on task properties
  const eventStyleGetter = (event: any) => {
    const task = event.resource as Task;

    let backgroundColor = '#8b5cf6'; // default accent color
    let borderColor = '#7c3aed';

    if (task.completed) {
      backgroundColor = '#10b981'; // green
      borderColor = '#059669';
    } else if (task.urgent && task.important) {
      backgroundColor = '#ef4444'; // red (critical)
      borderColor = '#dc2626';
    } else if (task.urgent) {
      backgroundColor = '#f97316'; // orange
      borderColor = '#ea580c';
    } else if (task.important) {
      backgroundColor = '#3b82f6'; // blue
      borderColor = '#2563eb';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderLeftWidth: '4px',
        borderLeftStyle: 'solid',
        opacity: task.completed ? 0.6 : 1,
        textDecoration: task.completed ? 'line-through' : 'none',
      }
    };
  };

  return (
    <div className="bg-card-bg rounded-xl border border-card-border overflow-hidden">
      <div className="p-4 border-b border-card-border">
        <h3 className="text-xl font-bold text-text-primary">Time Blocks</h3>
        <p className="text-xs text-text-secondary mt-1">Interactive schedule for the day</p>
      </div>

      <div className="h-[600px] p-4" style={{
        '--rbc-bg-color': 'var(--card-bg)',
        '--rbc-text-color': 'var(--text-primary)',
        '--rbc-border-color': 'var(--card-border)',
      } as any}>
        <style>{`
          .rbc-calendar {
            font-family: inherit;
            color: var(--text-primary);
            background: transparent;
          }
          .rbc-header {
            padding: 10px 3px;
            font-weight: 600;
            border-bottom: 2px solid var(--card-border);
            color: var(--text-primary);
          }
          .rbc-time-view {
            border: 1px solid var(--card-border);
            border-radius: 8px;
            background: var(--card-bg);
          }
          .rbc-time-content {
            border-top: 1px solid var(--card-border);
          }
          .rbc-time-slot {
            border-top: 1px solid rgba(0,0,0,0.05);
          }
          .rbc-current-time-indicator {
            background-color: #ef4444;
            height: 2px;
          }
          .rbc-timeslot-group {
            min-height: 60px;
            border-left: 1px solid var(--card-border);
          }
          .rbc-time-header-content {
            border-left: 1px solid var(--card-border);
          }
          .rbc-day-slot .rbc-time-slot {
            border-top: 1px solid rgba(0,0,0,0.03);
          }
          .rbc-label {
            color: var(--text-secondary);
            font-size: 12px;
            padding: 0 5px;
          }
          .rbc-event {
            border-radius: 4px;
            padding: 2px 5px;
            font-size: 13px;
          }
          .rbc-event-label {
            font-size: 11px;
          }
          .rbc-toolbar {
            display: none;
          }
          .rbc-time-column {
            background: transparent;
          }
          .rbc-day-bg {
            background: transparent;
          }
          .rbc-today {
            background-color: transparent;
          }
        `}</style>

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          defaultView="day"
          view="day"
          date={selectedDate}
          onNavigate={() => {}}
          views={['day']}
          step={30}
          timeslots={2}
          min={new Date(2000, 1, 1, 5, 0, 0)}
          max={new Date(2000, 1, 1, 23, 0, 0)}
          eventPropGetter={eventStyleGetter}
          toolbar={false}
          formats={{
            timeGutterFormat: 'h:mm A',
            eventTimeRangeFormat: ({ start, end }: any) =>
              `${moment(start).format('h:mm A')} - ${moment(end).format('h:mm A')}`,
          }}
        />
      </div>
    </div>
  );
};
