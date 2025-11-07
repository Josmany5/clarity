import React, { useState } from 'react';
import { WidgetCard } from './WidgetCard';
import { TemplatesIcon } from './Icons';

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'business' | 'academic' | 'creative' | 'personal';
  preview: string;
  popular?: boolean;
}

export const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([
    // BUSINESS TEMPLATES - Popular
    {
      id: '1',
      name: 'Professional Invoice',
      description: 'Clean, professional invoice template with itemized billing',
      icon: '🧾',
      category: 'business',
      preview: 'Invoice template with company logo, client details, itemized services, tax calculations, and payment terms',
      popular: true
    },
    {
      id: '2',
      name: 'Project Proposal',
      description: 'Comprehensive proposal template for winning new clients',
      icon: '📋',
      category: 'business',
      preview: 'Proposal with executive summary, project scope, timeline, deliverables, pricing, and terms',
      popular: true
    },
    {
      id: '3',
      name: 'Business Plan',
      description: 'Complete business plan template for startups and investors',
      icon: '📊',
      category: 'business',
      preview: 'Business plan with executive summary, market analysis, financial projections, and strategy',
      popular: true
    },
    // BUSINESS TEMPLATES - Additional
    {
      id: '4',
      name: 'Sales Contract',
      description: 'Professional sales agreement template',
      icon: '📝',
      category: 'business',
      preview: 'Contract with parties, terms, deliverables, payment schedule, and signatures',
      popular: false
    },
    {
      id: '5',
      name: 'NDA Agreement',
      description: 'Non-disclosure agreement for confidential information',
      icon: '🔒',
      category: 'business',
      preview: 'NDA with confidentiality terms, scope, duration, and legal provisions',
      popular: false
    },
    {
      id: '6',
      name: 'Pitch Deck',
      description: 'Investor pitch deck template for fundraising',
      icon: '🚀',
      category: 'business',
      preview: 'Pitch deck with problem, solution, market, traction, team, and financials',
      popular: false
    },
    {
      id: '7',
      name: 'Marketing Brief',
      description: 'Campaign brief template for marketing projects',
      icon: '📢',
      category: 'business',
      preview: 'Brief with objectives, target audience, key messages, channels, and budget',
      popular: false
    },
    {
      id: '8',
      name: 'Meeting Minutes',
      description: 'Structured template for recording meeting notes',
      icon: '🗓️',
      category: 'business',
      preview: 'Minutes with attendees, agenda items, decisions, action items, and follow-ups',
      popular: false
    },

    // ACADEMIC TEMPLATES - Popular
    {
      id: '9',
      name: 'Research Paper',
      description: 'Academic research paper with proper formatting',
      icon: '🔬',
      category: 'academic',
      preview: 'Paper with abstract, introduction, methodology, results, discussion, and references',
      popular: true
    },
    {
      id: '10',
      name: 'Essay Template',
      description: 'Structured essay template for academic writing',
      icon: '📄',
      category: 'academic',
      preview: 'Essay with introduction, thesis statement, body paragraphs, and conclusion',
      popular: true
    },
    // ACADEMIC TEMPLATES - Additional
    {
      id: '11',
      name: 'Lab Report',
      description: 'Scientific lab report template',
      icon: '🧪',
      category: 'academic',
      preview: 'Report with objective, hypothesis, methods, data, analysis, and conclusion',
      popular: false
    },
    {
      id: '12',
      name: 'Thesis Outline',
      description: 'Comprehensive thesis structure template',
      icon: '📚',
      category: 'academic',
      preview: 'Outline with chapters, sections, research questions, and bibliography',
      popular: false
    },
    {
      id: '13',
      name: 'Bibliography',
      description: 'Properly formatted bibliography template',
      icon: '📖',
      category: 'academic',
      preview: 'Bibliography with APA, MLA, and Chicago style formatting examples',
      popular: false
    },
    {
      id: '14',
      name: 'Study Guide',
      description: 'Comprehensive study guide template',
      icon: '📝',
      category: 'academic',
      preview: 'Guide with key concepts, definitions, practice questions, and summary',
      popular: false
    },

    // CREATIVE TEMPLATES - Popular
    {
      id: '15',
      name: 'Blog Post',
      description: 'Engaging blog post template with SEO optimization',
      icon: '✍️',
      category: 'creative',
      preview: 'Post with headline, intro, subheadings, body content, and call-to-action',
      popular: true
    },
    {
      id: '16',
      name: 'Newsletter',
      description: 'Professional newsletter template for email campaigns',
      icon: '📧',
      category: 'creative',
      preview: 'Newsletter with header, featured content, sections, and footer',
      popular: true
    },
    // CREATIVE TEMPLATES - Additional
    {
      id: '17',
      name: 'Press Release',
      description: 'Professional press release template',
      icon: '📰',
      category: 'creative',
      preview: 'Release with headline, dateline, lead paragraph, quotes, and boilerplate',
      popular: false
    },
    {
      id: '18',
      name: 'Script Template',
      description: 'Screenplay format template for video/film',
      icon: '🎬',
      category: 'creative',
      preview: 'Script with scene headings, action, dialogue, and transitions',
      popular: false
    },
    {
      id: '19',
      name: 'Portfolio Page',
      description: 'Creative portfolio template for showcasing work',
      icon: '🎨',
      category: 'creative',
      preview: 'Portfolio with project showcase, descriptions, images, and contact info',
      popular: false
    },
    {
      id: '20',
      name: 'Social Media Post',
      description: 'Optimized social media content template',
      icon: '📱',
      category: 'creative',
      preview: 'Post with hook, body, hashtags, and call-to-action for various platforms',
      popular: false
    },

    // PERSONAL TEMPLATES - Popular
    {
      id: '21',
      name: 'Professional Resume',
      description: 'ATS-friendly resume template',
      icon: '📋',
      category: 'personal',
      preview: 'Resume with contact info, summary, experience, education, and skills',
      popular: true
    },
    {
      id: '22',
      name: 'Cover Letter',
      description: 'Compelling cover letter template',
      icon: '💼',
      category: 'personal',
      preview: 'Letter with introduction, qualifications, achievements, and closing',
      popular: true
    },
    // PERSONAL TEMPLATES - Additional
    {
      id: '23',
      name: 'Personal Budget',
      description: 'Detailed monthly budget spreadsheet template',
      icon: '💰',
      category: 'personal',
      preview: 'Budget with income, expenses, savings, and financial goals tracking',
      popular: false
    },
    {
      id: '24',
      name: 'Travel Itinerary',
      description: 'Organized travel planning template',
      icon: '✈️',
      category: 'personal',
      preview: 'Itinerary with flights, hotels, activities, bookings, and emergency contacts',
      popular: false
    },
    {
      id: '25',
      name: 'Wedding Planner',
      description: 'Complete wedding planning checklist',
      icon: '💒',
      category: 'personal',
      preview: 'Planner with timeline, vendor list, budget, guest list, and to-dos',
      popular: false
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'business' | 'academic' | 'creative' | 'personal'>('all');
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

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularTemplates = filteredTemplates.filter(t => t.popular);

  const categories = [
    { id: 'business', name: 'Business Documents', icon: '💼', templates: filteredTemplates.filter(t => t.category === 'business') },
    { id: 'academic', name: 'Academic Papers', icon: '🎓', templates: filteredTemplates.filter(t => t.category === 'academic') },
    { id: 'creative', name: 'Creative Content', icon: '✨', templates: filteredTemplates.filter(t => t.category === 'creative') },
    { id: 'personal', name: 'Personal Documents', icon: '👤', templates: filteredTemplates.filter(t => t.category === 'personal') }
  ].filter(cat => cat.templates.length > 0);

  const categoryColors = {
    business: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    academic: 'bg-green-500/20 text-green-400 border-green-500/40',
    creative: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    personal: 'bg-orange-500/20 text-orange-400 border-orange-500/40'
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <TemplatesIcon className="w-8 h-8 text-accent" />
            Document Templates
          </h1>
          <p className="text-text-secondary mt-1">Professional document templates for every need</p>
        </div>
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

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {['all', 'business', 'academic', 'creative', 'personal'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
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

      {/* Popular Templates */}
      {popularTemplates.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <span>🔥</span> Popular Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTemplates.map((template) => (
              <WidgetCard key={template.id}>
                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{template.icon}</div>
                      <div>
                        <h3 className="font-bold text-text-primary">{template.name}</h3>
                        <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold border ${categoryColors[template.category]}`}>
                          {template.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-text-secondary">{template.description}</p>

                  {/* Preview */}
                  <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3 space-y-1">
                    <p className="text-xs font-semibold text-text-secondary uppercase">What's Included</p>
                    <p className="text-sm text-text-primary">{template.preview}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-secondary transition-colors text-sm">
                      Use Template
                    </button>
                    <button className="px-4 py-2 bg-black/10 dark:bg-white/10 text-text-primary rounded-lg hover:bg-black/20 dark:hover:bg-white/20 transition-colors text-sm">
                      Preview
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
                <span className="text-sm font-normal text-text-secondary">({category.templates.length})</span>
              </h2>
              <span className="text-text-secondary transition-transform" style={{ transform: collapsedCategories.has(category.id) ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                ▼
              </span>
            </button>

            {!collapsedCategories.has(category.id) && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.templates.map((template) => (
                  <WidgetCard key={template.id}>
                    <div className="p-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{template.icon}</div>
                          <div>
                            <h3 className="font-bold text-text-primary">{template.name}</h3>
                            <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold border ${categoryColors[template.category]}`}>
                              {template.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-text-secondary">{template.description}</p>

                      {/* Preview */}
                      <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3 space-y-1">
                        <p className="text-xs font-semibold text-text-secondary uppercase">What's Included</p>
                        <p className="text-sm text-text-primary">{template.preview}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <button className="flex-1 px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-secondary transition-colors text-sm">
                          Use Template
                        </button>
                        <button className="px-4 py-2 bg-black/10 dark:bg-white/10 text-text-primary rounded-lg hover:bg-black/20 dark:hover:bg-white/20 transition-colors text-sm">
                          Preview
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
            <p className="text-text-secondary">No templates found matching your criteria</p>
          </div>
        </WidgetCard>
      )}
    </div>
  );
};
