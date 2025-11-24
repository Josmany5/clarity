import React from 'react';

export interface ShadowFrameProps {
  id: string;
  type: 'task-list' | 'project-card' | 'calendar' | 'notes';
  data: any;
  onClose?: () => void;
  theme: string;
}

export const ShadowFrame: React.FC<ShadowFrameProps> = ({
  id,
  type,
  data,
  onClose,
  theme
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={`shadow-frame rounded-lg border p-4 shadow-md ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
      }`}
    >
      {/* Header with close button */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-300 dark:border-gray-600">
        <h3 className="font-semibold text-lg">
          {type === 'task-list' && '📋 Tasks'}
          {type === 'project-card' && '📊 Project'}
          {type === 'calendar' && '📅 Calendar'}
          {type === 'notes' && '📝 Notes'}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        )}
      </div>

      {/* Frame content */}
      <div className="frame-content">
        {type === 'task-list' && <TaskListContent data={data} />}
        {type === 'project-card' && <ProjectCardContent data={data} />}
        {type === 'calendar' && <CalendarContent data={data} />}
        {type === 'notes' && <NotesContent data={data} />}
      </div>
    </div>
  );
};

// Task List Frame Content
const TaskListContent: React.FC<{ data: any }> = ({ data }) => {
  const tasks = data.tasks || [];

  return (
    <div className="space-y-2">
      {tasks.length === 0 && (
        <p className="text-gray-500 italic">No tasks found</p>
      )}
      {tasks.map((task: any) => (
        <div
          key={task.id}
          className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <input
            type="checkbox"
            checked={task.completed}
            readOnly
            className="mt-1"
          />
          <div className="flex-1">
            <p className={task.completed ? 'line-through text-gray-500' : ''}>
              {task.title}
            </p>
            {task.priority === 'high' && (
              <span className="text-xs text-red-500">🔴 Urgent</span>
            )}
            {task.dueDate && (
              <span className="text-xs text-gray-500 ml-2">
                ⏰ {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Project Card Frame Content
const ProjectCardContent: React.FC<{ data: any }> = ({ data }) => {
  const projects = data.projects || [];

  return (
    <div className="space-y-4">
      {projects.length === 0 && (
        <p className="text-gray-500 italic">No projects found</p>
      )}
      {projects.map((project: any) => (
        <div key={project.id} className="pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
          <h4 className="font-semibold text-base mb-2">{project.title}</h4>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-500">Status:</span>
              <span className="ml-2 font-medium">{project.status || 'Unknown'}</span>
            </div>
            {project.description && (
              <div>
                <span className="text-sm text-gray-500">Description:</span>
                <p className="mt-1 text-sm">{project.description}</p>
              </div>
            )}
            {project.tasks && project.tasks.length > 0 && (
              <div>
                <span className="text-sm text-gray-500">Tasks:</span>
                <ul className="mt-1 space-y-1">
                  {project.tasks.slice(0, 5).map((task: any) => (
                    <li key={task.id} className="text-sm">
                      {task.completed ? '✓' : '○'} {task.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Calendar Frame Content
const CalendarContent: React.FC<{ data: any }> = ({ data }) => {
  const events = data.events || [];

  return (
    <div className="space-y-2">
      {events.length === 0 && (
        <p className="text-gray-500 italic">No events scheduled</p>
      )}
      {events.map((event: any) => (
        <div
          key={event.id}
          className="p-2 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20"
        >
          <p className="font-medium">{event.title}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(event.date).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
};

// Notes Frame Content
const NotesContent: React.FC<{ data: any }> = ({ data }) => {
  const notes = data.notes || [];

  return (
    <div className="space-y-2">
      {notes.length === 0 && (
        <p className="text-gray-500 italic">No notes found</p>
      )}
      {notes.map((note: any) => (
        <div
          key={note.id}
          className="p-3 rounded bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
        >
          <p className="font-medium text-sm mb-1">{note.title}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {note.content?.substring(0, 200)}
            {note.content?.length > 200 && '...'}
          </p>
        </div>
      ))}
    </div>
  );
};
