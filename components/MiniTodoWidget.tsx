import React from 'react';
import { WidgetCard } from './WidgetCard';
import type { Task } from '../App';

interface MiniTodoWidgetProps {
  tasks: Task[];
  onUpdateTask?: (task: Task) => void;
  onAddTask?: () => void;
}

export const MiniTodoWidget: React.FC<MiniTodoWidgetProps> = ({ tasks, onUpdateTask, onAddTask }) => {
  // Get incomplete tasks, sorted by creation date (newest first)
  const incompleteTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 4); // Show up to 4 tasks to keep it compact

  const handleToggleComplete = (task: Task) => {
    if (onUpdateTask) {
      onUpdateTask({ ...task, completed: !task.completed });
    }
  };

  return (
    <WidgetCard>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg text-text-primary">Active Tasks</h3>
        {onAddTask && (
          <button
            onClick={onAddTask}
            className="text-accent hover:text-accent-secondary transition-colors text-sm font-medium"
            title="View all tasks"
          >
            View All →
          </button>
        )}
      </div>

      {/* Task List */}
      {incompleteTasks.length > 0 ? (
        <ul className="space-y-3">
          {incompleteTasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center p-2 -m-2 rounded-lg cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              onClick={() => handleToggleComplete(task)}
            >
              <button
                className="flex-shrink-0 w-5 h-5 rounded border-2 border-text-secondary hover:border-accent transition-colors flex items-center justify-center mr-3"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleComplete(task);
                }}
              >
                {task.completed && (
                  <svg className="w-3 h-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary truncate">{task.title}</p>
              </div>
              {(task.urgent || task.important) && (
                <div className="flex gap-1 flex-shrink-0 ml-2">
                  {task.urgent && (
                    <span className="text-xs w-5 h-5 flex items-center justify-center bg-red-500/20 text-red-500 dark:text-red-300 rounded">
                      !
                    </span>
                  )}
                  {task.important && (
                    <span className="text-xs w-5 h-5 flex items-center justify-center bg-yellow-500/20 text-yellow-500 dark:text-yellow-300 rounded">
                      ★
                    </span>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-text-secondary text-center py-4">No active tasks</p>
      )}
    </WidgetCard>
  );
};
