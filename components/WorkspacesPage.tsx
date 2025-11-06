import React, { useState } from 'react';
import type { Workspace, Note, Task, ViewMode } from '../App';
import { WidgetCard } from './WidgetCard';
import { WorkspaceIcon, SunIcon, MoonIcon } from './Icons';
import { MapView } from './workspace/MapView';
import { ListView } from './workspace/ListView';
import { TableView } from './workspace/TableView';
import { TimelineView } from './workspace/TimelineView';
import { TreeView } from './workspace/TreeView';
import { CreateEntityModal } from './workspace/CreateEntityModal';

interface WorkspacesPageProps {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string | null) => void;
  onCreateWorkspace: (name: string, description?: string) => Workspace;
  onUpdateWorkspace: (workspace: Workspace) => void;
  onDeleteWorkspace: (id: string) => void;
  notes: Note[];
  tasks: Task[];
  onUpdateNote?: (note: Note) => void;
  onUpdateTask?: (task: Task) => void;
  onAddNote?: (title: string, content: string) => Note;
  onAddTask?: (task: { title: string; urgent: boolean; important: boolean; dueDate?: string; dueTime?: string }) => Task;
  themeMode: 'light' | 'dark';
  toggleTheme: () => void;
}

export const WorkspacesPage: React.FC<WorkspacesPageProps> = ({
  workspaces,
  activeWorkspaceId,
  setActiveWorkspaceId,
  onCreateWorkspace,
  onUpdateWorkspace,
  onDeleteWorkspace,
  notes,
  tasks,
  onUpdateNote,
  onUpdateTask,
  onAddNote,
  onAddTask,
  themeMode,
  toggleTheme,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');
  const [showEntityPicker, setShowEntityPicker] = useState(false);
  const [showCreateEntityModal, setShowCreateEntityModal] = useState(false);

  const activeWorkspace = workspaces.find(ws => ws.id === activeWorkspaceId);

  // Create first workspace if none exist
  React.useEffect(() => {
    if (workspaces.length === 0) {
      const firstWorkspace = onCreateWorkspace('My Workspace', 'Your first spatial workspace');
      setActiveWorkspaceId(firstWorkspace.id);
    } else if (!activeWorkspaceId && workspaces.length > 0) {
      setActiveWorkspaceId(workspaces[0].id);
    }
  }, [workspaces.length, activeWorkspaceId]);

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim()) {
      const newWorkspace = onCreateWorkspace(newWorkspaceName, newWorkspaceDescription);
      setNewWorkspaceName('');
      setNewWorkspaceDescription('');
      setShowCreateModal(false);
      setActiveWorkspaceId(newWorkspace.id);
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    if (activeWorkspace) {
      onUpdateWorkspace({ ...activeWorkspace, viewMode: mode });
    }
  };

  const handleCreateNote = (title: string, content: string): Note => {
    if (!onAddNote) {
      throw new Error('onAddNote prop not provided');
    }
    return onAddNote(title, content);
  };

  const handleCreateTask = (
    title: string,
    urgent: boolean,
    important: boolean,
    dueDate?: string,
    dueTime?: string
  ): Task => {
    if (!onAddTask) {
      throw new Error('onAddTask prop not provided');
    }
    return onAddTask({ title, urgent, important, dueDate, dueTime });
  };

  const handleAddEntityToWorkspace = (entityType: 'note' | 'task' | 'project' | 'goal', entityId: string) => {
    if (!activeWorkspace) return;

    const newEntity = {
      id: crypto.randomUUID(),
      type: entityType,
      entityId: entityId,
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
      links: [],
    };

    onUpdateWorkspace({
      ...activeWorkspace,
      entities: [...activeWorkspace.entities, newEntity],
    });
  };

  const renderViewContent = () => {
    if (!activeWorkspace) {
      return (
        <div className="text-center py-20 text-text-secondary">
          <WorkspaceIcon className="w-24 h-24 mx-auto mb-4 opacity-50" />
          <h3 className="text-2xl font-bold text-text-primary mb-2">No Workspace Selected</h3>
          <p>Create a workspace to get started</p>
        </div>
      );
    }

    const viewProps = {
      workspace: activeWorkspace,
      onUpdateWorkspace,
      notes,
      tasks,
      onUpdateNote,
      onUpdateTask,
    };

    switch (activeWorkspace.viewMode) {
      case 'map':
        return <MapView {...viewProps} />;
      case 'list':
        return <ListView {...viewProps} />;
      case 'table':
        return <TableView {...viewProps} />;
      case 'timeline':
        return <TimelineView {...viewProps} />;
      case 'tree':
        return <TreeView {...viewProps} />;
      case 'zoom':
        return <MapView {...viewProps} />; // Zoom view is similar to map for now
      default:
        return <MapView {...viewProps} />;
    }
  };

  return (
    <div className="flex flex-col space-y-4 md:space-y-6 px-4 md:px-0 pb-6">
      {/* Header with Workspace Selector & View Modes */}
      <WidgetCard>
        <div className="p-4 md:p-6">
          <div className="flex flex-col gap-4">
            {/* Workspace Selector */}
            <div className="flex items-center gap-3">
              <WorkspaceIcon className="w-6 h-6 md:w-8 md:h-8 text-accent flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <select
                  value={activeWorkspaceId || ''}
                  onChange={(e) => setActiveWorkspaceId(e.target.value)}
                  className="text-xl md:text-2xl font-bold bg-transparent text-text-primary border-none focus:outline-none focus:ring-2 focus:ring-accent rounded-lg px-2 py-1 cursor-pointer w-full"
                >
                  {workspaces.map(ws => (
                    <option key={ws.id} value={ws.id}>{ws.name}</option>
                  ))}
                </select>
                {activeWorkspace && (
                  <p className="text-xs md:text-sm text-text-secondary mt-1">
                    {activeWorkspace.description || `${activeWorkspace.entities.length} items`}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3 md:px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent whitespace-nowrap text-sm md:text-base flex-shrink-0"
              >
                + New
              </button>
            </div>

            {/* View Mode Toolbar */}
            {activeWorkspace && (
              <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1.5 rounded-lg flex-wrap">
                {[
                  { mode: 'map' as ViewMode, label: '2D Map', icon: '🗺️', shortLabel: 'Map' },
                  { mode: 'list' as ViewMode, label: 'List', icon: '📋', shortLabel: 'List' },
                  { mode: 'table' as ViewMode, label: 'Table', icon: '📊', shortLabel: 'Table' },
                  { mode: 'timeline' as ViewMode, label: 'Timeline', icon: '📅', shortLabel: 'Timeline' },
                  { mode: 'tree' as ViewMode, label: 'Tree', icon: '🌳', shortLabel: 'Tree' },
                  { mode: 'zoom' as ViewMode, label: 'Zoom', icon: '🔍', shortLabel: 'Zoom' },
                ].map(({ mode, label, icon, shortLabel }) => (
                  <button
                    key={mode}
                    onClick={() => handleViewModeChange(mode)}
                    className={`px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-semibold transition-all text-xs md:text-sm flex items-center gap-1 md:gap-2 ${
                      activeWorkspace.viewMode === mode
                        ? 'bg-accent text-white shadow-lg'
                        : 'text-text-secondary hover:bg-black/10 dark:hover:bg-white/10 hover:text-text-primary'
                    }`}
                    title={label}
                  >
                    <span>{icon}</span>
                    <span className="hidden sm:inline">{shortLabel}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {activeWorkspace && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-card-border">
              <button
                onClick={() => setShowCreateEntityModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                + Create New
              </button>
              <button
                onClick={() => setShowEntityPicker(!showEntityPicker)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                + Add Existing
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this workspace?')) {
                    onDeleteWorkspace(activeWorkspace.id);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Delete Workspace
              </button>
            </div>
          )}
        </div>
      </WidgetCard>

      {/* Entity Picker (collapsed by default) */}
      {showEntityPicker && activeWorkspace && (
        <WidgetCard>
          <div className="p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">
              Add Items to Workspace
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold text-text-secondary mb-2">Notes ({notes.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {notes.map(note => {
                    const alreadyAdded = activeWorkspace.entities.some(
                      e => e.type === 'note' && e.entityId === note.id
                    );
                    return (
                      <button
                        key={note.id}
                        disabled={alreadyAdded}
                        onClick={() => {
                          // Add note to workspace
                          const newEntity = {
                            id: crypto.randomUUID(),
                            type: 'note' as const,
                            entityId: note.id,
                            position: {
                              x: Math.random() * 400,
                              y: Math.random() * 400
                            },
                            links: [],
                          };
                          onUpdateWorkspace({
                            ...activeWorkspace,
                            entities: [...activeWorkspace.entities, newEntity],
                          });
                        }}
                        className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                          alreadyAdded
                            ? 'bg-green-500/10 text-green-600 cursor-not-allowed'
                            : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-text-primary'
                        }`}
                      >
                        {alreadyAdded ? '✓ ' : ''}
                        {note.title}
                      </button>
                    );
                  })}
                  {notes.length === 0 && (
                    <p className="text-sm text-text-secondary text-center py-4">No notes available</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-text-secondary mb-2">Tasks ({tasks.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {tasks.map(task => {
                    const alreadyAdded = activeWorkspace.entities.some(
                      e => e.type === 'task' && e.entityId === task.id
                    );
                    return (
                      <button
                        key={task.id}
                        disabled={alreadyAdded}
                        onClick={() => {
                          const newEntity = {
                            id: crypto.randomUUID(),
                            type: 'task' as const,
                            entityId: task.id,
                            position: {
                              x: Math.random() * 400,
                              y: Math.random() * 400
                            },
                            links: [],
                          };
                          onUpdateWorkspace({
                            ...activeWorkspace,
                            entities: [...activeWorkspace.entities, newEntity],
                          });
                        }}
                        className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                          alreadyAdded
                            ? 'bg-green-500/10 text-green-600 cursor-not-allowed'
                            : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-text-primary'
                        }`}
                      >
                        {alreadyAdded ? '✓ ' : ''}
                        {task.title}
                      </button>
                    );
                  })}
                  {tasks.length === 0 && (
                    <p className="text-sm text-text-secondary text-center py-4">No tasks available</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-text-secondary mb-2">Projects (0)</h4>
                <p className="text-sm text-text-secondary text-center py-4">No projects available</p>
              </div>
            </div>
          </div>
        </WidgetCard>
      )}

      {/* Main View Content */}
      <WidgetCard>
        <div className="w-full">
          {renderViewContent()}
        </div>
      </WidgetCard>

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card-bg border border-card-border rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-text-primary mb-4">Create New Workspace</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="My Workspace"
                  className="w-full px-4 py-2 bg-black/5 dark:bg-white/5 text-text-primary rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-accent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newWorkspaceDescription}
                  onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                  placeholder="Describe your workspace..."
                  rows={3}
                  className="w-full px-4 py-2 bg-black/5 dark:bg-white/5 text-text-primary rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateWorkspace}
                  className="flex-1 px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewWorkspaceName('');
                    setNewWorkspaceDescription('');
                  }}
                  className="flex-1 px-4 py-2 bg-black/10 dark:bg-white/10 text-text-primary rounded-lg font-semibold hover:bg-black/20 dark:hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Entity Modal */}
      {showCreateEntityModal && (
        <CreateEntityModal
          isOpen={showCreateEntityModal}
          onClose={() => setShowCreateEntityModal(false)}
          onCreateNote={handleCreateNote}
          onCreateTask={handleCreateTask}
          onAddToWorkspace={handleAddEntityToWorkspace}
        />
      )}
    </div>
  );
};
