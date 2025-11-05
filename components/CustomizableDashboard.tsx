import React, { useState, useEffect } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { WidgetCard } from './WidgetCard';
import { FocusTimer } from './FocusTimer';
import { LineChartCard } from './LineChartCard';
import { MiniCalendar } from './MiniCalendar';
import { NoteIcon } from './Icons';
import type { Note, Task } from '../App';

interface WidgetDefinition {
  id: string;
  type: string;
  title: string;
  icon: string;
}

interface DashboardWidget extends WidgetDefinition {
  layoutId: string; // Unique ID for this instance
}

const AVAILABLE_WIDGETS: WidgetDefinition[] = [
  { id: 'calendar', type: 'calendar', title: 'Calendar', icon: '📅' },
  { id: 'timer', type: 'timer', title: 'Focus Timer', icon: '⏱️' },
  { id: 'chart', type: 'chart', title: 'Activity Chart', icon: '📊' },
  { id: 'notes', type: 'notes', title: 'Recent Notes', icon: '📝' },
  { id: 'project1', type: 'project', title: 'UI/UX Redesign', icon: '🎨' },
  { id: 'project2', type: 'project', title: 'Marketing Plan', icon: '📱' },
  { id: 'goals', type: 'goals', title: 'Personal Goals', icon: '🎯' },
  { id: 'team', type: 'team', title: 'Team Sync', icon: '👥' },
];

interface CustomizableDashboardProps {
  setActivePage: (page: string) => void;
  theme: string;
  notes: Note[];
  tasks: Task[];
  onNewNote: () => void;
  onSelectNote: (noteId: string) => void;
}

