import React, { useState } from 'react';
import type { Workspace, Note, Task, WorkspaceEntity } from '../../App';

interface TreeViewProps {
  workspace: Workspace;
  onUpdateWorkspace: (workspace: Workspace) => void;
  notes: Note[];
  tasks: Task[];
}

export const TreeView: React.FC<TreeViewProps> = ({
  workspace,
  notes,
  tasks,
}) => {
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  const toggleExpanded = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getEntityData = (entity: WorkspaceEntity) => {
    let title = '';
    let icon = '📄';
    let color = 'text-blue-600';

    if (entity.type === 'note') {
      const note = notes.find(n => n.id === entity.entityId);
      title = note?.title || 'Unknown Note';
      icon = '📝';
      color = 'text-purple-600';
    } else if (entity.type === 'task') {
      const task = tasks.find(t => t.id === entity.entityId);
      title = task?.title || 'Unknown Task';
      icon = task?.completed ? '✅' : '☐';
      color = task?.completed ? 'text-green-600' : 'text-orange-600';
    } else if (entity.type === 'project') {
      title = 'Project';
      icon = '📁';
      color = 'text-pink-600';
    } else {
      title = 'Goal';
      icon = '🎯';
      color = 'text-cyan-600';
    }

    return { title, icon, color };
  };

  // Find root entities (no parent)
  const rootEntities = workspace.entities.filter(e => !e.parentId);

  // Find children for a given parent
  const getChildren = (parentId: string) => {
    return workspace.entities.filter(e => e.parentId === parentId);
  };

  // Find linked entities
  const getLinkedEntities = (entity: WorkspaceEntity) => {
    return entity.links
      .map(linkId => workspace.entities.find(e => e.id === linkId))
      .filter(Boolean) as WorkspaceEntity[];
  };

  const TreeNode: React.FC<{ entity: WorkspaceEntity; level: number }> = ({ entity, level }) => {
    const data = getEntityData(entity);
    const children = getChildren(entity.id);
    const linkedEntities = getLinkedEntities(entity);
    const hasChildren = children.length > 0;
    const hasLinks = linkedEntities.length > 0;
    const isExpanded = expanded[entity.id];

    return (
      <div className="mb-2">
        <div
          className={`flex items-center gap-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer`}
          style={{ paddingLeft: `${level * 24 + 8}px` }}
          onClick={() => (hasChildren || hasLinks) && toggleExpanded(entity.id)}
        >
          {/* Expand/Collapse Icon */}
          {(hasChildren || hasLinks) ? (
            <span className="text-text-secondary text-sm w-4">
              {isExpanded ? '▼' : '▶'}
            </span>
          ) : (
            <span className="w-4"></span>
          )}

          {/* Entity Icon & Title */}
          <span className="text-xl">{data.icon}</span>
          <span className={`font-semibold ${data.color}`}>{data.title}</span>

          {/* Badges */}
          <div className="flex items-center gap-1 ml-auto">
            {hasChildren && (
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 text-xs rounded">
                {children.length} child{children.length > 1 ? 'ren' : ''}
              </span>
            )}
            {hasLinks && (
              <span className="px-2 py-0.5 bg-purple-500/10 text-purple-600 text-xs rounded">
                {linkedEntities.length} link{linkedEntities.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Children */}
        {isExpanded && hasChildren && (
          <div className="mt-1">
            {children.map(child => (
              <TreeNode key={child.id} entity={child} level={level + 1} />
            ))}
          </div>
        )}

        {/* Linked Entities */}
        {isExpanded && hasLinks && (
          <div className="mt-1">
            <div
              className="text-xs text-text-secondary font-semibold uppercase tracking-wide mb-1"
              style={{ paddingLeft: `${(level + 1) * 24 + 8}px` }}
            >
              Linked Items
            </div>
            {linkedEntities.map(linked => {
              const linkedData = getEntityData(linked);
              return (
                <div
                  key={linked.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-purple-500/5 border-l-2 border-purple-500 ml-2"
                  style={{ paddingLeft: `${(level + 1) * 24 + 8}px` }}
                >
                  <span className="text-lg">{linkedData.icon}</span>
                  <span className={`text-sm font-medium ${linkedData.color}`}>
                    {linkedData.title}
                  </span>
                  <span className="px-2 py-0.5 bg-black/10 dark:bg-white/10 text-text-secondary text-xs rounded ml-auto">
                    Link
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      {workspace.entities.length === 0 ? (
        <div className="text-center py-20 text-text-secondary">
          <p className="text-lg font-semibold mb-2">No Items</p>
          <p className="text-sm">Add items to see them in tree view</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-card-border">
            <h3 className="text-lg font-bold text-text-primary">
              Hierarchy ({workspace.entities.length} items)
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const allExpanded: { [key: string]: boolean } = {};
                  workspace.entities.forEach(e => {
                    allExpanded[e.id] = true;
                  });
                  setExpanded(allExpanded);
                }}
                className="px-3 py-1 bg-accent/20 text-accent rounded text-sm font-semibold hover:bg-accent/30 transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={() => setExpanded({})}
                className="px-3 py-1 bg-black/10 dark:bg-white/10 text-text-secondary rounded text-sm font-semibold hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>

          {rootEntities.length === 0 ? (
            <div className="text-center py-10 text-text-secondary">
              <p className="text-sm">All items have parent relationships</p>
              <p className="text-xs mt-1">Expand items above to see the hierarchy</p>
            </div>
          ) : (
            <div className="space-y-1">
              {rootEntities.map(entity => (
                <TreeNode key={entity.id} entity={entity} level={0} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
