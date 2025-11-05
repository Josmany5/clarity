import React, { useState } from 'react';
import type { Note, Task } from '../../App';
import { RichTextEditor } from '../RichTextEditor';

interface CreateEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNote: (title: string, content: string) => Note;
  onCreateTask: (title: string, urgent: boolean, important: boolean, dueDate?: string, dueTime?: string) => Task;
  onAddToWorkspace: (entityType: 'note' | 'task' | 'project' | 'goal', entityId: string) => void;
}

export const CreateEntityModal: React.FC<CreateEntityModalProps> = ({
  isOpen,
  onClose,
  onCreateNote,
  onCreateTask,
  onAddToWorkspace,
}) => {
  const [entityType, setEntityType] = useState<'note' | 'task' | 'project' | 'goal'>('note');

  // Note state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Task state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskUrgent, setTaskUrgent] = useState(false);
  const [taskImportant, setTaskImportant] = useState(false);
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskDueTime, setTaskDueTime] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setNoteTitle('');
    setNoteContent('');
    setTaskTitle('');
    setTaskUrgent(false);
    setTaskImportant(false);
    setTaskDueDate('');
    setTaskDueTime('');
  };

  const handleCreate = () => {
    if (entityType === 'note') {
      if (!noteTitle.trim()) {
        alert('Please enter a note title');
        return;
      }
      const newNote = onCreateNote(noteTitle, noteContent);
      onAddToWorkspace('note', newNote.id);
    } else if (entityType === 'task') {
      if (!taskTitle.trim()) {
        alert('Please enter a task title');
        return;
      }
      const newTask = onCreateTask(
        taskTitle,
        taskUrgent,
        taskImportant,
        taskDueDate || undefined,
        taskDueTime || undefined
      );
      onAddToWorkspace('task', newTask.id);
    } else if (entityType === 'project') {
      alert('Project creation coming soon...');
      return;
    } else if (entityType === 'goal') {
      alert('Goal creation coming soon...');
      return;
    }

    resetForm();
    onClose();
  };

  const renderForm = () => {
    switch (entityType) {
      case 'note':
        return (
          <div className="flex flex-col h-full">
            {/* Title */}
            <div className="p-6 border-b border-card-border">
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full text-2xl font-bold bg-transparent text-text-primary border-none focus:outline-none focus:ring-2 focus:ring-accent rounded px-2 py-1"
                placeholder="Note title..."
                autoFocus
              />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <RichTextEditor
                content={noteContent}
                onChange={setNoteContent}
                placeholder="Start writing your note..."
              />
            </div>
          </div>
        );

      case 'task':
        return (
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Task Title
              </label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full text-lg px-4 py-2 bg-black/5 dark:bg-white/5 text-text-primary rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="What needs to be done?"
                autoFocus
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-3">
                Priority
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={taskUrgent}
                    onChange={(e) => setTaskUrgent(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-text-primary">🔴 Urgent</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={taskImportant}
                    onChange={(e) => setTaskImportant(e.target.checked)}
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
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="flex-1 px-4 py-2 bg-black/5 dark:bg-white/5 text-text-primary rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <input
                  type="time"
                  value={taskDueTime}
                  onChange={(e) => setTaskDueTime(e.target.value)}
                  className="px-4 py-2 bg-black/5 dark:bg-white/5 text-text-primary rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
          </div>
        );

      case 'project':
        return (
          <div className="flex items-center justify-center h-full text-text-secondary">
            <div className="text-center">
              <span className="text-6xl mb-4 block">📁</span>
              <p className="text-lg font-semibold">Project Creation</p>
              <p className="text-sm mt-2">Coming soon...</p>
            </div>
          </div>
        );

      case 'goal':
        return (
          <div className="flex items-center justify-center h-full text-text-secondary">
            <div className="text-center">
              <span className="text-6xl mb-4 block">🎯</span>
              <p className="text-lg font-semibold">Goal Creation</p>
              <p className="text-sm mt-2">Coming soon...</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-card-bg border border-card-border rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-card-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-text-primary">Create New Item</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 flex items-center justify-center text-text-primary text-xl transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Entity Type Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setEntityType('note')}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2 ${
                entityType === 'note'
                  ? 'bg-accent text-white shadow-lg'
                  : 'bg-black/5 dark:bg-white/5 text-text-secondary hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              <span className="text-xl">📝</span>
              <span>Note</span>
            </button>
            <button
              onClick={() => setEntityType('task')}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2 ${
                entityType === 'task'
                  ? 'bg-accent text-white shadow-lg'
                  : 'bg-black/5 dark:bg-white/5 text-text-secondary hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              <span className="text-xl">☐</span>
              <span>Task</span>
            </button>
            <button
              onClick={() => setEntityType('project')}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2 ${
                entityType === 'project'
                  ? 'bg-accent text-white shadow-lg'
                  : 'bg-black/5 dark:bg-white/5 text-text-secondary hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              <span className="text-xl">📁</span>
              <span>Project</span>
            </button>
            <button
              onClick={() => setEntityType('goal')}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2 ${
                entityType === 'goal'
                  ? 'bg-accent text-white shadow-lg'
                  : 'bg-black/5 dark:bg-white/5 text-text-secondary hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              <span className="text-xl">🎯</span>
              <span>Goal</span>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-hidden">
          {renderForm()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-card-border flex items-center justify-end gap-3">
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="px-4 py-2 bg-black/10 dark:bg-white/10 text-text-primary rounded-lg font-semibold hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={entityType === 'project' || entityType === 'goal'}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              entityType === 'project' || entityType === 'goal'
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-accent text-white hover:bg-accent-secondary'
            }`}
          >
            Create & Add to Workspace
          </button>
        </div>
      </div>
    </div>
  );
};
