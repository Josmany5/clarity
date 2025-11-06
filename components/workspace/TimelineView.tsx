import React from 'react';
import type { Workspace, Note, Task } from '../../App';
import { parseLocalDate } from '../../utils/dateUtils';

interface TimelineViewProps {
  workspace: Workspace;
  onUpdateWorkspace: (workspace: Workspace) => void;
  notes: Note[];
  tasks: Task[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  workspace,
  notes,
  tasks,
}) => {
  // Get entity data with timestamps
  const getEntityWithTimestamp = (entity: any) => {
    let timestamp = 0;
    let title = '';
    let icon = '📄';
    let color = 'blue';

    if (entity.type === 'note') {
      const note = notes.find(n => n.id === entity.entityId);
      timestamp = note?.lastModified || 0;
      title = note?.title || 'Unknown Note';
      icon = '📝';
      color = 'purple';
    } else if (entity.type === 'task') {
      const task = tasks.find(t => t.id === entity.entityId);
      // Use dueDate if available, otherwise createdAt
      if (task?.dueDate) {
        timestamp = parseLocalDate(task.dueDate).getTime();
      } else {
        timestamp = task?.createdAt || 0;
      }
      title = task?.title || 'Unknown Task';
      icon = task?.completed ? '✅' : '☐';
      color = task?.completed ? 'green' : 'orange';
    } else if (entity.type === 'project') {
      timestamp = Date.now();
      title = 'Project';
      icon = '📁';
      color = 'pink';
    } else {
      timestamp = Date.now();
      title = 'Goal';
      icon = '🎯';
      color = 'cyan';
    }

    return {
      ...entity,
      timestamp,
      title,
      icon,
      color,
    };
  };

  // Sort entities by timestamp
  const sortedEntities = workspace.entities
    .map(getEntityWithTimestamp)
    .sort((a, b) => b.timestamp - a.timestamp);

  // Group by date
  const groupedByDate: { [key: string]: any[] } = {};
  sortedEntities.forEach((entity) => {
    const dateKey = new Date(entity.timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }
    groupedByDate[dateKey].push(entity);
  });

  const colorClasses: { [key: string]: { bg: string; border: string; text: string } } = {
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500', text: 'text-orange-600' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500', text: 'text-green-600' },
    pink: { bg: 'bg-pink-500/10', border: 'border-pink-500', text: 'text-pink-600' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500', text: 'text-cyan-600' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500', text: 'text-blue-600' },
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      {workspace.entities.length === 0 ? (
        <div className="text-center py-20 text-text-secondary">
          <p className="text-lg font-semibold mb-2">No Items</p>
          <p className="text-sm">Add items to see them in timeline view</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-card-border">
            <h3 className="text-lg font-bold text-text-primary">
              Timeline ({workspace.entities.length} items)
            </h3>
            <div className="text-sm text-text-secondary">
              Sorted by date
            </div>
          </div>

          {Object.entries(groupedByDate).map(([date, entities]) => (
            <div key={date} className="relative">
              {/* Date Header */}
              <div className="sticky top-0 bg-card-bg pb-3 z-10">
                <h4 className="text-lg font-bold text-text-primary">{date}</h4>
              </div>

              {/* Timeline Line */}
              <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-card-border"></div>

              {/* Timeline Items */}
              <div className="space-y-4 pl-10">
                {entities.map((entity) => {
                  const colors = colorClasses[entity.color] || colorClasses.blue;
                  return (
                    <div key={entity.id} className="relative">
                      {/* Timeline Dot */}
                      <div
                        className={`absolute -left-[26px] top-4 w-3 h-3 rounded-full ${colors.bg} border-2 ${colors.border}`}
                      ></div>

                      {/* Content Card */}
                      <div
                        className={`p-4 rounded-lg ${colors.bg} border-l-4 ${colors.border} hover:scale-[1.02] transition-all`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{entity.icon}</span>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-text-primary">{entity.title}</h5>
                            <div className="flex items-center gap-2 mt-2">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-semibold ${colors.bg} ${colors.text} capitalize`}
                              >
                                {entity.type}
                              </span>
                              <span className="text-xs text-text-secondary">
                                {new Date(entity.timestamp).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
