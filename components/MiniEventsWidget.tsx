import React from 'react';
import { WidgetCard } from './WidgetCard';
import type { Event } from '../App';

interface MiniEventsWidgetProps {
  events: Array<{ id: string; title: string; startDate: string; startTime: string; type: string }>;
  onViewAll?: () => void;
}

export const MiniEventsWidget: React.FC<MiniEventsWidgetProps> = ({ events, onViewAll }) => {
  // Get upcoming events, sorted by date (earliest first)
  const upcomingEvents = events
    .sort((a, b) => {
      const dateA = new Date(`${a.startDate}T${a.startTime}`).getTime();
      const dateB = new Date(`${b.startDate}T${b.startTime}`).getTime();
      return dateA - dateB;
    })
    .slice(0, 4); // Show up to 4 events to keep it compact

  const formatEventDate = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) {
      return `Today at ${new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (isTomorrow) {
      return `Tomorrow at ${new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'class':
        return '📚';
      case 'meeting':
        return '👥';
      case 'appointment':
        return '📅';
      default:
        return '🗓️';
    }
  };

  return (
    <WidgetCard>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg text-text-primary">Upcoming Events</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-accent hover:text-accent-secondary transition-colors text-sm font-medium"
            title="View all events"
          >
            View All →
          </button>
        )}
      </div>

      {/* Events List */}
      {upcomingEvents.length > 0 ? (
        <ul className="space-y-3">
          {upcomingEvents.map((event) => (
            <li
              key={event.id}
              className="flex items-start p-2 -m-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <span className="text-lg mr-3 flex-shrink-0">
                {getEventIcon(event.type)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{event.title}</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {formatEventDate(event.startDate, event.startTime)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-text-secondary text-center py-4">No upcoming events</p>
      )}
    </WidgetCard>
  );
};
