import React, { useState } from 'react';
import { RichTextEditor } from '../RichTextEditor';
import type { Note, Task } from '../../App';

interface NodePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'note' | 'task' | 'project' | 'goal';
  entityId: string;
  notes: Note[];
  tasks: Task[];
  onUpdateNote?: (note: Note) => void;
  onUpdateTask?: (task: Task) => void;
}

export const NodePreviewModal: React.FC<NodePreviewModalProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  notes,
  tasks,
  onUpdateNote,
  onUpdateTask,
}) => {
  if (!isOpen) return null;

  const renderNotePreview = () => {
    const note = notes.find(n => n.id === entityId);
    if (!note) return <div className="text-text-secondary">Note not found</div>;

    const [editedTitle, setEditedTitle] = useState(note.title);
    const [editedContent, setEditedContent] = useState(note.content);

    const handleSave = () => {
      if (onUpdateNote) {
        onUpdateNote({
          ...note,
          title: editedTitle,
          content: editedContent,
        });
      }
      onClose();
    };

    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-card-border">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full text-2xl font-bold bg-transparent text-text-primary border-none focus:outline-none focus:ring-2 focus:ring-accent rounded px-2 py-1"
            placeholder="Note title..."
          />
          <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
            <span>📝 Note</span>
            <span>Last modified: {new Date(note.lastModified).toLocaleString()}</span>
          </div>
        </div>

        {/* Content Editor */}
        <div className="flex-1 overflow-hidden">
          <RichTextEditor
            content={editedContent}
            onChange={setEditedContent}
            placeholder="Start writing your note..."
          />
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-card-border flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-black/10 dark:bg-white/10 text-text-primary rounded-lg font-semibold hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-secondary transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    );
  };

  const renderTaskPreview = () => {
    const task = tasks.find(t => t.id === entityId);
    if (!task) return <div className="text-text-secondary">Task not found</div>;

    const [editedTitle, setEditedTitle] = useState(task.title);
    const [editedCompleted, setEditedCompleted] = useState(task.completed);
    const [editedUrgent, setEditedUrgent] = useState(task.urgent);
    const [editedImportant, setEditedImportant] = useState(task.important);
    const [editedDueDate, setEditedDueDate] = useState(task.dueDate || '');
    const [editedDueTime, setEditedDueTime] = useState(task.dueTime || '');

    const handleSave = () => {
      if (onUpdateTask) {
        onUpdateTask({
          ...task,
          title: editedTitle,
          completed: editedCompleted,
          urgent: editedUrgent,
          important: editedImportant,
          dueDate: editedDueDate || undefined,
          dueTime: editedDueTime || undefined,
        });
      }
      onClose();
    };

    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-card-border">
          <div className="flex items-start gap-3">
            <button
              onClick={() => setEditedCompleted(!editedCompleted)}
              className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                editedCompleted
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'border-card-border hover:border-accent'
              }`}
            >
              {editedCompleted && '✓'}
            </button>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="flex-1 text-2xl font-bold bg-transparent text-text-primary border-none focus:outline-none focus:ring-2 focus:ring-accent rounded px-2 py-1"
              placeholder="Task title..."
            />
          </div>

          <div className="flex items-center gap-4 mt-4 text-sm">
            <span className="text-text-secondary">☐ Task</span>
            <span className="text-text-secondary">
              Created: {new Date(task.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Task Properties */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-3">
              Priority
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editedUrgent}
                  onChange={(e) => setEditedUrgent(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <span className="text-text-primary">🔴 Urgent</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editedImportant}
                  onChange={(e) => setEditedImportant(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <span className="text-text-primary">⭐ Important</span>
              </label>
            </div>
          </div>

          {/* Due Date & Time */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-3">
              Due Date & Time
            </label>
            <div className="flex gap-3">
              <input
                type="date"
                value={editedDueDate}
                onChange={(e) => setEditedDueDate(e.target.value)}
                className="flex-1 px-4 py-2 bg-black/5 dark:bg-white/5 text-text-primary rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                type="time"
                value={editedDueTime}
                onChange={(e) => setEditedDueTime(e.target.value)}
                className="px-4 py-2 bg-black/5 dark:bg-white/5 text-text-primary rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {/* Status Badge */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-3">
              Status
            </label>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
              editedCompleted
                ? 'bg-green-500/10 text-green-600'
                : 'bg-orange-500/10 text-orange-600'
            }`}>
              <span className="text-xl">{editedCompleted ? '✅' : '⏳'}</span>
              <span className="font-semibold">
                {editedCompleted ? 'Completed' : 'In Progress'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-card-border flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-black/10 dark:bg-white/10 text-text-primary rounded-lg font-semibold hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-secondary transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (entityType) {
      case 'note':
        return renderNotePreview();
      case 'task':
        return renderTaskPreview();
      case 'project':
        return (
          <div className="flex items-center justify-center h-full text-text-secondary">
            <div className="text-center">
              <span className="text-6xl mb-4 block">📁</span>
              <p className="text-lg font-semibold">Project Preview</p>
              <p className="text-sm mt-2">Coming soon...</p>
            </div>
          </div>
        );
      case 'goal':
        return (
          <div className="flex items-center justify-center h-full text-text-secondary">
            <div className="text-center">
              <span className="text-6xl mb-4 block">🎯</span>
              <p className="text-lg font-semibold">Goal Preview</p>
              <p className="text-sm mt-2">Coming soon...</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div
        className="bg-card-bg border border-card-border rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 flex items-center justify-center text-text-primary text-xl transition-colors z-10"
          aria-label="Close"
        >
          ✕
        </button>

        {renderContent()}
      </div>
    </div>
  );
};
