import React, { useState } from 'react';
import { WidgetCard } from './WidgetCard';
import { HistoryIcon } from './Icons';
import type { Task } from '../App';

interface Activity {
  id: string;
  title: string;
  type: 'task' | 'project' | 'note';
  action: 'completed' | 'created' | 'updated';
  timestamp: number;
}

export const HistoryPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'task' | 'project' | 'note'>('all');

  const loadActivities = (): Activity[] => {
    const activities: Activity[] = [];

    try {
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      tasks.forEach((task: Task) => {
        activities.push({
          id: task.id,
          title: task.title,
          type: 'task',
          action: task.completed ? 'completed' : 'created',
          timestamp: task.createdAt,
        });
      });
    } catch {}

    try {
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      projects.forEach((project: any) => {
        activities.push({
          id: project.id,
          title: project.name,
          type: 'project',
          action: project.status === 'completed' ? 'completed' : 'created',
          timestamp: project.createdAt,
        });
      });
    } catch {}

    try {
      const notes = JSON.parse(localStorage.getItem('notes') || '[]');
      notes.forEach((note: any) => {
        activities.push({
          id: note.id,
          title: note.title,
          type: 'note',
          action: 'updated',
          timestamp: note.lastModified,
        });
      });
    } catch {}

    return activities.sort((a, b) => b.timestamp - a.timestamp);
  };

  const activities = loadActivities();

  const getFilteredActivities = () => {
    let filtered = activities;

    if (typeFilter !== 'all') {
      filtered = filtered.filter(a => a.type === typeFilter);
    }

    if (filter !== 'all') {
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;

      if (filter === 'today') {
        filtered = filtered.filter(a => now - a.timestamp < day);
      } else if (filter === 'week') {
        filtered = filtered.filter(a => now - a.timestamp < 7 * day);
      } else if (filter === 'month') {
        filtered = filtered.filter(a => now - a.timestamp < 30 * day);
      }
    }

    return filtered;
  };

  const filteredActivities = getFilteredActivities();

  const completedTasks = activities.filter(a => a.type === 'task' && a.action === 'completed');
  const completedProjects = activities.filter(a => a.type === 'project' && a.action === 'completed');
  const totalNotes = activities.filter(a => a.type === 'note').length;

  const groupActivitiesByDate = () => {
    const groups: { [key: string]: Activity[] } = {};

    filteredActivities.forEach(activity => {
      const date = new Date(activity.timestamp).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });

    return groups;
  };

  const groupedActivities = groupActivitiesByDate();

  const actionColors = {
    completed: 'bg-green-500/10 border-green-500 text-green-600',
    created: 'bg-blue-500/10 border-blue-500 text-blue-600',
    updated: 'bg-accent/10 border-accent text-accent',
  };

  const actionIcons = {
    completed: '✓',
    created: '➕',
    updated: '✏️',
  };

  const typeIcons = {
    task: '✓',
    project: '📁',
    note: '📝',
  };

  return (
    <div className="space-y-6">
      <WidgetCard>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <HistoryIcon className="w-8 h-8 text-accent" />
            <div>
              <h2 className="text-3xl font-bold text-text-primary">Activity History</h2>
              <p className="text-sm text-text-secondary mt-1">{filteredActivities.length} activities</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2 flex-wrap">
              {(['all', 'today', 'week', 'month'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent capitalize ${
                    filter === f ? 'bg-accent text-white' : 'bg-black/5 dark:bg-white/5 text-text-secondary hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'task', 'project', 'note'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent capitalize ${
                    typeFilter === t ? 'bg-accent text-white' : 'bg-black/5 dark:bg-white/5 text-text-secondary hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </WidgetCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <WidgetCard>
          <div className="p-6 text-center">
            <div className="text-4xl font-bold text-green-500">{completedTasks.length}</div>
            <div className="text-sm text-text-secondary mt-2">Completed Tasks</div>
          </div>
        </WidgetCard>
        <WidgetCard>
          <div className="p-6 text-center">
            <div className="text-4xl font-bold text-purple-500">{completedProjects.length}</div>
            <div className="text-sm text-text-secondary mt-2">Completed Projects</div>
          </div>
        </WidgetCard>
        <WidgetCard>
          <div className="p-6 text-center">
            <div className="text-4xl font-bold text-accent">{totalNotes}</div>
            <div className="text-sm text-text-secondary mt-2">Total Notes</div>
          </div>
        </WidgetCard>
      </div>

      <WidgetCard>
        <div className="p-6">
          {Object.keys(groupedActivities).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedActivities).map(([date, dateActivities]) => (
                <div key={date}>
                  <h3 className="text-lg font-bold text-text-primary mb-3 sticky top-0 bg-card-bg py-2">{date}</h3>
                  <div className="space-y-2">
                    {dateActivities.map(activity => (
                      <div
                        key={activity.id + activity.timestamp}
                        className={`p-4 rounded-lg border-l-4 ${actionColors[activity.action]} transition-all hover:scale-[1.01]`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{typeIcons[activity.type]}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-text-primary">{activity.title}</h4>
                                <p className="text-xs text-text-secondary mt-1">
                                  {new Date(activity.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${actionColors[activity.action]}`}>
                                  {actionIcons[activity.action]} {activity.action}
                                </span>
                                <span className="px-2 py-1 bg-black/10 dark:bg-white/10 rounded text-xs text-text-secondary capitalize">
                                  {activity.type}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-text-secondary">
              <HistoryIcon className="w-20 h-20 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-text-primary mb-2">No Activity Found</h3>
              <p>No activities match your selected filters</p>
            </div>
          )}
        </div>
      </WidgetCard>
    </div>
  );
};