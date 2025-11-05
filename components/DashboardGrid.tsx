
import React, { useState } from 'react';
import { WidgetCard } from './WidgetCard';
import { FocusTimer } from './FocusTimer';
import { LineChartCard } from './LineChartCard';
import { MiniCalendar } from './MiniCalendar';
import { UserIcon, NoteIcon } from './Icons';
import type { Note } from '../App';

const Tag: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${color}`}>
    {children}
  </span>
);

const ClickableWidget: React.FC<{onClick: () => void, children: React.ReactNode, className?: string}> = ({ onClick, children, className }) => (
    <div onClick={onClick} className={`cursor-pointer transition-transform duration-200 hover:scale-[1.03] hover:shadow-xl rounded-2xl ${className}`}>
        {children}
    </div>
)

const ModeButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${
            active
                ? 'bg-accent text-white'
                : 'bg-black/5 dark:bg-white/5 text-text-secondary hover:bg-black/10 dark:hover:bg-white/10 hover:text-text-primary'
        }`}
    >
        {children}
    </button>
);

interface DashboardGridProps {
    setActivePage: (page: string) => void;
    theme: string;
    notes: Note[];
    onNewNote: () => void;
    onSelectNote: (noteId: string) => void;
    tasks?: Array<{ id: string; dueDate?: string; title: string }>;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ setActivePage, theme, notes, onNewNote, onSelectNote, tasks = [] }) => {
  const [mode, setMode] = useState('Overview');
  const modes = ['Overview', 'Work', 'Personal', 'Focus'];
  const recentNotes = notes.slice(0, 3);
  
  return (
    <div>
      <div className="mb-6 flex items-center space-x-2 overflow-x-auto pb-2">
          {modes.map(m => (
              <ModeButton key={m} active={m === mode} onClick={() => setMode(m)}>
                  {m}
              </ModeButton>
          ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {/* Column 1 */}
        <div className="lg:col-span-2 xl:col-span-2 space-y-6">
          <ClickableWidget onClick={() => setActivePage('Calendar')}>
              <WidgetCard>
                  <MiniCalendar tasks={tasks} />
              </WidgetCard>
          </ClickableWidget>
          <ClickableWidget onClick={() => setActivePage('Projects')}>
              <WidgetCard>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-text-primary">UI/UX Redesign</h3>
                      <p className="text-sm text-text-secondary mt-1">Finalize mockups</p>
                    </div>
                    <Tag color="bg-teal-500/20 text-teal-400 dark:text-teal-300">#work</Tag>
                  </div>
                  <div className="mt-4">
                    <Tag color="bg-indigo-500/20 text-indigo-500 dark:text-indigo-300">#project</Tag>
                  </div>
              </WidgetCard>
          </ClickableWidget>
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
        </div>

        {/* Column 3 */}
        <div className="lg:col-span-4 xl:col-span-1 space-y-6">
          <FocusTimer />
          <ClickableWidget onClick={() => setActivePage('Tasks')}>
              <WidgetCard className="flex items-center justify-between">
                  <div>
                      <h3 className="font-bold text-lg text-text-primary">Personal Goals</h3>
                      <p className="text-sm text-text-secondary mt-1">Meditation reminder</p>
                  </div>
                  <span className="text-2xl">🧘</span>
              </WidgetCard>
          </ClickableWidget>
          <button 
              onClick={onNewNote}
              className="w-full flex items-center justify-center p-4 bg-card-bg backdrop-blur-xl rounded-2xl text-text-primary font-semibold hover:bg-white/80 dark:hover:bg-white/20 transition-all duration-200 shadow-glass border border-card-border">
              New Note
              <span className="ml-3 w-6 h-6 bg-black/10 dark:bg-white/20 rounded-full flex items-center justify-center">+</span>
          </button>
        </div>
      </div>
    </div>
  );
};
