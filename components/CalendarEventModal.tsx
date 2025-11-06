import React, { useState } from 'react';
import type { Note, Task, Event } from '../App';
import { RichTextEditor } from './RichTextEditor';

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventType: 'task' | 'event' | 'note';
  eventId: string;
  notes?: Note[];
  tasks?: Task[];
  events?: Event[];
  onUpdateNote?: (note: Note) => void;
  onUpdateTask?: (task: Task) => void;
  onUpdateEvent?: (event: Event) => void;
}

export const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  isOpen,
  onClose,
  eventType,
  eventId,
  notes = [],
  tasks = [],
  events = [],
  onUpdateNote,
  onUpdateTask,
  onUpdateEvent,
}) => {
  if (!isOpen) return null;

  const renderNotePreview = () => {
    const note = notes.find(n => n.id === eventId);
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
    const task = tasks.find(t => t.id === eventId);
    if (!task) return <div className="text-text-secondary">Task not found</div>;

    const [editedTitle, setEditedTitle] = useState(task.title);
    const [editedCompleted, setEditedCompleted] = useState(task.completed);
    const [editedUrgent, setEditedUrgent] = useState(task.urgent);
    const [editedImportant, setEditedImportant] = useState(task.important);
    const [editedDueDate, setEditedDueDate] = useState(task.dueDate || '');
    const [editedDueTime, setEditedDueTime] = useState(task.dueTime || '');
    const [editedEstimatedTime, setEditedEstimatedTime] = useState(task.estimatedTime || 60);

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
          estimatedTime: editedEstimatedTime,
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

          {/* Estimated Time */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-3">
              Estimated Time (minutes)
            </label>
            <input
              type="number"
              value={editedEstimatedTime}
              onChange={(e) => setEditedEstimatedTime(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-black/5 dark:bg-white/5 text-text-primary rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-accent"
              min="0"
              step="15"
            />
          </div>

          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-3">
                Subtasks
              </label>
              <div className="space-y-2">
                {task.subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-2 p-2 bg-black/5 dark:bg-white/5 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      readOnly
                      className="w-4 h-4 rounded"
                    />
                    <span className={`text-sm ${subtask.completed ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

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

  const renderEventPreview = () => {
    const event = events.find(e => e.id === eventId);
    if (!event) return <div className="text-text-secondary">Event not found</div>;

    const [editedTitle, setEditedTitle] = useState(event.title);
    const [editedDescription, setEditedDescription] = useState(event.description || '');
    const [editedType, setEditedType] = useState(event.type);
    const [editedStartDate, setEditedStartDate] = useState(event.startDate);
    const [editedStartTime, setEditedStartTime] = useState(event.startTime);
    const [editedEndTime, setEditedEndTime] = useState(event.endTime);
    const [editedLocation, setEditedLocation] = useState(event.location || '');

    const typeIcons = {
      class: '🎓',
      meeting: '👥',
      appointment: '📅',
      other: '📌',
    };

    const typeColors = {
      class: 'bg-blue-500',
      meeting: 'bg-purple-500',
      appointment: 'bg-green-500',
      other: 'bg-gray-500',
    };

    const handleSave = () => {
      if (onUpdateEvent) {
        onUpdateEvent({
          ...event,
          title: editedTitle,
          description: editedDescription,
          type: editedType,
          startDate: editedStartDate,
          startTime: editedStartTime,
          endTime: editedEndTime,
          location: editedLocation,
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
            placeholder="Event title..."
          />
          <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
            <span>{typeIcons[event.type]} {event.type.charAt(0).toUpperCase() + event.type.slice(1)}</span>
            <span>Created: {new Date(event.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Event Properties */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Event Type */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-3">
              Event Type
            </label>
            <div className="flex gap-2">
              {(['class', 'meeting', 'appointment', 'other'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setEditedType(type)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                    editedType === type
                      ? `${typeColors[type]} text-white border-transparent`
                      : 'bg-black/5 dark:bg-white/5 border-card-border text-text-primary hover:border-accent'
                  }`}
                >
                  <span>{typeIcons[type]}</span>
                  <span className="font-medium capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-3">
              Description
            </label>
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 text-text-primary rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              placeholder="Add event description..."
              rows={4}
            />
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-3">
              Date & Time
            </label>
            <div className="space-y-3">
              <input
                type="date"
                value={editedStartDate}
                onChange={(e) => setEditedStartDate(e.target.value)}
                className="w-full px-4 py-2 bg-black/5 dark:bg-white/5 text-text-primary rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-text-secondary mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editedStartTime}
                    onChange={(e) => setEditedStartTime(e.target.value)}
                    className="w-full px-4 py-2 bg-black/5 dark:bg-white/5 text-text-primary rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-text-secondary mb-1">End Time</label>
                  <input
                    type="time"
                    value={editedEndTime}
                    onChange={(e) => setEditedEndTime(e.target.value)}
                    className="w-full px-4 py-2 bg-black/5 dark:bg-white/5 text-text-primary rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-3">
              Location
            </label>
            <input
              type="text"
              value={editedLocation}
              onChange={(e) => setEditedLocation(e.target.value)}
              className="w-full px-4 py-2 bg-black/5 dark:bg-white/5 text-text-primary rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Add location..."
            />
          </div>

          {/* Recurring Info (read-only for now) */}
          {event.recurring && (
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-3">
                Recurrence
              </label>
              <div className="p-4 bg-blue-500/10 text-blue-600 rounded-lg">
                <p className="font-medium">🔄 Repeats {event.recurring.frequency}</p>
                {event.recurring.endDate && (
                  <p className="text-sm mt-1">Until {new Date(event.recurring.endDate).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          )}
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
    switch (eventType) {
      case 'note':
        return renderNotePreview();
      case 'task':
        return renderTaskPreview();
      case 'event':
        return renderEventPreview();
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card-bg border border-card-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
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
