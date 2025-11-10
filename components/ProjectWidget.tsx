import React, { useState } from 'react';
import { WidgetCard } from './WidgetCard';
import type { Project } from '../App';

interface ProjectWidgetProps {
  projects: Project[];
  onUpdateProject?: (project: Project) => void;
  onAddProject?: () => void;
}

export const ProjectWidget: React.FC<ProjectWidgetProps> = ({ projects, onUpdateProject, onAddProject }) => {
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 dark:text-green-300';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-400 dark:text-blue-300';
      case 'planning':
        return 'bg-purple-500/20 text-purple-400 dark:text-purple-300';
      case 'on-hold':
        return 'bg-orange-500/20 text-orange-400 dark:text-orange-300';
    }
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'in-progress':
        return '⏳';
      case 'planning':
        return '📋';
      case 'on-hold':
        return '⏸';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const sortedProjects = [...projects].sort((a, b) => {
    // Sort by status (in-progress first, then planning, then on-hold, then completed)
    const statusOrder = { 'in-progress': 0, 'planning': 1, 'on-hold': 2, 'completed': 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const activeProjects = sortedProjects.filter(p => p.status !== 'completed');
  const displayProjects = activeProjects.slice(0, 3);

  return (
    <WidgetCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-text-primary">Projects</h3>
        {onAddProject && (
          <button
            onClick={onAddProject}
            className="text-accent hover:text-accent-secondary transition-colors text-xl"
            title="Add new project"
          >
            +
          </button>
        )}
      </div>

      {displayProjects.length > 0 ? (
        <div className="space-y-3">
          {displayProjects.map((project) => (
            <div
              key={project.id}
              className="rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
            >
              <button
                onClick={() => setExpandedProjectId(expandedProjectId === project.id ? null : project.id)}
                className="w-full text-left p-3"
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">
                    {getStatusIcon(project.status)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-text-primary text-sm truncate">
                      {project.name}
                    </h4>
                    {project.dueDate && (
                      <p className="text-xs text-text-secondary mt-1">
                        Due: {formatDate(project.dueDate)}
                      </p>
                    )}
                    <span
                      className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(project.status)}`}
                    >
                      {project.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                {expandedProjectId === project.id && project.description && (
                  <p className="text-xs text-text-secondary mt-3 pl-8">
                    {project.description}
                  </p>
                )}
              </button>

              {expandedProjectId === project.id && onUpdateProject && (
                <div className="px-3 pb-3 pl-11 flex gap-2">
                  {project.status === 'planning' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateProject({ ...project, status: 'in-progress' });
                      }}
                      className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                    >
                      Start
                    </button>
                  )}
                  {project.status === 'in-progress' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateProject({ ...project, status: 'on-hold' });
                      }}
                      className="text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
                    >
                      Pause
                    </button>
                  )}
                  {project.status === 'on-hold' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateProject({ ...project, status: 'in-progress' });
                      }}
                      className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                    >
                      Resume
                    </button>
                  )}
                  {project.status !== 'completed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateProject({ ...project, status: 'completed' });
                      }}
                      className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                    >
                      Complete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-text-secondary">
          <span className="text-4xl block mb-2">📁</span>
          <p className="text-sm">No active projects yet</p>
          {onAddProject && (
            <button
              onClick={onAddProject}
              className="mt-3 text-xs text-accent hover:text-accent-secondary transition-colors"
            >
              Create your first project
            </button>
          )}
        </div>
      )}

      {activeProjects.length > 3 && (
        <div className="mt-4 text-center">
          <button className="text-xs text-accent hover:text-accent-secondary transition-colors">
            View all {activeProjects.length} projects
          </button>
        </div>
      )}
    </WidgetCard>
  );
};
