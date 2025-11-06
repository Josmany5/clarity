import React from 'react';
import type { Workspace, Note, Task } from '../../App';
import { parseLocalDate } from '../../utils/dateUtils';

interface ListViewProps {
  workspace: Workspace;
  onUpdateWorkspace: (workspace: Workspace) => void;
  notes: Note[];
  tasks: Task[];
}

export const ListView: React.FC<ListViewProps> = ({
  workspace,
  notes,
  tasks,
}) => {
  const getEntityData = (entity: any) => {
    if (entity.type === 'note') {
      const note = notes.find(n => n.id === entity.entityId);
      return {
        title: note?.title || 'Unknown Note',
        subtitle: new Date(note?.lastModified || 0).toLocaleDateString(),
        icon: '📝',
        color: 'text-purple-600',
        bgColor: 'bg-purple-500/10',
      };
    } else if (entity.type === 'task') {
      const task = tasks.find(t => t.id === entity.entityId);
      return {
        title: task?.title || 'Unknown Task',
        subtitle: task?.dueDate
          ? `Due: ${parseLocalDate(task.dueDate).toLocaleDateString()}`
          : 'No due date',
        icon: task?.completed ? '✅' : '☐',
        color: task?.completed ? 'text-green-600' : 'text-orange-600',
        bgColor: task?.completed ? 'bg-green-500/10' : 'bg-orange-500/10',
      };
    } else if (entity.type === 'project') {
      return {
        title: 'Project',
        subtitle: 'Project item',
        icon: '📁',
        color: 'text-pink-600',
        bgColor: 'bg-pink-500/10',
      };
    } else {
      return {
        title: 'Goal',
        subtitle: 'Goal item',
        icon: '🎯',
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-500/10',
      };
    }
  };

  // Sort entities by position.y for vertical ordering
  const sortedEntities = [...workspace.entities].sort((a, b) => a.position.y - b.position.y);

  return (
    <div className="p-6 h-full overflow-y-auto">
      {workspace.entities.length === 0 ? (
        <div className="text-center py-20 text-text-secondary">
          <p className="text-lg font-semibold mb-2">No Items</p>
          <p className="text-sm">Add items to see them in list view</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-card-border">
            <h3 className="text-lg font-bold text-text-primary">
              All Items ({workspace.entities.length})
            </h3>
            <div className="text-sm text-text-secondary">
              Sorted by position
            </div>
          </div>
          {sortedEntities.map((entity) => {
            const data = getEntityData(entity);
            return (
              <div
                key={entity.id}
                className={`p-4 rounded-lg ${data.bgColor} border-l-4 border-${data.color} hover:scale-[1.02] transition-all`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{data.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold text-text-primary`}>{data.title}</h4>
                    <p className="text-xs text-text-secondary mt-1">{data.subtitle}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${data.bgColor} ${data.color} capitalize`}>
                        {entity.type}
                      </span>
                      {entity.links.length > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs bg-black/10 dark:bg-white/10 text-text-secondary">
                          {entity.links.length} link{entity.links.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
