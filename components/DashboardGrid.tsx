
import React from 'react';
import { WidgetCard } from './WidgetCard';
import { FocusTimer } from './FocusTimer';
import { LineChartCard } from './LineChartCard';
import { MiniCalendar } from './MiniCalendar';
import { GoalWidget } from './GoalWidget';
import { MiniTodoWidget } from './MiniTodoWidget';
import { MiniEventsWidget } from './MiniEventsWidget';
import { UserIcon, NoteIcon } from './Icons';
import type { Note, Goal, Task } from '../App';

const Tag: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${color}`}>
    {children}
  </span>
);

const ClickableWidget: React.FC<{onClick: () => void, children: React.ReactNode, className?: string}> = ({ onClick, children, className }) => (
    <div onClick={onClick} className={`cursor-pointer transition-transform duration-200 hover:scale-[1.03] hover:shadow-xl rounded-2xl ${className}`}>
        {children}
    </div>
);

interface DashboardGridProps {
    setActivePage: (page: string) => void;
    theme: string;
    notes: Note[];
    onNewNote: () => void;
    onSelectNote: (noteId: string) => void;
    tasks?: Task[];
    goals?: Goal[];
    events?: Array<{ id: string; title: string; startDate: string; startTime: string; type: string }>;
    onUpdateGoal?: (goal: Goal) => void;
    onUpdateTask?: (task: Task) => void;
    timerDuration: number;
    timerTimeRemaining: number;
    timerIsActive: boolean;
    onTimerDurationChange: (duration: number) => void;
    onTimerTimeRemainingChange: (timeRemaining: number) => void;
    onTimerIsActiveChange: (isActive: boolean) => void;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  setActivePage,
  theme,
  notes,
  onNewNote,
  onSelectNote,
  tasks = [],
  goals = [],
  events = [],
  onUpdateGoal,
  onUpdateTask,
  timerDuration,
  timerTimeRemaining,
  timerIsActive,
  onTimerDurationChange,
  onTimerTimeRemainingChange,
  onTimerIsActiveChange
}) => {
  const recentNotes = notes.slice(0, 3);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {/* Column 1 */}
        <div className="lg:col-span-2 xl:col-span-2 space-y-6">
          <ClickableWidget onClick={() => setActivePage('Calendar')}>
              <WidgetCard>
                  <MiniCalendar tasks={tasks} />
              </WidgetCard>
          </ClickableWidget>
          <GoalWidget
            goals={goals}
            onUpdateGoal={onUpdateGoal}
            onAddGoal={() => setActivePage('Goals')}
          />
            <WidgetCard>
                <h3 className="font-bold text-lg text-text-primary mb-3">Recent Notes</h3>
                {recentNotes.length > 0 ? (
                    <ul className="space-y-3">
                        {recentNotes.map(note => (
                            <li key={note.id} onClick={() => onSelectNote(note.id)} className="flex items-center p-2 -m-2 rounded-lg cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <NoteIcon className="w-5 h-5 mr-3 text-accent flex-shrink-0" />
                                <p className="text-sm text-text-primary truncate">{note.title}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-text-secondary text-center py-4">No recent notes. Click "New Note" to get started!</p>
                )}
            </WidgetCard>
        </div>

        {/* Column 2 */}
        <div className="lg:col-span-2 xl:col-span-2 space-y-6">
          <ClickableWidget onClick={() => setActivePage('Projects')}>
              <WidgetCard>
                  <h3 className="font-bold text-lg text-text-primary">Marketing Plan</h3>
                  <p className="text-sm text-text-secondary mt-1">Analyze Q3 results</p>
                  <div className="flex space-x-2 mt-3">
                      <Tag color="bg-red-500/20 text-red-500 dark:text-red-300">#work</Tag>
                      <Tag color="bg-orange-500/20 text-orange-500 dark:text-orange-300">#personal</Tag>
                  </div>
              </WidgetCard>
          </ClickableWidget>
          <WidgetCard>
              <LineChartCard theme={theme} />
          </WidgetCard>
          <ClickableWidget onClick={() => setActivePage('Tasks')}>
              <WidgetCard className="flex items-center justify-between">
                  <div>
                      <h3 className="font-bold text-lg text-text-primary">Team Sync</h3>
                      <p className="text-sm text-text-secondary mt-1">Daily standup...</p>
                  </div>
                  <div className="flex items-center -space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-400 dark:bg-gray-600 border-2 border-card-bg"></div>
                      <div className="w-8 h-8 rounded-full bg-blue-400 border-2 border-card-bg"></div>
                  </div>
              </WidgetCard>
          </ClickableWidget>
          <MiniEventsWidget
            events={events}
            onViewAll={() => setActivePage('Events')}
          />
        </div>

        {/* Column 3 */}
        <div className="lg:col-span-4 xl:col-span-1 space-y-6">
          <FocusTimer
            duration={timerDuration}
            timeRemaining={timerTimeRemaining}
            isActive={timerIsActive}
            onDurationChange={onTimerDurationChange}
            onTimeRemainingChange={onTimerTimeRemainingChange}
            onIsActiveChange={onTimerIsActiveChange}
          />
          <ClickableWidget onClick={() => setActivePage('Templates')}>
              <WidgetCard className="flex items-center justify-between p-4">
                  <div>
                      <h3 className="font-bold text-base text-text-primary">Templates</h3>
                      <p className="text-xs text-text-secondary mt-1">{notes.length} active</p>
                  </div>
                  <span className="text-xl">📋</span>
              </WidgetCard>
          </ClickableWidget>
          <ClickableWidget onClick={() => setActivePage('Systems')}>
              <WidgetCard className="flex items-center justify-between p-4">
                  <div>
                      <h3 className="font-bold text-base text-text-primary">Systems</h3>
                      <p className="text-xs text-text-secondary mt-1">{tasks?.length || 0} running</p>
                  </div>
                  <span className="text-xl">⚙️</span>
              </WidgetCard>
          </ClickableWidget>
          <MiniTodoWidget
            tasks={tasks}
            onUpdateTask={onUpdateTask}
            onAddTask={() => setActivePage('Tasks')}
          />
        </div>
      </div>
    </div>
  );
};
