import React, { useState } from 'react';
import { WidgetCard } from './WidgetCard';
import { DateTimePicker } from './DateTimePicker';
import { ProjectIcon } from './Icons';
import { parseLocalDate } from '../utils/dateUtils';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  createdAt: number;
  dueDate?: string;
  dueTime?: string;
}

interface ProjectsPageProps {}

export const ProjectsPage: React.FC<ProjectsPageProps> = () => {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('projects');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [filter, setFilter] = useState<'all' | Project['status']>('all');
  const [schedulingProject, setSchedulingProject] = useState<Project | null>(null);
  const [schedulingNew, setSchedulingNew] = useState(false);
  const [newProjectSchedule, setNewProjectSchedule] = useState<{ date: string; time: string } | undefined>();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      if (editingProject) {
        // Update existing project
        const updated = projects.map(p =>
          p.id === editingProject.id
            ? {
                ...p,
                name: newProjectName.trim(),
                description: newProjectDesc.trim(),
                dueDate: newProjectSchedule?.date,
                dueTime: newProjectSchedule?.time,
              }
            : p
        );
        setProjects(updated);
        localStorage.setItem('projects', JSON.stringify(updated));
        setEditingProject(null);
      } else {
        // Create new project
        const newProject: Project = {
          id: crypto.randomUUID(),
          name: newProjectName.trim(),
          description: newProjectDesc.trim(),
          status: 'planning',
          createdAt: Date.now(),
          dueDate: newProjectSchedule?.date,
          dueTime: newProjectSchedule?.time,
        };
        const updated = [newProject, ...projects];
        setProjects(updated);
        localStorage.setItem('projects', JSON.stringify(updated));
      }
      setNewProjectName('');
      setNewProjectDesc('');
      setNewProjectSchedule(undefined);
      setShowAddModal(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setNewProjectName(project.name);
    setNewProjectDesc(project.description);
    setNewProjectSchedule(project.dueDate && project.dueTime ? { date: project.dueDate, time: project.dueTime } : undefined);
    setShowAddModal(true);
  };

  const updateProjectStatus = (id: string, status: Project['status']) => {
    const updated = projects.map(p => p.id === id ? { ...p, status } : p);
    setProjects(updated);
    localStorage.setItem('projects', JSON.stringify(updated));
  };

  const updateProjectSchedule = (id: string, schedule: { date: string; time: string } | undefined) => {
    const updated = projects.map(p => p.id === id ? { ...p, dueDate: schedule?.date, dueTime: schedule?.time } : p);
    setProjects(updated);
    localStorage.setItem('projects', JSON.stringify(updated));
  };

  const deleteProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project && window.confirm(`Delete "${project.name}"?`)) {
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      localStorage.setItem('projects', JSON.stringify(updated));
    }
  };

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter(p => p.status === filter);

  const statusColors = {
    'planning': 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    'in-progress': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    'completed': 'bg-green-500/20 text-green-500 border-green-500/30',
    'on-hold': 'bg-gray-500/20 text-gray-500 border-gray-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Add Project Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-primary">Projects</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
        >
          + New Project
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'planning', label: 'Planning' },
          { key: 'in-progress', label: 'In Progress' },
          { key: 'completed', label: 'Completed' },
          { key: 'on-hold', label: 'On Hold' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
              filter === key
                ? 'bg-accent text-white'
                : 'bg-black/5 dark:bg-white/5 text-text-secondary hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            {label} ({key === 'all' ? projects.length : projects.filter(p => p.status === key).length})
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length > 0 ? (
          filteredProjects.map(project => (
            <div
              key={project.id}
              className={`bg-card-bg backdrop-blur-xl rounded-2xl p-6 border-2 ${statusColors[project.status]} shadow-glass transition-transform hover:scale-[1.02]`}
            >
              <div className="flex items-start justify-between mb-3">
                <ProjectIcon className="w-8 h-8 text-accent" />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="p-1.5 text-text-secondary hover:text-blue-500 transition-colors"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <select
                    value={project.status}
                    onChange={(e) => updateProjectStatus(project.id, e.target.value as Project['status'])}
                    className="text-xs px-2 py-1 rounded bg-black/10 dark:bg-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    aria-label="Project status"
                  >
                    <option value="planning">Planning</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">{project.name}</h3>
              {project.description && (
                <p className="text-sm text-text-secondary mb-4">{project.description}</p>
              )}
              <div className="mb-3">
                <button
                  onClick={() => setSchedulingProject(project)}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent text-left"
                >
                  📅 {project.dueDate
                    ? `Due ${project.dueTime
                      ? new Date(`${project.dueDate}T${project.dueTime}`).toLocaleDateString()
                      : parseLocalDate(project.dueDate).toLocaleDateString()
                    }`
                    : 'Schedule'
                  }
                </button>
              </div>
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-card-border">
                <span className="text-xs text-text-secondary">
                  Created: {new Date(project.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-accent rounded px-2"
                  aria-label="Delete project"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <WidgetCard>
              <div className="flex flex-col items-center justify-center p-10 text-center">
                <ProjectIcon className="w-16 h-16 text-accent mb-4" />
                <h2 className="text-2xl font-bold text-text-primary mb-2">No Projects Found</h2>
                <p className="text-text-secondary">
                  {filter === 'all' ? 'Create your first project to get started!' : `No projects with status "${filter}"`}
                </p>
              </div>
            </WidgetCard>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card-bg border border-card-border rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-4 border-b border-card-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary">
                {editingProject ? 'Edit Project' : 'New Project'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProject(null);
                  setNewProjectName('');
                  setNewProjectDesc('');
                  setNewProjectSchedule(undefined);
                }}
                className="text-text-secondary hover:text-text-primary"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProject} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g., Launch website redesign"
                  className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 text-text-primary rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Description
                </label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="What is this project about?"
                  rows={3}
                  className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 text-text-primary rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Due Date & Time
                </label>
                <button
                  type="button"
                  onClick={() => setSchedulingNew(true)}
                  className="w-full px-3 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent text-left"
                >
                  📅 {newProjectSchedule ? `Due ${new Date(`${newProjectSchedule.date}T${newProjectSchedule.time}`).toLocaleDateString()}` : 'Set Due Date'}
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProject(null);
                    setNewProjectName('');
                    setNewProjectDesc('');
                    setNewProjectSchedule(undefined);
                  }}
                  className="flex-1 px-4 py-2 bg-black/10 dark:bg-white/10 text-text-primary rounded-lg font-semibold hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-secondary transition-colors"
                >
                  {editingProject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Date Time Picker Modals */}
      {schedulingNew && (
        <DateTimePicker
          value={newProjectSchedule}
          onChange={(value) => setNewProjectSchedule(value)}
          onClose={() => setSchedulingNew(false)}
          title="Schedule Project"
        />
      )}

      {schedulingProject && (
        <DateTimePicker
          value={schedulingProject.dueDate && schedulingProject.dueTime ? { date: schedulingProject.dueDate, time: schedulingProject.dueTime } : undefined}
          onChange={(value) => updateProjectSchedule(schedulingProject.id, value)}
          onClose={() => setSchedulingProject(null)}
          title="Schedule Project"
        />
      )}
    </div>
  );
};
