import React, { useState } from 'react';
import type { Goal } from '../App';
import { parseLocalDate } from '../utils/dateUtils';

interface GoalsPageProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
}

export const GoalsPage: React.FC<GoalsPageProps> = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', targetDate: '' });
  const [filterStatus, setFilterStatus] = useState<'all' | 'not-started' | 'in-progress' | 'completed'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;

    if (editingGoal) {
      onUpdateGoal({
        ...editingGoal,
        title: newGoal.title,
        description: newGoal.description,
        targetDate: newGoal.targetDate || undefined,
      });
    } else {
      onAddGoal({
        title: newGoal.title,
        description: newGoal.description,
        targetDate: newGoal.targetDate || undefined,
        status: 'not-started',
      });
    }

    setNewGoal({ title: '', description: '', targetDate: '' });
    setShowAddModal(false);
    setEditingGoal(null);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setNewGoal({
      title: goal.title,
      description: goal.description,
      targetDate: goal.targetDate || '',
    });
    setShowAddModal(true);
  };

  const handleStatusChange = (goal: Goal, newStatus: Goal['status']) => {
    onUpdateGoal({ ...goal, status: newStatus });
  };

  const filteredGoals = goals.filter(goal => {
    if (filterStatus === 'all') return true;
    return goal.status === filterStatus;
  });

  const statusColors = {
    'not-started': 'bg-gray-500',
    'in-progress': 'bg-blue-500',
    'completed': 'bg-green-500',
  };

  const statusLabels = {
    'not-started': 'Not Started',
    'in-progress': 'In Progress',
    'completed': 'Completed',
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-6">
      {/* Header */}
      <div className="bg-card-bg backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-6 border border-card-border shadow-glass">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-text-primary">Goals</h2>
            <p className="text-text-secondary text-xs md:text-sm mt-1">Long-term objectives and milestones</p>
          </div>
          <button
            onClick={() => {
              setEditingGoal(null);
              setNewGoal({ title: '', description: '', targetDate: '' });
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent-secondary transition-colors"
          >
            + Add Goal
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {(['all', 'not-started', 'in-progress', 'completed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                filterStatus === status
                  ? 'bg-accent text-white'
                  : 'bg-black/5 dark:bg-white/5 text-text-secondary hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              {status === 'all' ? 'All' : statusLabels[status]}
              <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                {status === 'all' ? goals.length : goals.filter(g => g.status === status).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGoals.length > 0 ? (
          filteredGoals.map(goal => (
            <div
              key={goal.id}
              className="bg-card-bg backdrop-blur-xl rounded-xl p-4 border border-card-border shadow-glass hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-text-primary flex-1">{goal.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="p-1.5 text-text-secondary hover:text-blue-500 transition-colors"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="p-1.5 text-text-secondary hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {goal.description && (
                <p className="text-sm text-text-secondary mb-3">{goal.description}</p>
              )}

              {goal.targetDate && (
                <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
                  <span>🎯</span>
                  <span>Target: {parseLocalDate(goal.targetDate).toLocaleDateString()}</span>
                </div>
              )}

              {/* Status Selector */}
              <div className="flex gap-2">
                {(['not-started', 'in-progress', 'completed'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(goal, status)}
                    className={`flex-1 px-2 py-1.5 rounded text-xs font-semibold transition-all ${
                      goal.status === status
                        ? `${statusColors[status]} text-white`
                        : 'bg-black/5 dark:bg-white/5 text-text-secondary hover:bg-black/10 dark:hover:bg-white/10'
                    }`}
                    title={statusLabels[status]}
                  >
                    {status === 'not-started' && '⚪'}
                    {status === 'in-progress' && '🔵'}
                    {status === 'completed' && '✅'}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-text-secondary">
            <div className="text-4xl mb-2">🎯</div>
            <p>No goals yet. Create your first goal!</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card-bg border border-card-border rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-4 border-b border-card-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary">
                {editingGoal ? 'Edit Goal' : 'New Goal'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingGoal(null);
                  setNewGoal({ title: '', description: '', targetDate: '' });
                }}
                className="text-text-secondary hover:text-text-primary"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g., Launch my business"
                  className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 text-text-primary rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Description
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="What do you want to achieve?"
                  rows={3}
                  className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 text-text-primary rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Target Date
                </label>
                <input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  className="w-full px-3 py-2 bg-black/5 dark:bg-white/5 text-text-primary rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingGoal(null);
                    setNewGoal({ title: '', description: '', targetDate: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-black/10 dark:bg-white/10 text-text-primary rounded-lg font-semibold hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-secondary transition-colors"
                >
                  {editingGoal ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
