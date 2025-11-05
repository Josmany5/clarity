import React from 'react';
import type { Workspace, Note, Task } from '../../App';

interface TableViewProps {
  workspace: Workspace;
  onUpdateWorkspace: (workspace: Workspace) => void;
  notes: Note[];
  tasks: Task[];
}

export const TableView: React.FC<TableViewProps> = ({
  workspace,
  notes,
  tasks,
}) => {
  const getEntityData = (entity: any) => {
    if (entity.type === 'note') {
      const note = notes.find(n => n.id === entity.entityId);
      return {
        title: note?.title || 'Unknown Note',
        metadata: new Date(note?.lastModified || 0).toLocaleDateString(),
        icon: '📝',
      };
    } else if (entity.type === 'task') {
      const task = tasks.find(t => t.id === entity.entityId);
      return {
        title: task?.title || 'Unknown Task',
        metadata: task?.dueDate || 'No due date',
        icon: task?.completed ? '✅' : '☐',
      };
    } else if (entity.type === 'project') {
      return {
        title: 'Project',
        metadata: '-',
        icon: '📁',
      };
    } else {
      return {
        title: 'Goal',
        metadata: '-',
        icon: '🎯',
      };
    }
  };

  return (
    <div className="p-6 h-full overflow-auto">
      {workspace.entities.length === 0 ? (
        <div className="text-center py-20 text-text-secondary">
          <p className="text-lg font-semibold mb-2">No Items</p>
          <p className="text-sm">Add items to see them in table view</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-card-border">
                <th className="text-left py-3 px-4 text-sm font-bold text-text-secondary uppercase">
                  Icon
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-text-secondary uppercase">
                  Title
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-text-secondary uppercase">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-text-secondary uppercase">
                  Metadata
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-text-secondary uppercase">
                  Position
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-text-secondary uppercase">
                  Links
                </th>
              </tr>
            </thead>
            <tbody>
              {workspace.entities.map((entity) => {
                const data = getEntityData(entity);
                return (
                  <tr
                    key={entity.id}
                    className="border-b border-card-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="text-2xl">{data.icon}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-text-primary">{data.title}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/20 text-accent capitalize">
                        {entity.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-text-secondary">{data.metadata}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-mono text-text-secondary">
                        ({Math.round(entity.position.x)}, {Math.round(entity.position.y)})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-text-secondary">
                        {entity.links.length > 0
                          ? `${entity.links.length} link${entity.links.length > 1 ? 's' : ''}`
                          : 'None'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
