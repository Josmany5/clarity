import React, { useState } from 'react';
import type { Task, Subtask } from '../App';
import { DateTimePicker } from './DateTimePicker';

interface TasksPageProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ tasks, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [view, setView] = useState<'list' | 'matrix'>('list');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [schedulingTask, setSchedulingTask] = useState<Task | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask({
        title: newTaskTitle.trim(),
        completed: false,
        urgent: false,
        important: false,
      });
      setNewTaskTitle('');
    }
  };

  const toggleComplete = (task: Task) => {
    onUpdateTask({ ...task, completed: !task.completed });
  };

  const setPriority = (task: Task, priority: 'none' | 'important' | 'urgent' | 'critical') => {
    switch (priority) {
      case 'none':
        onUpdateTask({ ...task, urgent: false, important: false });
        break;
      case 'important':
        onUpdateTask({ ...task, urgent: false, important: true });
        break;
      case 'urgent':
        onUpdateTask({ ...task, urgent: true, important: false });
        break;
      case 'critical':
        onUpdateTask({ ...task, urgent: true, important: true });
        break;
    }
  };

  const getPriority = (task: Task): 'none' | 'important' | 'urgent' | 'critical' => {
    if (task.urgent && task.important) return 'critical';
    if (task.urgent) return 'urgent';
    if (task.important) return 'important';
    return 'none';
  };

  const handleDelete = (task: Task) => {
    if (window.confirm(`Delete "${task.title}"?`)) {
      onDeleteTask(task.id);
    }
  };

  const addSubtask = (task: Task, title: string) => {
    const newSubtask: Subtask = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
    };
    onUpdateTask({
      ...task,
      subtasks: [...(task.subtasks || []), newSubtask],
    });
  };

  const toggleSubtask = (task: Task, subtaskId: string) => {
    onUpdateTask({
      ...task,
      subtasks: task.subtasks?.map(st =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      ),
    });
  };

  const deleteSubtask = (task: Task, subtaskId: string) => {
    onUpdateTask({
      ...task,
      subtasks: task.subtasks?.filter(st => st.id !== subtaskId),
    });
  };

  const updateEstimatedTime = (task: Task, minutes: number) => {
    onUpdateTask({ ...task, estimatedTime: minutes });
  };

  const formatEstimatedTime = (minutes?: number): string => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const aPriority = getPriority(a);
    const bPriority = getPriority(b);
    const priorityOrder = { critical: 0, urgent: 1, important: 2, none: 3 };
    return priorityOrder[aPriority] - priorityOrder[bPriority];
  });

  const matrixData = {
    critical: tasks.filter(t => t.urgent && t.important && !t.completed),
    important: tasks.filter(t => !t.urgent && t.important && !t.completed),
    urgent: tasks.filter(t => t.urgent && !t.important && !t.completed),
    normal: tasks.filter(t => !t.urgent && !t.important && !t.completed),
  };

  const priorityColors = {
    critical: 'border-l-4 border-red-500 bg-red-500/5',
    urgent: 'border-l-4 border-orange-500 bg-orange-500/5',
    important: 'border-l-4 border-blue-500 bg-blue-500/5',
    none: 'border-l-4 border-gray-400 bg-transparent',
  };

  const priorityBadges = {
    critical: 'bg-red-500 text-white',
    urgent: 'bg-orange-500 text-white',
    important: 'bg-blue-500 text-white',
    none: 'bg-gray-400/20 text-text-secondary',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 h-full overflow-y-auto pb-6">
      {/* Header with Quick Add */}
      <div className="bg-card-bg backdrop-blur-xl rounded-2xl p-6 border border-card-border shadow-glass">
        <form onSubmit={handleAddTask} className="flex gap-3">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task... (press Enter)"
            className="flex-1 bg-black/5 dark:bg-white/5 text-text-primary placeholder-text-secondary rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="New task"
            autoFocus
          />
          <button
            type="submit"
            className="px-8 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
          >
            Add
          </button>
        </form>
      </div>

      {/* View Toggle & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-accent text-white'
                : 'bg-black/5 dark:bg-white/5 text-text-secondary hover:text-text-primary'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'active'
                ? 'bg-accent text-white'
                : 'bg-black/5 dark:bg-white/5 text-text-secondary hover:text-text-primary'
            }`}
          >
            Active ({tasks.filter(t => !t.completed).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-accent text-white'
                : 'bg-black/5 dark:bg-white/5 text-text-secondary hover:text-text-primary'
            }`}
          >
            Done ({tasks.filter(t => t.completed).length})
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'list'
                ? 'bg-black/10 dark:bg-white/10 text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            title="List view"
          >
            List
          </button>
          <button
            onClick={() => setView('matrix')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'matrix'
                ? 'bg-black/10 dark:bg-white/10 text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            title="Matrix view"
          >
            Matrix
          </button>
        </div>
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="space-y-2">
          {sortedTasks.length > 0 ? (
            sortedTasks.map(task => {
              const priority = getPriority(task);
              return (
                <div
                  key={task.id}
                  className={`bg-card-bg backdrop-blur-xl rounded-lg p-4 border border-card-border shadow-glass transition-all hover:shadow-lg ${
                    priorityColors[priority]
                  } ${task.completed ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleComplete(task)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mt-1 transition-all focus:outline-none focus:ring-2 focus:ring-accent ${
                        task.completed
                          ? 'bg-accent border-accent'
                          : 'border-text-secondary hover:border-accent'
                      }`}
                      aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {task.completed && (
                        <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-lg text-text-primary ${task.completed ? 'line-through' : ''}`}>
                          {task.title}
                        </p>
                        {task.subtasks && task.subtasks.length > 0 && (
                          <span className="text-xs text-text-secondary bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full">
                            {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {task.dueDate && (
                          <p className="text-xs text-text-secondary">
                            📅 {new Date(`${task.dueDate}${task.dueTime ? `T${task.dueTime}` : ''}`).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              ...(task.dueTime && { hour: 'numeric', minute: '2-digit' })
                            })}
                          </p>
                        )}
                        {task.estimatedTime && (
                          <p className="text-xs text-text-secondary">
                            ⏱️ {formatEstimatedTime(task.estimatedTime)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Priority Dropdown */}
                    <select
                      value={priority}
                      onChange={(e) => setPriority(task, e.target.value as any)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent ${
                        priorityBadges[priority]
                      }`}
                      aria-label="Priority"
                    >
                      <option value="none">Normal</option>
                      <option value="important">Important</option>
                      <option value="urgent">Urgent</option>
                      <option value="critical">Critical</option>
                    </select>

                    {/* Expand Button */}
                    <button
                      onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                      className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                      aria-label="Expand task"
                    >
                      {expandedTaskId === task.id ? '▲' : '▼'}
                    </button>

                    {/* Schedule Button */}
                    <button
                      onClick={() => setSchedulingTask(task)}
                      className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                      aria-label="Schedule task"
                    >
                      📅
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(task)}
                      className="text-text-secondary hover:text-red-500 transition-colors p-1 focus:outline-none focus:ring-2 focus:ring-accent rounded"
                      aria-label="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Expanded View - Subtasks and Estimated Time */}
                  {expandedTaskId === task.id && (
                    <div className="mt-4 pt-4 border-t border-card-border">
                      {/* Estimated Time Input */}
                      <div className="mb-4">
                        <label className="text-xs font-semibold text-text-secondary mb-2 block">
                          Estimated Time
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Minutes"
                            value={task.estimatedTime || ''}
                            onChange={(e) => updateEstimatedTime(task, parseInt(e.target.value) || 0)}
                            className="w-32 bg-black/5 dark:bg-white/5 text-text-primary placeholder-text-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                          <span className="text-sm text-text-secondary py-2">minutes</span>
                        </div>
                      </div>

                      {/* Subtasks */}
                      <div>
                        <label className="text-xs font-semibold text-text-secondary mb-2 block">
                          Subtasks
                        </label>
                        <div className="space-y-2">
                          {task.subtasks?.map(subtask => (
                            <div key={subtask.id} className="flex items-center gap-2 bg-black/5 dark:bg-white/5 rounded-lg p-2">
                              <button
                                onClick={() => toggleSubtask(task, subtask.id)}
                                className={`flex-shrink-0 w-4 h-4 rounded border-2 transition-colors ${
                                  subtask.completed
                                    ? 'bg-accent border-accent'
                                    : 'border-text-secondary hover:border-accent'
                                }`}
                              >
                                {subtask.completed && (
                                  <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <path d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                              <span className={`flex-1 text-sm text-text-primary ${subtask.completed ? 'line-through' : ''}`}>
                                {subtask.title}
                              </span>
                              <button
                                onClick={() => deleteSubtask(task, subtask.id)}
                                className="text-text-secondary hover:text-red-500 transition-colors text-lg"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (newSubtaskTitle.trim()) {
                                addSubtask(task, newSubtaskTitle);
                                setNewSubtaskTitle('');
                              }
                            }}
                            className="flex gap-2"
                          >
                            <input
                              type="text"
                              value={newSubtaskTitle}
                              onChange={(e) => setNewSubtaskTitle(e.target.value)}
                              placeholder="Add subtask..."
                              className="flex-1 bg-black/5 dark:bg-white/5 text-text-primary placeholder-text-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                            <button
                              type="submit"
                              className="px-4 py-2 bg-accent/20 text-accent rounded-lg text-sm font-semibold hover:bg-accent/30 transition-colors"
                            >
                              Add
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-card-bg backdrop-blur-xl rounded-2xl p-12 border border-card-border text-center">
              <p className="text-text-secondary text-lg">
                {filter === 'completed' ? 'No completed tasks yet' : 'No tasks yet. Add one above to get started!'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Matrix View */}
      {view === 'matrix' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Critical - Do First */}
          <MatrixQuadrant
            title="Critical"
            subtitle="Do First"
            tasks={matrixData.critical}
            color="red"
            onToggle={toggleComplete}
            onDelete={handleDelete}
            onSetPriority={setPriority}
          />

          {/* Important - Schedule */}
          <MatrixQuadrant
            title="Important"
            subtitle="Schedule"
            tasks={matrixData.important}
            color="blue"
            onToggle={toggleComplete}
            onDelete={handleDelete}
            onSetPriority={setPriority}
          />

          {/* Urgent - Delegate */}
          <MatrixQuadrant
            title="Urgent"
            subtitle="Delegate"
            tasks={matrixData.urgent}
            color="orange"
            onToggle={toggleComplete}
            onDelete={handleDelete}
            onSetPriority={setPriority}
          />

          {/* Normal - Eliminate */}
          <MatrixQuadrant
            title="Normal"
            subtitle="Consider"
            tasks={matrixData.normal}
            color="gray"
            onToggle={toggleComplete}
            onDelete={handleDelete}
            onSetPriority={setPriority}
          />
        </div>
      )}

      {/* Date Time Picker Modal */}
      {schedulingTask && (
        <DateTimePicker
          value={schedulingTask.dueDate && schedulingTask.dueTime ? { date: schedulingTask.dueDate, time: schedulingTask.dueTime } : undefined}
          onChange={(value) => {
            if (value) {
              onUpdateTask({ ...schedulingTask, dueDate: value.date, dueTime: value.time });
            } else {
              onUpdateTask({ ...schedulingTask, dueDate: undefined, dueTime: undefined });
            }
          }}
          onClose={() => setSchedulingTask(null)}
          title="Schedule Task"
        />
      )}
    </div>
  );
};

// Matrix Quadrant Component
interface MatrixQuadrantProps {
  title: string;
  subtitle: string;
  tasks: Task[];
  color: 'red' | 'blue' | 'orange' | 'gray';
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
  onSetPriority: (task: Task, priority: 'none' | 'important' | 'urgent' | 'critical') => void;
}

const MatrixQuadrant: React.FC<MatrixQuadrantProps> = ({ title, subtitle, tasks, color, onToggle, onDelete, onSetPriority }) => {
  const colorClasses = {
    red: 'border-red-500/40 bg-red-500/5',
    blue: 'border-blue-500/40 bg-blue-500/5',
    orange: 'border-orange-500/40 bg-orange-500/5',
    gray: 'border-gray-500/40 bg-gray-500/5',
  };

  const badgeColors = {
    red: 'bg-red-500/20 text-red-400',
    blue: 'bg-blue-500/20 text-blue-400',
    orange: 'bg-orange-500/20 text-orange-400',
    gray: 'bg-gray-500/20 text-gray-400',
  };

  const getPriority = (task: Task): 'none' | 'important' | 'urgent' | 'critical' => {
    if (task.urgent && task.important) return 'critical';
    if (task.urgent) return 'urgent';
    if (task.important) return 'important';
    return 'none';
  };

  return (
    <div className={`bg-card-bg backdrop-blur-xl rounded-2xl p-6 border-2 ${colorClasses[color]} shadow-glass`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-text-primary">{title}</h3>
          <p className={`text-sm font-medium ${badgeColors[color]}`}>{subtitle}</p>
        </div>
        <span className="text-2xl font-bold text-text-secondary">{tasks.length}</span>
      </div>

      <div className="space-y-2">
        {tasks.length > 0 ? (
          tasks.map(task => (
            <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <button
                onClick={() => onToggle(task)}
                className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-text-secondary hover:border-accent transition-colors focus:outline-none"
              >
                {task.completed && <div className="w-full h-full rounded-full bg-accent"></div>}
              </button>
              <span className={`flex-1 text-sm text-text-primary truncate ${task.completed ? 'line-through' : ''}`}>
                {task.title}
              </span>
              <button
                onClick={() => onDelete(task)}
                className="text-text-secondary hover:text-red-500 transition-colors p-1 focus:outline-none"
                aria-label="Delete"
              >
                ×
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-text-secondary text-center py-6">No tasks</p>
        )}
      </div>
    </div>
  );
};
