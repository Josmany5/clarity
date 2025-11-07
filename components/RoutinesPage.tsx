import React, { useState } from 'react';
import { WidgetCard } from './WidgetCard';
import { SystemsIcon } from './Icons';

interface Routine {
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
  category: 'work' | 'personal' | 'creative' | 'academic' | 'health';
  popular?: boolean;
}

export const RoutinesPage: React.FC = () => {
  const [routines, setRoutines] = useState<Routine[]>([
    // WORK & BUSINESS - Popular
    {
      id: '1',
      name: 'Morning Routine',
      type: 'routine',
      description: 'Start your day with intention and energy',
      frequency: 'Daily',
      steps: ['Wake up at 6am', 'Drink water', '10 min meditation', 'Exercise 30 min', 'Healthy breakfast', 'Review daily goals'],
      active: true,
      createdAt: new Date().toISOString(),
      icon: '🌅',
      streak: 89,
      category: 'personal',
      popular: true
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
      streak: 45,
      category: 'work',
      popular: true
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
      streak: 0,
      category: 'work',
      popular: true
    },
    // WORK & BUSINESS - Additional
    {
      id: '7',
      name: 'Email Inbox Zero',
      type: 'workflow',
      description: 'Process emails efficiently and maintain inbox zero',
      frequency: '2x daily',
      steps: ['Delete spam', 'Archive FYIs', 'Delegate when possible', 'Schedule replies', 'File important emails'],
      active: true,
      createdAt: new Date().toISOString(),
      icon: '📧',
      streak: 15,
      category: 'work',
      popular: false
    },
    {
      id: '8',
      name: 'Client Onboarding',
      type: 'process',
      description: 'Standardized process for onboarding new clients',
      frequency: 'As needed',
      steps: ['Send welcome packet', 'Schedule kickoff call', 'Set up project tools', 'Establish communication protocols', 'Define success metrics'],
      active: true,
      createdAt: new Date().toISOString(),
      icon: '🤝',
      streak: 0,
      category: 'work',
      popular: false
    },
    {
      id: '9',
      name: 'Sales Follow-up',
      type: 'workflow',
      description: 'Systematic follow-up process for leads',
      frequency: 'Weekly',
      steps: ['Review CRM', 'Send follow-up emails', 'Make check-in calls', 'Schedule demos', 'Update pipeline'],
      active: false,
      createdAt: new Date().toISOString(),
      icon: '📞',
      streak: 0,
      category: 'work',
      popular: false
    },
    {
      id: '10',
      name: 'Monthly Reporting',
      type: 'routine',
      description: 'Monthly business metrics review and reporting',
      frequency: 'Monthly',
      steps: ['Gather metrics', 'Analyze trends', 'Create visualizations', 'Write summary', 'Present to stakeholders'],
      active: true,
      createdAt: new Date().toISOString(),
      icon: '📊',
      streak: 3,
      category: 'work',
      popular: false
    },

    // PERSONAL & LIFE - Popular
    {
      id: '2',
      name: 'Morning Routine',
      type: 'routine',
      description: 'Daily morning routine for optimal productivity',
      frequency: 'Daily',
      steps: ['Wake up at 6am', 'Exercise for 30 min', 'Meditation', 'Healthy breakfast', 'Review daily goals'],
      active: true,
      createdAt: new Date().toISOString(),
      icon: '🌅',
      streak: 12,
      category: 'personal',
      popular: true
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
      streak: 8,
      category: 'personal',
      popular: true
    },
    {
      id: '11',
      name: 'Evening Wind-Down',
      type: 'routine',
      description: 'Relaxing evening routine for better sleep',
      frequency: 'Daily',
      steps: ['Finish work by 6pm', 'Prepare tomorrow\'s clothes', 'Light dinner', 'No screens after 9pm', 'Read before bed'],
      active: true,
      createdAt: new Date().toISOString(),
      icon: '🌙',
      streak: 7,
      category: 'personal',
      popular: true
    },
    // PERSONAL & LIFE - Additional
    {
      id: '12',
      name: 'Monthly Budget Review',
      type: 'routine',
      description: 'Review finances and adjust budget',
      frequency: 'Monthly',
      steps: ['Reconcile accounts', 'Review spending', 'Update budget categories', 'Check savings goals', 'Plan next month'],
      active: true,
      createdAt: new Date().toISOString(),
      icon: '💰',
      streak: 5,
      category: 'personal',
      popular: false
    },
    {
      id: '13',
      name: 'Gratitude Practice',
      type: 'habit',
      description: 'Daily gratitude journaling',
      frequency: 'Daily',
      steps: ['Find quiet space', 'List 3 things you\'re grateful for', 'Reflect on why', 'Write in journal'],
      active: true,
      createdAt: new Date().toISOString(),
      icon: '🙏',
      streak: 22,
      category: 'personal',
      popular: false
    },
    {
      id: '14',
      name: 'Home Cleaning',
      type: 'routine',
      description: 'Weekly home maintenance routine',
      frequency: 'Weekly',
      steps: ['Vacuum all rooms', 'Clean bathrooms', 'Do laundry', 'Clean kitchen', 'Tidy living areas'],
      active: false,
      createdAt: new Date().toISOString(),
      icon: '🧹',
      streak: 0,
      category: 'personal',
      popular: false
    },

    // CREATIVE & LEARNING
    {
      id: '15',
      name: 'Creative Morning Pages',
      type: 'habit',
      description: 'Stream-of-consciousness writing practice',
      frequency: 'Daily',
      steps: ['Set timer for 20 min', 'Write 3 pages without stopping', 'No editing', 'Let thoughts flow'],
      active: true,
      createdAt: new Date().toISOString(),
      icon: '✍️',
      streak: 18,
      category: 'creative',
      popular: true
    },
    {
      id: '16',
      name: 'Skill Practice',
      type: 'habit',
      description: 'Deliberate practice for skill development',
      frequency: 'Daily',
      steps: ['Warm-up exercises', 'Focus on weak areas', 'Track progress', 'Cool down', 'Reflect on session'],
      active: true,
      createdAt: new Date().toISOString(),
      icon: '🎯',
      streak: 30,
      category: 'creative',
      popular: false
    },
    {
      id: '17',
      name: 'Content Publishing',
      type: 'workflow',
      description: 'Process for creating and publishing content',
      frequency: 'Weekly',
      steps: ['Brainstorm topics', 'Research', 'Create outline', 'Write draft', 'Edit', 'Publish', 'Promote'],
      active: true,
      createdAt: new Date().toISOString(),
      icon: '📝',
      streak: 12,
      category: 'creative',
      popular: false
    },
    {
      id: '18',
      name: 'Photography Workflow',
      type: 'workflow',
      description: 'End-to-end photo processing workflow',
      frequency: 'As needed',
      steps: ['Import photos', 'Cull bad shots', 'Rate favorites', 'Edit in Lightroom', 'Export', 'Backup'],
      active: false,
      createdAt: new Date().toISOString(),
      icon: '📸',
      streak: 0,
      category: 'creative',
      popular: false
    },

    // ACADEMIC & EDUCATION
    {
      id: '6',
      name: 'Reading Habit',
      type: 'habit',
      description: 'Daily reading for continuous learning',
      frequency: 'Daily',
      steps: ['Read for 30 minutes', 'Take notes', 'Reflect on learnings'],
      active: true,
      createdAt: new Date().toISOString(),
      icon: '📚',
      streak: 25,
      category: 'academic',
      popular: true
    },
    {
      id: '19',
      name: 'Study Routine',
      type: 'routine',
      description: 'Structured study sessions using Pomodoro',
      frequency: 'Daily',
      steps: ['Review goals', '25 min focused study', '5 min break', 'Repeat 4x', 'Longer break', 'Review notes'],
      active: true,
      createdAt: new Date().toISOString(),
      icon: '📖',
      streak: 15,
      category: 'academic',
      popular: false
    },
    {
      id: '20',
      name: 'Language Practice',
      type: 'habit',
      description: 'Daily language learning practice',
      frequency: 'Daily',
      steps: ['Review flashcards', 'Complete lesson', 'Practice speaking', 'Watch content in target language'],
      active: true,
      createdAt: new Date().toISOString(),
      icon: '🌍',
      streak: 40,
      category: 'academic',
      popular: false
    },
    {
      id: '21',
      name: 'Course Completion',
      type: 'process',
      description: 'Process for completing online courses',
      frequency: 'As needed',
      steps: ['Set completion date', 'Schedule study blocks', 'Take notes', 'Complete exercises', 'Build project', 'Get certificate'],
      active: false,
      createdAt: new Date().toISOString(),
      icon: '🎓',
      streak: 0,
      category: 'academic',
      popular: false
    },

    // HEALTH & WELLNESS
    {
      id: '22',
      name: 'Workout Routine',
      type: 'routine',
      description: 'Structured exercise routine',
      frequency: '5x weekly',
      steps: ['Warm-up 5 min', 'Strength training', 'Cardio', 'Cool down', 'Stretch'],
      active: true,
      createdAt: new Date().toISOString(),
      icon: '💪',
      streak: 20,
      category: 'health',
      popular: true
    },
    {
      id: '23',
      name: 'Meal Prep Sunday',
      type: 'routine',
      description: 'Weekly meal preparation routine',
      frequency: 'Weekly',
      steps: ['Plan meals', 'Create shopping list', 'Shop', 'Prep ingredients', 'Cook in batches', 'Store in containers'],
      active: true,
      createdAt: new Date().toISOString(),
      icon: '🍱',
      streak: 10,
      category: 'health',
      popular: true
    },
    {
      id: '24',
      name: 'Hydration Habit',
      type: 'habit',
      description: 'Stay hydrated throughout the day',
      frequency: 'Daily',
      steps: ['Drink water upon waking', 'Water before meals', 'Track 8 glasses', 'Herbal tea in evening'],
      active: true,
      createdAt: new Date().toISOString(),
      icon: '💧',
      streak: 35,
      category: 'health',
      popular: false
    },
    {
      id: '25',
      name: 'Sleep Hygiene',
      type: 'routine',
      description: 'Optimize sleep quality',
      frequency: 'Daily',
      steps: ['Same bedtime', 'Cool dark room', 'No caffeine after 2pm', 'No screens 1hr before bed', 'Reading or meditation'],
      active: true,
      createdAt: new Date().toISOString(),
      icon: '😴',
      streak: 14,
      category: 'health',
      popular: false
    },
    {
      id: '26',
      name: 'Mental Health Check',
      type: 'routine',
      description: 'Regular mental health self-assessment',
      frequency: 'Weekly',
      steps: ['Rate mood 1-10', 'Identify stressors', 'Practice self-compassion', 'Plan self-care', 'Reach out if needed'],
      active: false,
      createdAt: new Date().toISOString(),
      icon: '🧠',
      streak: 0,
      category: 'health',
      popular: false
    }
  ]);

  const [selectedType, setSelectedType] = useState<'all' | 'habit' | 'routine' | 'workflow' | 'process'>('all');
  const [showActive, setShowActive] = useState<'all' | 'active' | 'inactive'>('all');
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

  const filteredRoutines = routines.filter(routine => {
    const matchesType = selectedType === 'all' || routine.type === selectedType;
    const matchesActive = showActive === 'all' ||
                         (showActive === 'active' && routine.active) ||
                         (showActive === 'inactive' && !routine.active);
    return matchesType && matchesActive;
  });

  const popularRoutines = filteredRoutines.filter(s => s.popular);

  const categories = [
    { id: 'work', name: 'Work & Business', icon: '💼', routines: filteredRoutines.filter(s => s.category === 'work') },
    { id: 'personal', name: 'Personal & Life', icon: '🌟', routines: filteredRoutines.filter(s => s.category === 'personal') },
    { id: 'creative', name: 'Creative & Learning', icon: '🎨', routines: filteredRoutines.filter(s => s.category === 'creative') },
    { id: 'academic', name: 'Academic & Education', icon: '📚', routines: filteredRoutines.filter(s => s.category === 'academic') },
    { id: 'health', name: 'Health & Wellness', icon: '💪', routines: filteredRoutines.filter(s => s.category === 'health') }
  ].filter(cat => cat.routines.length > 0);

  const typeColors = {
    habit: 'bg-green-500/20 text-green-400 border-green-500/40',
    routine: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    workflow: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    process: 'bg-orange-500/20 text-orange-400 border-orange-500/40'
  };

  const toggleRoutineActive = (id: string) => {
    setRoutines(routines.map(routine =>
      routine.id === id ? { ...routine, active: !routine.active } : routine
    ));
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <SystemsIcon className="w-8 h-8 text-accent" />
            Routines
          </h1>
          <p className="text-text-secondary mt-1">Habits, routines, workflows, and processes for consistent execution</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-secondary transition-colors shadow-lg"
        >
          + Create Routine
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <WidgetCard>
          <div className="p-4 text-center">
            <p className="text-3xl font-bold text-accent">{routines.filter(s => s.active).length}</p>
            <p className="text-sm text-text-secondary mt-1">Active Routines</p>
          </div>
        </WidgetCard>
        <WidgetCard>
          <div className="p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{routines.filter(s => s.streak > 0).length}</p>
            <p className="text-sm text-text-secondary mt-1">With Streaks</p>
          </div>
        </WidgetCard>
        <WidgetCard>
          <div className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">{Math.max(...routines.map(s => s.streak))}</p>
            <p className="text-sm text-text-secondary mt-1">Longest Streak</p>
          </div>
        </WidgetCard>
        <WidgetCard>
          <div className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-400">{routines.length}</p>
            <p className="text-sm text-text-secondary mt-1">Total Routines</p>
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

      {/* Popular Routines */}
      {popularRoutines.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <span>🔥</span> Popular Routines
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {popularRoutines.map((routine) => (
              <WidgetCard key={routine.id}>
                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{routine.icon}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-text-primary">{routine.name}</h3>
                          {routine.streak > 0 && (
                            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold">
                              🔥 {routine.streak}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${typeColors[routine.type]}`}>
                            {routine.type}
                          </span>
                          <span className="text-xs text-text-secondary">{routine.frequency}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleRoutineActive(routine.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        routine.active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {routine.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-text-secondary">{routine.description}</p>

                  {/* Steps */}
                  <div className="bg-black/5 dark:bg-white/5 rounded-lg p-4 space-y-2">
                    <p className="text-xs font-semibold text-text-secondary uppercase">Steps</p>
                    <ol className="space-y-1.5">
                      {routine.steps.map((step, idx) => (
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
                <span className="text-sm font-normal text-text-secondary">({category.routines.length})</span>
              </h2>
              <span className="text-text-secondary transition-transform" style={{ transform: collapsedCategories.has(category.id) ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                ▼
              </span>
            </button>

            {!collapsedCategories.has(category.id) && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.routines.map((routine) => (
                  <WidgetCard key={routine.id}>
                    <div className="p-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl">{routine.icon}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-text-primary">{routine.name}</h3>
                              {routine.streak > 0 && (
                                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold">
                                  🔥 {routine.streak}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${typeColors[routine.type]}`}>
                                {routine.type}
                              </span>
                              <span className="text-xs text-text-secondary">{routine.frequency}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleRoutineActive(routine.id)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                            routine.active
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {routine.active ? 'Active' : 'Inactive'}
                        </button>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-text-secondary">{routine.description}</p>

                      {/* Steps */}
                      <div className="bg-black/5 dark:bg-white/5 rounded-lg p-4 space-y-2">
                        <p className="text-xs font-semibold text-text-secondary uppercase">Steps</p>
                        <ol className="space-y-1.5">
                          {routine.steps.map((step, idx) => (
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
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        <WidgetCard>
          <div className="p-10 text-center">
            <p className="text-text-secondary">No routines found matching your filters</p>
          </div>
        </WidgetCard>
      )}

      {/* Create Routine Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-card-bg backdrop-blur-xl rounded-2xl border border-card-border shadow-2xl w-full max-w-2xl p-6">
            <h3 className="text-2xl font-bold text-text-primary mb-4">Create New Routine</h3>
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
