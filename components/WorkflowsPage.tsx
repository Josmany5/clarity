import React, { useState } from 'react';
import { WidgetCard } from './WidgetCard';
import { TemplatesIcon } from './Icons';

interface Workflow {
  id: string;
  name: string;
  type: 'task' | 'note' | 'project' | 'workspace';
  description: string;
  content: any;
  createdAt: string;
  icon: string;
  category: 'work' | 'personal' | 'creative' | 'academic' | 'health';
  popular?: boolean;
}

export const WorkflowsPage: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    // WORK & BUSINESS - Popular
    {
      id: '1',
      name: 'Daily Standup Notes',
      type: 'note',
      description: 'Workflow for daily standup meetings with pre-filled sections',
      content: { title: 'Daily Standup - [Date]', sections: ['What I did yesterday', 'What I\'m doing today', 'Blockers'] },
      createdAt: new Date().toISOString(),
      icon: '📝',
      category: 'work',
      popular: true
    },
    {
      id: '2',
      name: 'Sprint Planning',
      type: 'project',
      description: 'Workflow for organizing sprint planning sessions',
      content: { title: 'Sprint [Number] Planning', sections: ['Goals', 'User Stories', 'Tasks', 'Timeline'] },
      createdAt: new Date().toISOString(),
      icon: '🎯',
      category: 'work',
      popular: true
    },
    {
      id: '3',
      name: 'Bug Report Task',
      type: 'task',
      description: 'Structured workflow for reporting bugs',
      content: { title: 'Bug: [Description]', fields: ['Steps to Reproduce', 'Expected Behavior', 'Actual Behavior', 'Environment'] },
      createdAt: new Date().toISOString(),
      icon: '🐛',
      category: 'work',
      popular: true
    },
    // WORK & BUSINESS - Additional
    {
      id: '6',
      name: 'Client Meeting Notes',
      type: 'note',
      description: 'Professional workflow for client meetings and follow-ups',
      content: { title: 'Client Meeting - [Client Name]', sections: ['Attendees', 'Discussion Points', 'Decisions Made', 'Action Items', 'Next Steps'] },
      createdAt: new Date().toISOString(),
      icon: '👥',
      category: 'work',
      popular: false
    },
    {
      id: '7',
      name: 'Project Kickoff Workspace',
      type: 'workspace',
      description: 'Comprehensive workspace for starting new projects',
      content: { name: '[Project Name] Kickoff', entities: ['Stakeholders', 'Requirements', 'Timeline', 'Resources', 'Risks'] },
      createdAt: new Date().toISOString(),
      icon: '🚀',
      category: 'work',
      popular: false
    },
    {
      id: '8',
      name: 'Sales Pipeline',
      type: 'project',
      description: 'Track leads and opportunities through your sales process',
      content: { title: 'Sales Pipeline - [Quarter]', sections: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won'] },
      createdAt: new Date().toISOString(),
      icon: '💰',
      category: 'work',
      popular: false
    },
    {
      id: '9',
      name: 'Marketing Campaign',
      type: 'project',
      description: 'Plan and execute marketing campaigns',
      content: { title: '[Campaign Name]', sections: ['Goals', 'Target Audience', 'Channels', 'Content Calendar', 'Metrics'] },
      createdAt: new Date().toISOString(),
      icon: '📢',
      category: 'work',
      popular: false
    },
    {
      id: '10',
      name: 'OKR Planning',
      type: 'note',
      description: 'Set objectives and key results for quarterly planning',
      content: { title: 'Q[X] OKRs', sections: ['Objective 1', 'Key Results', 'Objective 2', 'Key Results', 'Objective 3', 'Key Results'] },
      createdAt: new Date().toISOString(),
      icon: '🎯',
      category: 'work',
      popular: false
    },

    // PERSONAL & LIFE - Popular
    {
      id: '4',
      name: 'Weekly Review',
      type: 'note',
      description: 'Workflow for weekly reflection and planning',
      content: { title: 'Weekly Review - Week [Number]', sections: ['Wins', 'Challenges', 'Learnings', 'Next Week Goals'] },
      createdAt: new Date().toISOString(),
      icon: '📊',
      category: 'personal',
      popular: true
    },
    {
      id: '11',
      name: 'Daily Journal',
      type: 'note',
      description: 'Structured daily journaling for reflection and gratitude',
      content: { title: 'Journal - [Date]', sections: ['Morning Intentions', 'Gratitude', 'Today\'s Highlights', 'Evening Reflection'] },
      createdAt: new Date().toISOString(),
      icon: '📔',
      category: 'personal',
      popular: true
    },
    // PERSONAL & LIFE - Additional
    {
      id: '12',
      name: 'Personal Budget',
      type: 'project',
      description: 'Track income, expenses, and savings goals',
      content: { title: 'Monthly Budget - [Month]', sections: ['Income', 'Fixed Expenses', 'Variable Expenses', 'Savings', 'Debt Payments'] },
      createdAt: new Date().toISOString(),
      icon: '💵',
      category: 'personal',
      popular: false
    },
    {
      id: '13',
      name: 'Habit Tracker',
      type: 'task',
      description: 'Track daily habits and build consistency',
      content: { title: 'Habit: [Name]', fields: ['Frequency', 'Time of Day', 'Current Streak', 'Notes'] },
      createdAt: new Date().toISOString(),
      icon: '✅',
      category: 'personal',
      popular: false
    },
    {
      id: '14',
      name: 'Life Areas Review',
      type: 'note',
      description: 'Quarterly review of major life areas',
      content: { title: 'Life Review - [Quarter]', sections: ['Health', 'Career', 'Relationships', 'Personal Growth', 'Finance', 'Fun & Recreation'] },
      createdAt: new Date().toISOString(),
      icon: '🌟',
      category: 'personal',
      popular: false
    },
    {
      id: '15',
      name: 'Event Planning',
      type: 'project',
      description: 'Plan personal events, parties, or celebrations',
      content: { title: '[Event Name] Planning', sections: ['Date & Venue', 'Guest List', 'Budget', 'To-Do List', 'Timeline'] },
      createdAt: new Date().toISOString(),
      icon: '🎉',
      category: 'personal',
      popular: false
    },

    // CREATIVE & LEARNING
    {
      id: '16',
      name: 'Creative Project',
      type: 'workspace',
      description: 'Workspace for any creative endeavor',
      content: { name: '[Project Name]', entities: ['Inspiration', 'Brainstorming', 'Sketches/Drafts', 'Revisions', 'Final'] },
      createdAt: new Date().toISOString(),
      icon: '🎨',
      category: 'creative',
      popular: true
    },
    {
      id: '17',
      name: 'Content Creation',
      type: 'note',
      description: 'Plan blog posts, videos, or social media content',
      content: { title: '[Content Title]', sections: ['Topic', 'Key Points', 'Outline', 'SEO Keywords', 'Call to Action'] },
      createdAt: new Date().toISOString(),
      icon: '✍️',
      category: 'creative',
      popular: false
    },
    {
      id: '18',
      name: 'Book Notes',
      type: 'note',
      description: 'Capture insights and quotes from books',
      content: { title: '[Book Title] - Notes', sections: ['Author', 'Key Takeaways', 'Favorite Quotes', 'Action Items', 'Rating'] },
      createdAt: new Date().toISOString(),
      icon: '📚',
      category: 'creative',
      popular: false
    },
    {
      id: '19',
      name: 'Music Practice',
      type: 'task',
      description: 'Structure your music practice sessions',
      content: { title: 'Practice: [Instrument/Song]', fields: ['Warm-up', 'Technique', 'New Material', 'Review', 'Cool-down'] },
      createdAt: new Date().toISOString(),
      icon: '🎵',
      category: 'creative',
      popular: false
    },
    {
      id: '20',
      name: 'Photography Project',
      type: 'project',
      description: 'Plan photo shoots and manage editing workflow',
      content: { title: '[Shoot Name]', sections: ['Concept', 'Location', 'Equipment', 'Shot List', 'Editing'] },
      createdAt: new Date().toISOString(),
      icon: '📸',
      category: 'creative',
      popular: false
    },

    // ACADEMIC & EDUCATION
    {
      id: '21',
      name: 'Study Plan',
      type: 'project',
      description: 'Organize study schedule and track progress',
      content: { title: '[Course/Subject] Study Plan', sections: ['Topics to Cover', 'Study Schedule', 'Resources', 'Practice Problems', 'Exam Prep'] },
      createdAt: new Date().toISOString(),
      icon: '📖',
      category: 'academic',
      popular: true
    },
    {
      id: '22',
      name: 'Lecture Notes',
      type: 'note',
      description: 'Structured workflow for class notes',
      content: { title: '[Course] - Lecture [Number]', sections: ['Date', 'Key Concepts', 'Important Formulas', 'Questions', 'To Review'] },
      createdAt: new Date().toISOString(),
      icon: '📝',
      category: 'academic',
      popular: false
    },
    {
      id: '23',
      name: 'Research Paper',
      type: 'workspace',
      description: 'Organize research, outline, and drafts',
      content: { name: '[Paper Title]', entities: ['Research Questions', 'Literature Review', 'Methodology', 'Findings', 'Conclusion'] },
      createdAt: new Date().toISOString(),
      icon: '🔬',
      category: 'academic',
      popular: false
    },
    {
      id: '24',
      name: 'Assignment Tracker',
      type: 'task',
      description: 'Track homework and project deadlines',
      content: { title: '[Course] - [Assignment]', fields: ['Due Date', 'Requirements', 'Progress', 'Grade Goal'] },
      createdAt: new Date().toISOString(),
      icon: '📋',
      category: 'academic',
      popular: false
    },
    {
      id: '25',
      name: 'Language Learning',
      type: 'note',
      description: 'Track vocabulary and grammar lessons',
      content: { title: '[Language] - Lesson [Number]', sections: ['New Vocabulary', 'Grammar Rules', 'Practice Sentences', 'Cultural Notes'] },
      createdAt: new Date().toISOString(),
      icon: '🌍',
      category: 'academic',
      popular: false
    },

    // HEALTH & WELLNESS
    {
      id: '26',
      name: 'Workout Plan',
      type: 'project',
      description: 'Design and track your fitness routine',
      content: { title: '[Program Name]', sections: ['Goals', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
      createdAt: new Date().toISOString(),
      icon: '💪',
      category: 'health',
      popular: true
    },
    {
      id: '27',
      name: 'Meal Planning',
      type: 'note',
      description: 'Plan weekly meals and shopping list',
      content: { title: 'Meal Plan - Week of [Date]', sections: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Shopping List'] },
      createdAt: new Date().toISOString(),
      icon: '🥗',
      category: 'health',
      popular: true
    },
    {
      id: '28',
      name: 'Health Tracker',
      type: 'note',
      description: 'Monitor physical and mental health metrics',
      content: { title: 'Health Log - [Date]', sections: ['Sleep', 'Exercise', 'Nutrition', 'Water Intake', 'Mood', 'Energy Level'] },
      createdAt: new Date().toISOString(),
      icon: '❤️',
      category: 'health',
      popular: false
    },
    {
      id: '29',
      name: 'Meditation Practice',
      type: 'task',
      description: 'Track meditation sessions and mindfulness',
      content: { title: 'Meditation - [Date]', fields: ['Duration', 'Type', 'Focus', 'Insights'] },
      createdAt: new Date().toISOString(),
      icon: '🧘',
      category: 'health',
      popular: false
    },
    {
      id: '30',
      name: 'Medical Records',
      type: 'note',
      description: 'Track appointments, medications, and health history',
      content: { title: 'Medical Record', sections: ['Doctor Visits', 'Medications', 'Allergies', 'Immunizations', 'Test Results'] },
      createdAt: new Date().toISOString(),
      icon: '🏥',
      category: 'health',
      popular: false
    }
  ]);

  const [selectedType, setSelectedType] = useState<'all' | 'task' | 'note' | 'project' | 'workspace'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (category: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesType = selectedType === 'all' || workflow.type === selectedType;
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const popularWorkflows = filteredWorkflows.filter(t => t.popular);

  const categories = [
    { id: 'work', name: 'Work & Business', icon: '💼', workflows: filteredWorkflows.filter(t => t.category === 'work') },
    { id: 'personal', name: 'Personal & Life', icon: '🌟', workflows: filteredWorkflows.filter(t => t.category === 'personal') },
    { id: 'creative', name: 'Creative & Learning', icon: '🎨', workflows: filteredWorkflows.filter(t => t.category === 'creative') },
    { id: 'academic', name: 'Academic & Education', icon: '📚', workflows: filteredWorkflows.filter(t => t.category === 'academic') },
    { id: 'health', name: 'Health & Wellness', icon: '💪', workflows: filteredWorkflows.filter(t => t.category === 'health') }
  ].filter(cat => cat.workflows.length > 0);

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
            Workflows
          </h1>
          <p className="text-text-secondary mt-1">Reusable workflows for tasks, notes, projects, and workspaces</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-secondary transition-colors shadow-lg"
        >
          + Create Workflow
        </button>
      </div>

      {/* Search and Filters */}
      <WidgetCard>
        <div className="p-6 space-y-4">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search workflows..."
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

      {/* Popular Workflows */}
      {popularWorkflows.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <span>🔥</span> Popular Workflows
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularWorkflows.map((workflow) => (
              <WidgetCard key={workflow.id}>
                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{workflow.icon}</div>
                      <div>
                        <h3 className="font-bold text-text-primary">{workflow.name}</h3>
                        <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold border ${typeColors[workflow.type]}`}>
                          {workflow.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-text-secondary">{workflow.description}</p>

                  {/* Content Preview */}
                  <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3 space-y-1">
                    <p className="text-xs font-semibold text-text-secondary uppercase">Preview</p>
                    {workflow.type === 'note' || workflow.type === 'project' ? (
                      <div className="text-sm text-text-primary">
                        <p className="font-medium">{workflow.content.title}</p>
                        <ul className="ml-4 mt-1 space-y-0.5">
                          {workflow.content.sections.slice(0, 3).map((section: string, idx: number) => (
                            <li key={idx} className="text-xs text-text-secondary">• {section}</li>
                          ))}
                        </ul>
                      </div>
                    ) : workflow.type === 'task' ? (
                      <div className="text-sm text-text-primary">
                        <p className="font-medium">{workflow.content.title}</p>
                        <p className="text-xs text-text-secondary mt-1">{workflow.content.fields.length} fields</p>
                      </div>
                    ) : (
                      <div className="text-sm text-text-primary">
                        <p className="font-medium">{workflow.content.name}</p>
                        <p className="text-xs text-text-secondary mt-1">{workflow.content.entities.length} entities</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-secondary transition-colors text-sm">
                      Use Workflow
                    </button>
                    <button className="px-4 py-2 bg-black/10 dark:bg-white/10 text-text-primary rounded-lg hover:bg-black/20 dark:hover:bg-white/20 transition-colors text-sm">
                      ⋯
                    </button>
                  </div>
                </div>
              </WidgetCard>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {categories.length > 0 ? (
        categories.map(category => (
          <div key={category.id} className="space-y-4">
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <span>{category.icon}</span>
                {category.name}
                <span className="text-sm font-normal text-text-secondary">({category.workflows.length})</span>
              </h2>
              <span className="text-text-secondary transition-transform" style={{ transform: collapsedCategories.has(category.id) ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                ▼
              </span>
            </button>

            {!collapsedCategories.has(category.id) && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.workflows.map((workflow) => (
                  <WidgetCard key={workflow.id}>
                    <div className="p-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{workflow.icon}</div>
                          <div>
                            <h3 className="font-bold text-text-primary">{workflow.name}</h3>
                            <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold border ${typeColors[workflow.type]}`}>
                              {workflow.type}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-text-secondary">{workflow.description}</p>

                      {/* Content Preview */}
                      <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3 space-y-1">
                        <p className="text-xs font-semibold text-text-secondary uppercase">Preview</p>
                        {workflow.type === 'note' || workflow.type === 'project' ? (
                          <div className="text-sm text-text-primary">
                            <p className="font-medium">{workflow.content.title}</p>
                            <ul className="ml-4 mt-1 space-y-0.5">
                              {workflow.content.sections.slice(0, 3).map((section: string, idx: number) => (
                                <li key={idx} className="text-xs text-text-secondary">• {section}</li>
                              ))}
                            </ul>
                          </div>
                        ) : workflow.type === 'task' ? (
                          <div className="text-sm text-text-primary">
                            <p className="font-medium">{workflow.content.title}</p>
                            <p className="text-xs text-text-secondary mt-1">{workflow.content.fields.length} fields</p>
                          </div>
                        ) : (
                          <div className="text-sm text-text-primary">
                            <p className="font-medium">{workflow.content.name}</p>
                            <p className="text-xs text-text-secondary mt-1">{workflow.content.entities.length} entities</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <button className="flex-1 px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-secondary transition-colors text-sm">
                          Use Workflow
                        </button>
                        <button className="px-4 py-2 bg-black/10 dark:bg-white/10 text-text-primary rounded-lg hover:bg-black/20 dark:hover:bg-white/20 transition-colors text-sm">
                          ⋯
                        </button>
                      </div>
                    </div>
                  </WidgetCard>
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        <WidgetCard>
          <div className="p-10 text-center">
            <p className="text-text-secondary">No workflows found matching your criteria</p>
          </div>
        </WidgetCard>
      )}

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-card-bg backdrop-blur-xl rounded-2xl border border-card-border shadow-2xl w-full max-w-2xl p-6">
            <h3 className="text-2xl font-bold text-text-primary mb-4">Create New Workflow</h3>
            <p className="text-text-secondary mb-6">Choose a type to get started with your custom workflow</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {['task', 'note', 'project', 'workspace'].map((type) => (
                <button
                  key={type}
                  className={`p-6 rounded-xl border-2 ${typeColors[type as keyof typeof typeColors]} hover:scale-105 transition-all`}
                >
                  <p className="text-lg font-bold capitalize">{type}</p>
                  <p className="text-xs mt-1 opacity-75">Create {type} workflow</p>
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
