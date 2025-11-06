import React from 'react';
import type { Task } from '../App';

interface TimeBlockCalendarProps {
  tasks: Task[];
  selectedDate: Date;
}

export const TimeBlockCalendar: React.FC<TimeBlockCalendarProps> = ({ tasks, selectedDate }) => {
  // Generate time slots from 5 AM to 11 PM in 30-minute increments
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 5; hour < 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const displayTime = hour === 12
          ? `12:${String(minute).padStart(2, '0')} PM`
          : hour > 12
            ? `${hour - 12}:${String(minute).padStart(2, '0')} PM`
            : hour === 0
              ? `12:${String(minute).padStart(2, '0')} AM`
              : `${hour}:${String(minute).padStart(2, '0')} AM`;
        slots.push({ time, displayTime, hour, minute });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const currentTime = new Date();
  const isToday = selectedDate.toDateString() === currentTime.toDateString();
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();

  // Map tasks to time slots with visual blocks
  const getTasksForSlot = (hour: number, minute: number) => {
    return tasks.filter(task => {
      if (!task.dueTime) return false;
      const [taskHour, taskMinute] = task.dueTime.split(':').map(Number);
      const taskStartMinutes = taskHour * 60 + taskMinute;
      const slotStartMinutes = hour * 60 + minute;
      const slotEndMinutes = slotStartMinutes + 30;

      // Task duration in minutes
      const duration = task.estimatedTime || 60;
      const taskEndMinutes = taskStartMinutes + duration;

      // Check if task overlaps with this time slot
      return taskStartMinutes < slotEndMinutes && taskEndMinutes > slotStartMinutes;
    });
  };

  const getTaskColor = (task: Task) => {
    if (task.completed) return 'bg-green-500/90 border-green-600';
    if (task.urgent && task.important) return 'bg-red-500/90 border-red-600';
    if (task.urgent) return 'bg-orange-500/90 border-orange-600';
    if (task.important) return 'bg-blue-500/90 border-blue-600';
    return 'bg-purple-500/90 border-purple-600';
  };

  return (
    <div className="bg-card-bg rounded-xl border border-card-border overflow-hidden">
      <div className="p-4 border-b border-card-border">
        <h3 className="text-xl font-bold text-text-primary">Time Blocks</h3>
        <p className="text-xs text-text-secondary mt-1">Visual schedule for the day</p>
      </div>

      <div className="overflow-y-auto max-h-[600px] relative">
        {/* Time grid */}
        <div className="divide-y divide-card-border/50">
          {timeSlots.map(({ time, displayTime, hour, minute }) => {
            const slotTasks = getTasksForSlot(hour, minute);
            const isCurrentSlot = isToday && hour === currentHour && Math.abs(minute - currentMinute) < 30;

            return (
              <div
                key={time}
                className={`flex items-stretch border-l-2 ${
                  isCurrentSlot ? 'border-l-red-500 bg-red-500/5' : 'border-l-transparent'
                } hover:bg-black/5 dark:hover:bg-white/5 transition-colors min-h-[60px]`}
              >
                {/* Time label */}
                <div className="w-24 flex-shrink-0 p-3 text-xs font-medium text-text-secondary">
                  {displayTime}
                </div>

                {/* Task blocks */}
                <div className="flex-1 p-2 flex flex-col gap-1">
                  {slotTasks.length > 0 ? (
                    slotTasks.map(task => (
                      <div
                        key={task.id}
                        className={`${getTaskColor(task)} text-white px-3 py-2 rounded-lg border-l-4 shadow-sm`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${task.completed ? 'line-through' : ''}`}>
                              {task.title}
                            </p>
                            {task.estimatedTime && (
                              <p className="text-xs opacity-90 mt-0.5">
                                {task.estimatedTime >= 60
                                  ? `${Math.floor(task.estimatedTime / 60)}h ${task.estimatedTime % 60}m`
                                  : `${task.estimatedTime}m`
                                }
                              </p>
                            )}
                          </div>
                          {task.completed && (
                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center">
                      <div className="w-full border-b border-dashed border-card-border"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