export const CustomizableDashboard: React.FC<CustomizableDashboardProps> = ({
  setActivePage,
  theme,
  notes,
  tasks,
  onNewNote,
  onSelectNote,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWidgetGallery, setShowWidgetGallery] = useState(false);

  // Load saved layout and widgets from localStorage
  const [layout, setLayout] = useState<Layout[]>(() => {
    try {
      const saved = localStorage.getItem('dashboardLayout');
      return saved ? JSON.parse(saved) : [
        { i: 'calendar-1', x: 0, y: 0, w: 2, h: 2 },
        { i: 'timer-1', x: 4, y: 0, w: 1, h: 2 },
        { i: 'chart-1', x: 2, y: 0, w: 2, h: 2 },
        { i: 'notes-1', x: 0, y: 2, w: 2, h: 2 },
      ];
    } catch {
      return [
        { i: 'calendar-1', x: 0, y: 0, w: 2, h: 2 },
        { i: 'timer-1', x: 4, y: 0, w: 1, h: 2 },
        { i: 'chart-1', x: 2, y: 0, w: 2, h: 2 },
        { i: 'notes-1', x: 0, y: 2, w: 2, h: 2 },
      ];
    }
  });

  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    try {
      const saved = localStorage.getItem('dashboardWidgets');
      return saved ? JSON.parse(saved) : [
        { ...AVAILABLE_WIDGETS[0], layoutId: 'calendar-1' },
        { ...AVAILABLE_WIDGETS[1], layoutId: 'timer-1' },
        { ...AVAILABLE_WIDGETS[2], layoutId: 'chart-1' },
        { ...AVAILABLE_WIDGETS[3], layoutId: 'notes-1' },
      ];
    } catch {
      return [
        { ...AVAILABLE_WIDGETS[0], layoutId: 'calendar-1' },
        { ...AVAILABLE_WIDGETS[1], layoutId: 'timer-1' },
        { ...AVAILABLE_WIDGETS[2], layoutId: 'chart-1' },
        { ...AVAILABLE_WIDGETS[3], layoutId: 'notes-1' },
      ];
    }
  });

  // Save layout and widgets whenever they change
  useEffect(() => {
    localStorage.setItem('dashboardLayout', JSON.stringify(layout));
  }, [layout]);

  useEffect(() => {
    localStorage.setItem('dashboardWidgets', JSON.stringify(widgets));
  }, [widgets]);

  const handleLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout);
  };

  const handleAddWidget = (widget: WidgetDefinition) => {
    const layoutId = `${widget.id}-${Date.now()}`;
    const newWidget = { ...widget, layoutId };

    // Find a good position for the new widget
    const maxY = layout.reduce((max, item) => Math.max(max, item.y + item.h), 0);
    const newLayoutItem: Layout = {
      i: layoutId,
      x: 0,
      y: maxY,
      w: 2,
      h: 2,
    };

    setWidgets([...widgets, newWidget]);
    setLayout([...layout, newLayoutItem]);
    setShowWidgetGallery(false);
  };

  const handleRemoveWidget = (layoutId: string) => {
    setWidgets(widgets.filter(w => w.layoutId !== layoutId));
    setLayout(layout.filter(l => l.i !== layoutId));
  };

  const renderWidgetContent = (widget: DashboardWidget) => {
    const recentNotes = notes.slice(0, 3);

    switch (widget.type) {
      case 'calendar':
        return <MiniCalendar tasks={tasks} />;

      case 'timer':
        return <FocusTimer />;

      case 'chart':
        return <LineChartCard theme={theme} />;

      case 'notes':
        return (
          <div>
            <h3 className="font-bold text-lg text-text-primary mb-3">Recent Notes</h3>
            {recentNotes.length > 0 ? (
              <ul className="space-y-3">
                {recentNotes.map(note => (
                  <li
                    key={note.id}
                    onClick={() => !isEditMode && onSelectNote(note.id)}
                    className="flex items-center p-2 -m-2 rounded-lg cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <NoteIcon className="w-5 h-5 mr-3 text-accent flex-shrink-0" />
                    <p className="text-sm text-text-primary truncate">{note.title}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-secondary text-center py-4">No recent notes</p>
            )}
          </div>
        );

      case 'project':
        if (widget.id === 'project1') {
          return (
            <div onClick={() => !isEditMode && setActivePage('Projects')} className={!isEditMode ? 'cursor-pointer' : ''}>
              <h3 className="font-bold text-lg text-text-primary">UI/UX Redesign</h3>
              <p className="text-sm text-text-secondary mt-1">Finalize mockups</p>
              <div className="mt-3">
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-teal-500/20 text-teal-400 dark:text-teal-300">
                  #work
                </span>
              </div>
            </div>
          );
        } else {
          return (
            <div onClick={() => !isEditMode && setActivePage('Projects')} className={!isEditMode ? 'cursor-pointer' : ''}>
              <h3 className="font-bold text-lg text-text-primary">Marketing Plan</h3>
              <p className="text-sm text-text-secondary mt-1">Analyze Q3 results</p>
              <div className="flex space-x-2 mt-3">
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-500/20 text-red-500 dark:text-red-300">
                  #work
                </span>
              </div>
            </div>
          );
        }

      case 'goals':
        return (
          <div onClick={() => !isEditMode && setActivePage('Tasks')} className={`flex items-center justify-between ${!isEditMode ? 'cursor-pointer' : ''}`}>
            <div>
              <h3 className="font-bold text-lg text-text-primary">Personal Goals</h3>
              <p className="text-sm text-text-secondary mt-1">Meditation reminder</p>
            </div>
            <span className="text-2xl">🧘</span>
          </div>
        );

      case 'team':
        return (
          <div onClick={() => !isEditMode && setActivePage('Tasks')} className={`flex items-center justify-between ${!isEditMode ? 'cursor-pointer' : ''}`}>
            <div>
              <h3 className="font-bold text-lg text-text-primary">Team Sync</h3>
              <p className="text-sm text-text-secondary mt-1">Daily standup...</p>
            </div>
            <div className="flex items-center -space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-400 dark:bg-gray-600 border-2 border-card-bg"></div>
              <div className="w-8 h-8 rounded-full bg-blue-400 border-2 border-card-bg"></div>
            </div>
          </div>
        );

      default:
        return <div>Unknown widget type</div>;
    }
  };

  return (
    <div>
      {/* Edit Mode Toggle */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsEditMode(!isEditMode);
              setShowWidgetGallery(false);
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              isEditMode
                ? 'bg-accent text-white shadow-lg'
                : 'bg-black/5 dark:bg-white/5 text-text-primary hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            {isEditMode ? '✓ Done Editing' : '✏️ Customize Dashboard'}
          </button>

          {isEditMode && (
            <button
              onClick={() => setShowWidgetGallery(!showWidgetGallery)}
              className="px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              + Add Widget
            </button>
          )}
        </div>

        {isEditMode && (
          <div className="text-sm text-text-secondary">
            💡 Drag to move • Resize from bottom-right corner • Click X to remove
          </div>
        )}
      </div>

      {/* Widget Gallery */}
      {showWidgetGallery && isEditMode && (
        <div className="mb-6 p-4 bg-card-bg border border-card-border rounded-xl">
          <h3 className="font-bold text-lg text-text-primary mb-4">Add Widgets</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AVAILABLE_WIDGETS.map(widget => (
              <button
                key={widget.id}
                onClick={() => handleAddWidget(widget)}
                className="p-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors text-left"
              >
                <div className="text-2xl mb-2">{widget.icon}</div>
                <div className="font-semibold text-sm text-text-primary">{widget.title}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <GridLayout
        className="layout"
        layout={layout}
        cols={5}
        rowHeight={150}
        width={1200}
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        compactType="vertical"
        preventCollision={false}
      >
        {widgets.map(widget => (
          <div key={widget.layoutId} className="relative">
            <WidgetCard className="h-full">
              {isEditMode && (
                <button
                  onClick={() => handleRemoveWidget(widget.layoutId)}
                  className="absolute top-2 right-2 z-10 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors text-xs font-bold"
                  title="Remove widget"
                >
                  ✕
                </button>
              )}
              {renderWidgetContent(widget)}
            </WidgetCard>
          </div>
        ))}
      </GridLayout>

      {/* New Note Button - Always visible at bottom */}
      {!isEditMode && (
        <div className="mt-6">
          <button
            onClick={onNewNote}
            className="w-full flex items-center justify-center p-4 bg-card-bg backdrop-blur-xl rounded-2xl text-text-primary font-semibold hover:bg-white/80 dark:hover:bg-white/20 transition-all duration-200 shadow-glass border border-card-border"
          >
            New Note
            <span className="ml-3 w-6 h-6 bg-black/10 dark:bg-white/20 rounded-full flex items-center justify-center">
              +
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
