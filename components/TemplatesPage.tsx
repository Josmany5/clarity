import React, { useState } from 'react';
import { WidgetCard } from './WidgetCard';
import { TemplatesIcon } from './Icons';

interface Template {
  id: string;
  name: string;
  type: 'task' | 'note' | 'project' | 'workspace';
  description: string;
  content: any;
  createdAt: string;
  icon: string;
}

export const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      name: 'Daily Standup Notes',
      type: 'note',
      description: 'Template for daily standup meetings with pre-filled sections',
      content: {
        title: 'Daily Standup - [Date]',
        sections: ['What I did yesterday', 'What I\'m doing today', 'Blockers']
      },
      createdAt: new Date().toISOString(),
      icon: '📝'
    },
    {
      id: '2',
      name: 'Sprint Planning',
      type: 'project',
      description: 'Template for organizing sprint planning sessions',
      content: {
        title: 'Sprint [Number] Planning',
        sections: ['Goals', 'User Stories', 'Tasks', 'Timeline']
      },
      createdAt: new Date().toISOString(),
      icon: '🎯'
    },
    {
      id: '3',
      name: 'Bug Report Task',
      type: 'task',
      description: 'Structured template for reporting bugs',
      content: {
        title: 'Bug: [Description]',
        fields: ['Steps to Reproduce', 'Expected Behavior', 'Actual Behavior', 'Environment']
      },
      createdAt: new Date().toISOString(),
      icon: '🐛'
    },
    {
      id: '4',
      name: 'Weekly Review',
      type: 'note',
      description: 'Template for weekly reflection and planning',
      content: {
        title: 'Weekly Review - Week [Number]',
        sections: ['Wins', 'Challenges', 'Learnings', 'Next Week Goals']
      },
      createdAt: new Date().toISOString(),
      icon: '📊'
    },
    {
      id: '5',
      name: 'Product Feature Workspace',
      type: 'workspace',
      description: 'Template workspace for developing new features',
      content: {
        name: '[Feature Name] Development',
        entities: ['Research', 'Design', 'Development', 'Testing', 'Launch']
      },
      createdAt: new Date().toISOString(),
      icon: '🚀'
    }
  ]);

  const [selectedType, setSelectedType] = useState<'all' | 'task' | 'note' | 'project' | 'workspace'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredTemplates = templates.filter(template => {
    const matchesType = selectedType === 'all' || template.type === selectedType;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const typeColors = {
    task: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    note: 'bg-green-500/20 text-green-400 border-green-500/40',
    project: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    workspace: 'bg-orange-500/20 text-orange-400 border-orange-500/40'
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <TemplatesIcon className="w-8 h-8 text-accent" />
            Templates
          </h1>
          <p className="text-text-secondary mt-1">Reusable templates for tasks, notes, projects, and workspaces</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-secondary transition-colors shadow-lg"
        >
          + Create Template
        </button>
      </div>

      {/* Search and Filters */}
      <WidgetCard>
        <div className="p-6 space-y-4">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/5 dark:bg-white/5 text-text-primary placeholder-text-secondary rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent"
          />

          {/* Type Filters */}
          <div className="flex flex-wrap gap-2">
            {['all', 'task', 'note', 'project', 'workspace'].map((type) => (
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
      </WidgetCard>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => (
            <WidgetCard key={template.id}>
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{template.icon}</div>
                    <div>
                      <h3 className="font-bold text-text-primary">{template.name}</h3>
                      <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold border ${typeColors[template.type]}`}>
                        {template.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-text-secondary">{template.description}</p>

                {/* Content Preview */}
                <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3 space-y-1">
                  <p className="text-xs font-semibold text-text-secondary uppercase">Preview</p>
                  {template.type === 'note' || template.type === 'project' ? (
                    <div className="text-sm text-text-primary">
                      <p className="font-medium">{template.content.title}</p>
                      <ul className="ml-4 mt-1 space-y-0.5">
                        {template.content.sections.slice(0, 3).map((section: string, idx: number) => (
                          <li key={idx} className="text-xs text-text-secondary">• {section}</li>
                        ))}
                      </ul>
                    </div>
                  ) : template.type === 'task' ? (
                    <div className="text-sm text-text-primary">
                      <p className="font-medium">{template.content.title}</p>
                      <p className="text-xs text-text-secondary mt-1">{template.content.fields.length} fields</p>
                    </div>
                  ) : (
                    <div className="text-sm text-text-primary">
                      <p className="font-medium">{template.content.name}</p>
                      <p className="text-xs text-text-secondary mt-1">{template.content.entities.length} entities</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-secondary transition-colors text-sm">
                    Use Template
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
                <p className="text-text-secondary">No templates found matching your criteria</p>
              </div>
            </WidgetCard>
          </div>
        )}
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-card-bg backdrop-blur-xl rounded-2xl border border-card-border shadow-2xl w-full max-w-2xl p-6">
            <h3 className="text-2xl font-bold text-text-primary mb-4">Create New Template</h3>
            <p className="text-text-secondary mb-6">Choose a type to get started with your custom template</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {['task', 'note', 'project', 'workspace'].map((type) => (
                <button
                  key={type}
                  className={`p-6 rounded-xl border-2 ${typeColors[type as keyof typeof typeColors]} hover:scale-105 transition-all`}
                >
                  <p className="text-lg font-bold capitalize">{type}</p>
                  <p className="text-xs mt-1 opacity-75">Create {type} template</p>
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
