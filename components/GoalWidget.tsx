import React, { useState } from 'react';
import { WidgetCard } from './WidgetCard';
import type { Goal } from '../App';

interface GoalWidgetProps {
  goals: Goal[];
  onUpdateGoal?: (goal: Goal) => void;
  onAddGoal?: () => void;
}

export const GoalWidget: React.FC<GoalWidgetProps> = ({ goals, onUpdateGoal, onAddGoal }) => {
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 dark:text-green-300';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-400 dark:text-blue-300';
      case 'not-started':
        return 'bg-gray-500/20 text-gray-400 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'in-progress':
        return '⏳';
      case 'not-started':
        return '○';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const sortedGoals = [...goals].sort((a, b) => {
    // Sort by status (in-progress first, then not-started, then completed)
    const statusOrder = { 'in-progress': 0, 'not-started': 1, 'completed': 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const activeGoals = sortedGoals.filter(g => g.status !== 'completed');
  const displayGoals = activeGoals.slice(0, 3);

  return (
    <WidgetCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-text-primary">Personal Goals</h3>
        {onAddGoal && (
          <button
            onClick={onAddGoal}
            className="text-accent hover:text-accent-secondary transition-colors text-xl"
            title="Add new goal"
          >
            +
          </button>
        )}
      </div>

      {displayGoals.length > 0 ? (
        <div className="space-y-3">
          {displayGoals.map((goal) => (
            <div
              key={goal.id}
              className="rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
            >
              <button
                onClick={() => setExpandedGoalId(expandedGoalId === goal.id ? null : goal.id)}
                className="w-full text-left p-3"
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">
                    {getStatusIcon(goal.status)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-text-primary text-sm truncate">
                      {goal.title}
                    </h4>
                    {goal.targetDate && (
                      <p className="text-xs text-text-secondary mt-1">
                        Target: {formatDate(goal.targetDate)}
                      </p>
                    )}
                    <span
                      className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(goal.status)}`}
                    >
                      {goal.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                {expandedGoalId === goal.id && goal.description && (
                  <p className="text-xs text-text-secondary mt-3 pl-8">
                    {goal.description}
                  </p>
                )}
              </button>

              {expandedGoalId === goal.id && onUpdateGoal && (
                <div className="px-3 pb-3 pl-11 flex gap-2">
                  {goal.status !== 'in-progress' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateGoal({ ...goal, status: 'in-progress' });
                      }}
                      className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                    >
                      Start
                    </button>
                  )}
                  {goal.status !== 'completed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateGoal({ ...goal, status: 'completed' });
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
          <span className="text-4xl block mb-2">🎯</span>
          <p className="text-sm">No active goals yet</p>
          {onAddGoal && (
            <button
              onClick={onAddGoal}
              className="mt-3 text-xs text-accent hover:text-accent-secondary transition-colors"
            >
              Create your first goal
            </button>
          )}
        </div>
      )}

      {activeGoals.length > 3 && (
        <div className="mt-4 text-center">
          <button className="text-xs text-accent hover:text-accent-secondary transition-colors">
            View all {activeGoals.length} goals
          </button>
        </div>
      )}
    </WidgetCard>
  );
};
