import React, { useState } from 'react';
import { WidgetCard } from './WidgetCard';
import { SystemsIcon } from './Icons';

interface System {
  id: string;
  name: string;
  type: 'habit' | 'routine' | 'workflow' | 'process';
  description: string;
  frequency: string;
  steps: string[];
  active: boolean;
  createdAt: string;
  icon: string;
  streak: number;
}

export const SystemsPage: React.FC = () => {
  const [systems, setSystems] = useState<System[]>([
    {
      id: '1',
      name: 'Morning Routine',
      type: 'routine',
      description: 'Daily morning routine for optimal productivity',
      frequency: 'Daily',
      steps: ['Wake up at 6am', 'Exercise for 30 min', 'Meditation', 'Healthy breakfast', 'Review daily goals'],
      active: true,
      createdAt: new Date().toISOString(),
      icon: '🌅',
      streak: 12
    },
    {
      id: '2',
      name: 'Code Review Process',
      type: 'workflow',
      description: 'Standard workflow for reviewing pull requests',
      frequency: 'As needed',
      steps: ['Check code quality', 'Run tests', 'Review documentation', 'Leave feedback', 'Approve/Request changes'],
      active: true,
      createdAt: new Date().toISOString(),
      icon: '👨‍💻',
      streak: 0
    },
    {
      id: '3',
      name: 'Deep Work Sessions',
      type: 'habit',
      description: 'Focused work blocks without distractions',
      frequency: '2x daily',
      steps: ['Block 2 hours', 'Turn off notifications', 'Work on single task', 'Take break after'],
      active: true,
      createdAt: new Date().toISOString(),
      icon: '🎯',
      streak: 45
    },
    {
      id: '4',
      name: 'Weekly Planning',
      type: 'routine',
      description: 'Sunday routine for planning the upcoming week',
      frequency: 'Weekly',
      steps: ['Review last week', 'Set 3 main goals', 'Schedule important tasks', 'Prepare materials', 'Set intentions'],
      active: true,
      createdAt: new Date().toISOString(),
      icon: '📅',
      streak: 8
    },
    {
      id: '5',
      name: 'Project Kickoff',
      type: 'process',
      description: 'Standard process for starting new projects',
      frequency: 'As needed',
      steps: ['Define objectives', 'Identify stakeholders', 'Create timeline', 'Allocate resources', 'Set milestones', 'Launch kickoff meeting'],
      active: true,
      createdAt: new Date().toISOString(),
      icon: '🚀',
      streak: 0
    },
    {
      id: '6',
      name: 'Reading Habit',
      type: 'habit',
      description: 'Daily reading for continuous learning',
      frequency: 'Daily',
      steps: ['Read for 30 minutes', 'Take notes', 'Reflect on learnings'],
      active: false,
      createdAt: new Date().toISOString(),
      icon: '📚',
      streak: 0
    }
  ]);

  const [selectedType, setSelectedType] = useState<'all' | 'habit' | 'routine' | 'workflow' | 'process'>('all');
  const [showActive, setShowActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredSystems = systems.filter(system => {
    const matchesType = selectedType === 'all' || system.type === selectedType;
    const matchesActive = showActive === 'all' ||
                         (showActive === 'active' && system.active) ||
                         (showActive === 'inactive' && !system.active);
    return matchesType && matchesActive;
  });

  const typeColors = {
    habit: 'bg-green-500/20 text-green-400 border-green-500/40',
    routine: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    workflow: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    process: 'bg-orange-500/20 text-orange-400 border-orange-500/40'
  };

  const toggleSystemActive = (id: string) => {
    setSystems(systems.map(system =>
      system.id === id ? { ...system, active: !system.active } : system
    ));
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <SystemsIcon className="w-8 h-8 text-accent" />
            Systems
          </h1>
          <p className="text-text-secondary mt-1">Habits, routines, workflows, and processes for consistent execution</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-secondary transition-colors shadow-lg"
        >
          + Create System
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <WidgetCard>
          <div className="p-4 text-center">
            <p className="text-3xl font-bold text-accent">{systems.filter(s => s.active).length}</p>
            <p className="text-sm text-text-secondary mt-1">Active Systems</p>
          </div>
        </WidgetCard>
        <WidgetCard>
          <div className="p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{systems.filter(s => s.streak > 0).length}</p>
            <p className="text-sm text-text-secondary mt-1">With Streaks</p>
          </div>
        </WidgetCard>
        <WidgetCard>
          <div className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">{Math.max(...systems.map(s => s.streak))}</p>
            <p className="text-sm text-text-secondary mt-1">Longest Streak</p>
          </div>
        </WidgetCard>
        <WidgetCard>
          <div className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-400">{systems.length}</p>
            <p className="text-sm text-text-secondary mt-1">Total Systems</p>
          </div>
        </WidgetCard>
      </div>

      {/* Filters */}
      <WidgetCard>
        <div className="p-6 space-y-4">
          {/* Type Filters */}
          <div>
            <p className="text-sm font-semibold text-text-secondary mb-2">Type</p>
            <div className="flex flex-wrap gap-2">
              {['all', 'habit', 'routine', 'workflow', 'process'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                    selectedType === type
                      ? 'bg-accent text-white'
                      : 'bg-black/5 dark:bg-white/5 text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <p className="text-sm font-semibold text-text-secondary mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              {['all', 'active', 'inactive'].map((status) => (
                <button
                  key={status}
                  onClick={() => setShowActive(status as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                    showActive === status
                      ? 'bg-accent text-white'
                      : 'bg-black/5 dark:bg-white/5 text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </WidgetCard>

      {/* Systems Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSystems.length > 0 ? (
          filteredSystems.map((system) => (
            <WidgetCard key={system.id}>
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{system.icon}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-text-primary">{system.name}</h3>
                        {system.streak > 0 && (
                          <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold">
                            🔥 {system.streak}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${typeColors[system.type]}`}>
                          {system.type}
                        </span>
                        <span className="text-xs text-text-secondary">{system.frequency}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSystemActive(system.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                      system.active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {system.active ? 'Active' : 'Inactive'}
                  </button>
                </div>

                {/* Description */}
                <p className="text-sm text-text-secondary">{system.description}</p>

                {/* Steps */}
                <div className="bg-black/5 dark:bg-white/5 rounded-lg p-4 space-y-2">
                  <p className="text-xs font-semibold text-text-secondary uppercase">Steps</p>
                  <ol className="space-y-1.5">
                    {system.steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-text-primary">
                        <span className="font-bold text-accent">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-secondary transition-colors text-sm">
                    Execute
                  </button>
                  <button className="px-4 py-2 bg-black/10 dark:bg-white/10 text-text-primary rounded-lg hover:bg-black/20 dark:hover:bg-white/20 transition-colors text-sm">
                    Edit
                  </button>
                  <button className="px-4 py-2 bg-black/10 dark:bg-white/10 text-text-primary rounded-lg hover:bg-black/20 dark:hover:bg-white/20 transition-colors text-sm">
                    ⋯
                  </button>
                </div>
              </div>
            </WidgetCard>
          ))
        ) : (
          <div className="col-span-full">
            <WidgetCard>
              <div className="p-10 text-center">
                <p className="text-text-secondary">No systems found matching your filters</p>
              </div>
            </WidgetCard>
          </div>
        )}
      </div>

      {/* Create System Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-card-bg backdrop-blur-xl rounded-2xl border border-card-border shadow-2xl w-full max-w-2xl p-6">
            <h3 className="text-2xl font-bold text-text-primary mb-4">Create New System</h3>
            <p className="text-text-secondary mb-6">Choose a type to get started</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { type: 'habit', desc: 'Recurring actions to build consistency' },
                { type: 'routine', desc: 'Structured sequences for daily life' },
                { type: 'workflow', desc: 'Step-by-step processes for work' },
                { type: 'process', desc: 'Standardized procedures for projects' }
              ].map(({ type, desc }) => (
                <button
                  key={type}
                  className={`p-6 rounded-xl border-2 ${typeColors[type as keyof typeof typeColors]} hover:scale-105 transition-all text-left`}
                >
                  <p className="text-lg font-bold capitalize">{type}</p>
                  <p className="text-xs mt-1 opacity-75">{desc}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-6 py-3 bg-black/10 dark:bg-white/10 text-text-primary rounded-xl font-semibold hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
