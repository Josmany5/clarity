import React, { useState } from 'react';
import { WidgetCard } from './WidgetCard';
import { SystemsIcon } from './Icons';

interface ProductivitySystem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  howItWorks: string;
  keyPrinciples: string[];
  benefits: string[];
  popular?: boolean;
}

export const SystemsPage: React.FC = () => {
  const [systems, setSystems] = useState<ProductivitySystem[]>([
    // PRODUCTIVITY SYSTEMS - Popular
    {
      id: '1',
      name: 'Getting Things Done (GTD)',
      description: 'David Allen\'s comprehensive productivity methodology',
      icon: '✅',
      category: 'Task Management',
      howItWorks: 'Capture everything in an external system, clarify what it means, organize by category, reflect regularly, and engage with your tasks with confidence',
      keyPrinciples: ['Capture', 'Clarify', 'Organize', 'Reflect', 'Engage'],
      benefits: ['Clear mind', 'Stress-free productivity', 'Better focus', 'Nothing falls through cracks'],
      popular: true
    },
    {
      id: '2',
      name: 'PARA Method',
      description: 'Organize digital information into 4 categories',
      icon: '📁',
      category: 'Organization',
      howItWorks: 'Organize all information into Projects (active work), Areas (responsibilities), Resources (topics of interest), and Archives (inactive items)',
      keyPrinciples: ['Projects', 'Areas', 'Resources', 'Archives'],
      benefits: ['Simple structure', 'Easy to maintain', 'Works everywhere', 'Scales well'],
      popular: true
    },
    {
      id: '3',
      name: 'Pomodoro Technique',
      description: 'Time management method using focused 25-minute intervals',
      icon: '🍅',
      category: 'Time Management',
      howItWorks: 'Work in focused 25-minute blocks called "pomodoros", take 5-minute breaks between them, and a longer 15-30 minute break after 4 pomodoros',
      keyPrinciples: ['25-minute focus blocks', '5-minute breaks', 'Longer breaks after 4 cycles', 'Track completed pomodoros'],
      benefits: ['Improved focus', 'Reduced burnout', 'Better time awareness', 'Manageable work chunks'],
      popular: true
    },
    {
      id: '4',
      name: 'Time Blocking',
      description: 'Schedule your day in dedicated time blocks',
      icon: '📅',
      category: 'Time Management',
      howItWorks: 'Plan your day by assigning specific tasks to specific time blocks in your calendar, treating them as non-negotiable appointments',
      keyPrinciples: ['Schedule everything', 'Batch similar tasks', 'Include buffer time', 'Protect deep work blocks'],
      benefits: ['Intentional use of time', 'Reduced decision fatigue', 'Better work-life balance', 'Prevents overcommitment'],
      popular: true
    },
    {
      id: '5',
      name: 'Eisenhower Matrix',
      description: 'Prioritize tasks by urgency and importance',
      icon: '⬛',
      category: 'Prioritization',
      howItWorks: 'Categorize tasks into 4 quadrants: Do (urgent & important), Schedule (important, not urgent), Delegate (urgent, not important), Eliminate (neither)',
      keyPrinciples: ['Urgent vs Important', 'Do first', 'Schedule', 'Delegate', 'Eliminate'],
      benefits: ['Clear priorities', 'Focus on what matters', 'Reduce time wasters', 'Better delegation'],
      popular: true
    },

    // ADDITIONAL PRODUCTIVITY SYSTEMS
    {
      id: '6',
      name: 'Zettelkasten',
      description: 'Note-taking and knowledge management system',
      icon: '🗂️',
      category: 'Knowledge Management',
      howItWorks: 'Create atomic notes with unique IDs, link related notes together, and let insights emerge from the connections',
      keyPrinciples: ['Atomic notes', 'Unique IDs', 'Bi-directional links', 'Emerge insights'],
      benefits: ['Better retention', 'Creative connections', 'Growing knowledge base', 'Long-term thinking'],
      popular: false
    },
    {
      id: '7',
      name: 'OKRs (Objectives & Key Results)',
      description: 'Goal-setting framework used by Google and others',
      icon: '🎯',
      category: 'Goal Setting',
      howItWorks: 'Set ambitious Objectives (what you want to achieve) with 3-5 measurable Key Results (how you\'ll measure success)',
      keyPrinciples: ['Ambitious objectives', 'Measurable key results', 'Quarterly cycles', 'Transparency'],
      benefits: ['Aligned teams', 'Measurable progress', 'Focused effort', 'Ambitious thinking'],
      popular: false
    },
    {
      id: '8',
      name: 'Kanban',
      description: 'Visual workflow management system',
      icon: '📋',
      category: 'Workflow',
      howItWorks: 'Visualize work on a board with columns (To Do, In Progress, Done), limit work in progress, and pull work as capacity allows',
      keyPrinciples: ['Visualize workflow', 'Limit WIP', 'Manage flow', 'Make policies explicit'],
      benefits: ['Visible progress', 'Reduced bottlenecks', 'Better flow', 'Team alignment'],
      popular: false
    },
    {
      id: '9',
      name: 'Eat the Frog',
      description: 'Tackle your biggest task first thing in the morning',
      icon: '🐸',
      category: 'Prioritization',
      howItWorks: 'Identify your most important or dreaded task (the "frog") and complete it first thing in the morning before anything else',
      keyPrinciples: ['Identify the frog', 'Do it first', 'No exceptions', 'Build momentum'],
      benefits: ['Overcome procrastination', 'Build momentum', 'Sense of accomplishment', 'Reduced anxiety'],
      popular: false
    },
    {
      id: '10',
      name: '1-3-5 Rule',
      description: 'Plan 1 big, 3 medium, 5 small tasks daily',
      icon: '🔢',
      category: 'Task Management',
      howItWorks: 'Each day, commit to completing 1 big task, 3 medium tasks, and 5 small tasks - no more, no less',
      keyPrinciples: ['1 big task', '3 medium tasks', '5 small tasks', 'Realistic daily limits'],
      benefits: ['Realistic planning', 'Balanced workload', 'Clear daily goals', 'Prevents overwhelm'],
      popular: false
    },
    {
      id: '11',
      name: 'Two-Minute Rule',
      description: 'If it takes less than 2 minutes, do it now',
      icon: '⏱️',
      category: 'Task Management',
      howItWorks: 'When processing tasks, if something can be done in 2 minutes or less, do it immediately rather than adding it to a list',
      keyPrinciples: ['2-minute threshold', 'Do it now', 'Don\'t defer quick tasks', 'Reduce list bloat'],
      benefits: ['Reduced task backlog', 'Quick wins', 'Less mental clutter', 'Increased momentum'],
      popular: false
    },
    {
      id: '12',
      name: 'Inbox Zero',
      description: 'Keep your email inbox empty (or nearly empty)',
      icon: '📧',
      category: 'Email Management',
      howItWorks: 'Process each email once using DELETE, DELEGATE, RESPOND, DEFER, or DO - never leave items sitting in inbox',
      keyPrinciples: ['Delete', 'Delegate', 'Respond', 'Defer', 'Do'],
      benefits: ['Reduced email stress', 'Nothing gets lost', 'Clear mind', 'Better responsiveness'],
      popular: false
    },
    {
      id: '13',
      name: 'SMART Goals',
      description: 'Create Specific, Measurable, Achievable, Relevant, Time-bound goals',
      icon: '🎯',
      category: 'Goal Setting',
      howItWorks: 'Frame every goal to be Specific (clear), Measurable (trackable), Achievable (realistic), Relevant (meaningful), and Time-bound (deadline)',
      keyPrinciples: ['Specific', 'Measurable', 'Achievable', 'Relevant', 'Time-bound'],
      benefits: ['Clear objectives', 'Trackable progress', 'Higher achievement', 'Focused effort'],
      popular: false
    },
    {
      id: '14',
      name: 'Deep Work',
      description: 'Cal Newport\'s framework for focused, distraction-free work',
      icon: '🧠',
      category: 'Focus',
      howItWorks: 'Schedule long, uninterrupted blocks for cognitively demanding work, eliminate all distractions, and train your focus like a muscle',
      keyPrinciples: ['Schedule deep work', 'Eliminate distractions', 'Train focus', 'Measure depth'],
      benefits: ['Higher quality work', 'Faster learning', 'More value creation', 'Career advancement'],
      popular: false
    },
    {
      id: '15',
      name: 'Bullet Journal',
      description: 'Analog system for tracking tasks, events, and notes',
      icon: '📓',
      category: 'Organization',
      howItWorks: 'Use rapid logging with bullets (tasks •, events ○, notes -), migrate incomplete items, and reflect monthly',
      keyPrinciples: ['Rapid logging', 'Migration', 'Collections', 'Monthly reflection'],
      benefits: ['Flexible system', 'Handwriting benefits', 'Creative outlet', 'Mindful planning'],
      popular: false
    },
    {
      id: '16',
      name: 'Atomic Habits',
      description: 'James Clear\'s system for building good habits',
      icon: '⚛️',
      category: 'Habit Building',
      howItWorks: 'Make habits obvious, attractive, easy, and satisfying; stack new habits on existing ones; focus on 1% improvements',
      keyPrinciples: ['Make it obvious', 'Make it attractive', 'Make it easy', 'Make it satisfying'],
      benefits: ['Sustainable habits', 'Compound growth', 'Identity-based change', 'Less willpower needed'],
      popular: false
    },
    {
      id: '17',
      name: '80/20 Rule (Pareto Principle)',
      description: '80% of results come from 20% of efforts',
      icon: '📊',
      category: 'Prioritization',
      howItWorks: 'Identify the 20% of activities that produce 80% of your results, then focus your energy on those high-leverage activities',
      keyPrinciples: ['Identify vital few', 'Eliminate trivial many', 'Focus on leverage', 'Measure results'],
      benefits: ['Maximize impact', 'Less busywork', 'Better ROI', 'Strategic focus'],
      popular: false
    },
    {
      id: '18',
      name: 'Ivy Lee Method',
      description: 'Simple daily planning method from 1918',
      icon: '📝',
      category: 'Task Management',
      howItWorks: 'At end of each day, write down 6 most important tasks for tomorrow. Prioritize them. Next day, work on #1 until complete, then move to #2',
      keyPrinciples: ['6 tasks max', 'Prioritize the night before', 'Single-tasking', 'Finish before moving on'],
      benefits: ['Simple to use', 'Forces prioritization', 'Reduces overwhelm', 'Better completion rates'],
      popular: false
    },
    {
      id: '19',
      name: 'Seinfeld Strategy',
      description: 'Don\'t break the chain - build consistency',
      icon: '📅',
      category: 'Habit Building',
      howItWorks: 'Mark an X on calendar for each day you complete your habit. Your goal is to create a chain of Xs and never break it',
      keyPrinciples: ['Daily consistency', 'Visual tracking', 'Don\'t break the chain', 'Build momentum'],
      benefits: ['Visible progress', 'Strong motivation', 'Builds discipline', 'Works for any habit'],
      popular: false
    },
    {
      id: '20',
      name: 'Weekly Review',
      description: 'GTD\'s critical weekly planning and review ritual',
      icon: '🔄',
      category: 'Planning',
      howItWorks: 'Weekly, review all lists and projects, clear your mind, update your system, and look ahead to plan the coming week',
      keyPrinciples: ['Get clear', 'Get current', 'Get creative', 'Schedule weekly'],
      benefits: ['Stay on track', 'Catch falling balls', 'Strategic perspective', 'Reduced stress'],
      popular: false
    },
    {
      id: '21',
      name: 'Mind Mapping',
      description: 'Visual thinking tool for brainstorming and planning',
      icon: '🗺️',
      category: 'Planning',
      howItWorks: 'Start with central idea, branch out with related concepts, use colors and images, let connections emerge naturally',
      keyPrinciples: ['Central topic', 'Branching structure', 'Visual elements', 'Free association'],
      benefits: ['Better creativity', 'See connections', 'Memorable', 'Engaging process'],
      popular: false
    },
    {
      id: '22',
      name: 'Batching',
      description: 'Group similar tasks and do them together',
      icon: '📦',
      category: 'Time Management',
      howItWorks: 'Group similar tasks (emails, calls, errands) and complete them in dedicated time blocks to reduce context switching',
      keyPrinciples: ['Group similar tasks', 'Dedicated time blocks', 'Reduce switching', 'Process efficiently'],
      benefits: ['Less context switching', 'Higher efficiency', 'Better focus', 'More flow'],
      popular: false
    },
    {
      id: '23',
      name: 'Focus Zones',
      description: 'Divide your day into focus, admin, and social zones',
      icon: '🎯',
      category: 'Time Management',
      howItWorks: 'Designate morning for deep focus work, afternoon for meetings/collaboration, and specific times for admin tasks',
      keyPrinciples: ['Morning focus time', 'Afternoon collaboration', 'Admin batches', 'Energy alignment'],
      benefits: ['Energy optimization', 'Reduced interruptions', 'Better meetings', 'Clear boundaries'],
      popular: false
    },
    {
      id: '24',
      name: 'Energy Management',
      description: 'Manage energy, not just time',
      icon: '⚡',
      category: 'Productivity',
      howItWorks: 'Track when your energy is highest, schedule demanding tasks then, take breaks to renew, and protect your physical/mental energy',
      keyPrinciples: ['Track energy patterns', 'Align tasks with energy', 'Strategic recovery', 'Physical wellness'],
      benefits: ['Sustainable productivity', 'Better quality work', 'Reduced burnout', 'Higher engagement'],
      popular: false
    },
    {
      id: '25',
      name: 'Time Auditing',
      description: 'Track how you actually spend your time',
      icon: '⏰',
      category: 'Time Management',
      howItWorks: 'Track all activities for 1-2 weeks, analyze where time goes, identify time wasters, then optimize your schedule',
      keyPrinciples: ['Track everything', 'Analyze patterns', 'Identify waste', 'Optimize schedule'],
      benefits: ['Reality check', 'Find hidden time', 'Better decisions', 'Increased awareness'],
      popular: false
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredSystems = systems.filter(system => {
    const matchesCategory = selectedCategory === 'all' || system.category === selectedCategory;
    const matchesSearch = system.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         system.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });


  const allCategories = Array.from(new Set(systems.map(s => s.category)));
  const categories = allCategories.map(cat => ({
    id: cat,
    name: cat,
    systems: filteredSystems.filter(s => s.category === cat)
  })).filter(cat => cat.systems.length > 0);

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <SystemsIcon className="w-8 h-8 text-accent" />
            Productivity Systems
          </h1>
          <p className="text-text-secondary mt-1">Proven frameworks and methodologies for better productivity</p>
        </div>
      </div>

      {/* Search and Filters */}
      <WidgetCard>
        <div className="p-6 space-y-4">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search systems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/5 dark:bg-white/5 text-text-primary placeholder-text-secondary rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent"
          />

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-accent text-white'
                  : 'bg-black/5 dark:bg-white/5 text-text-secondary hover:text-text-primary'
              }`}
            >
              All
            </button>
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-accent text-white'
                    : 'bg-black/5 dark:bg-white/5 text-text-secondary hover:text-text-primary'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </WidgetCard>

      {/* Popular Systems */}

      {/* Categories */}
      {categories.length > 0 ? (
        categories.map(category => (
          <div key={category.id} className="space-y-4">
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                {category.name}
                <span className="text-sm font-normal text-text-secondary">({category.systems.length})</span>
              </h2>
              <span className="text-text-secondary transition-transform" style={{ transform: collapsedCategories.has(category.id) ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                ▼
              </span>
            </button>

            {!collapsedCategories.has(category.id) && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.systems.map((system) => (
                  <WidgetCard key={system.id}>
                    <div className="p-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{system.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-text-primary">{system.name}</h3>
                          <p className="text-xs text-text-secondary mt-1">{system.description}</p>
                        </div>
                      </div>

                      {/* How It Works */}
                      <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3 space-y-1">
                        <p className="text-xs font-semibold text-text-secondary uppercase">How It Works</p>
                        <p className="text-sm text-text-primary">{system.howItWorks}</p>
                      </div>

                      {/* Key Principles */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-text-secondary uppercase">Key Principles</p>
                        <div className="flex flex-wrap gap-1">
                          {system.keyPrinciples.slice(0, 3).map((principle, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-accent/20 text-accent rounded-full text-xs">
                              {principle}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action */}
                      <button className="w-full px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-secondary transition-colors text-sm">
                        Learn More
                      </button>
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
            <p className="text-text-secondary">No systems found matching your criteria</p>
          </div>
        </WidgetCard>
      )}
    </div>
  );
};
