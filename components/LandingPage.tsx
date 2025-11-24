import React, { useState } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <span className="text-2xl font-bold text-gray-900">
              Prose
            </span>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#ai" className="text-gray-600 hover:text-gray-900 transition-colors">Wove AI</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <button
                onClick={onSignIn}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onGetStarted}
                className="px-5 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-sm"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-gray-600 hover:text-gray-900 py-2">Features</a>
              <a href="#ai" className="block text-gray-600 hover:text-gray-900 py-2">Wove AI</a>
              <a href="#pricing" className="block text-gray-600 hover:text-gray-900 py-2">Pricing</a>
              <button onClick={onSignIn} className="block text-gray-600 hover:text-gray-900 py-2 w-full text-left">Sign In</button>
              <button
                onClick={onGetStarted}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Say what you need.{' '}
              <span className="text-purple-600">We build it.</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-4">
              No complex setup, no navigating 100 features. Start work instantly.
            </p>

            <p className="text-base text-gray-500 max-w-2xl mx-auto mb-8">
              Your tasks, projects, notes, and goals delivered right to you in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
              >
                Start Free
              </button>
              <button
                className="w-full sm:w-auto px-8 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors border border-gray-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Demo
              </button>
            </div>
          </div>

          {/* Dashboard Preview - Full mockup without browser chrome */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xl shadow-purple-200/30">
              <div className="flex h-[450px] sm:h-[550px]">
                {/* Sidebar */}
                <div className="w-56 bg-gray-50 border-r border-gray-200 p-4 hidden sm:flex flex-col">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                      <span className="text-white font-bold">P</span>
                    </div>
                    <span className="font-semibold text-gray-900">Prose</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-purple-100 text-purple-700 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="text-sm font-medium">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="text-sm">Tasks</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="text-sm">Projects</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">Calendar</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="text-sm">Goals</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                      </svg>
                      <span className="text-sm">Workflows</span>
                    </div>
                  </div>

                  {/* Wove AI button */}
                  <div className="mt-auto pt-4">
                    <div className="flex items-center gap-3 px-3 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl cursor-pointer">
                      <span className="text-lg">✦</span>
                      <span className="text-sm font-medium">Ask Wove AI</span>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 overflow-hidden bg-gray-50/50">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Good morning</h2>
                      <p className="text-gray-500 text-sm">You have 5 tasks due today</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200"></div>
                    </div>
                  </div>

                  {/* Dashboard Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Today's Tasks */}
                    <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Today's Tasks</h3>
                        <span className="text-xs text-gray-500">5 remaining</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-5 h-5 rounded border-2 border-purple-500"></div>
                          <span className="text-gray-800 text-sm flex-1">Review Q4 marketing strategy</span>
                          <span className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded">High</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-5 h-5 rounded border-2 border-purple-500"></div>
                          <span className="text-gray-800 text-sm flex-1">Finalize product roadmap</span>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded">Medium</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-gray-400 text-sm line-through flex-1">Team standup meeting</span>
                          <span className="text-xs text-green-600">Done</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="bg-white rounded-xl p-5 border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-4">Weekly Progress</h3>
                      <div className="flex items-center justify-center mb-4">
                        <div className="relative w-24 h-24">
                          <svg className="w-24 h-24 transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                            <circle cx="48" cy="48" r="40" stroke="url(#gradient)" strokeWidth="8" fill="none" strokeDasharray="251" strokeDashoffset="75" strokeLinecap="round" />
                            <defs>
                              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#6366f1" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-900">70%</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-center text-sm text-gray-500">21 of 30 tasks completed</p>
                    </div>

                    {/* Active Project */}
                    <div className="bg-white rounded-xl p-5 border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-4">Active Project</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 text-lg">🚀</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">Product Launch</p>
                            <p className="text-xs text-gray-500">Due in 5 days</p>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full w-3/4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
                        </div>
                        <p className="text-xs text-gray-500">75% complete</p>
                      </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-4">Upcoming</h3>
                      <div className="flex gap-3">
                        <div className="flex-1 p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <p className="text-xs text-purple-600 mb-1">2:00 PM</p>
                          <p className="text-sm font-medium text-gray-900">Design Review</p>
                        </div>
                        <div className="flex-1 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-xs text-blue-600 mb-1">4:30 PM</p>
                          <p className="text-sm font-medium text-gray-900">Client Call</p>
                        </div>
                        <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-200 hidden sm:block">
                          <p className="text-xs text-gray-500 mb-1">Tomorrow</p>
                          <p className="text-sm font-medium text-gray-900">Sprint Planning</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Wove AI Chat */}
            <div className="absolute -bottom-6 right-4 sm:right-8 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 max-w-[280px] sm:max-w-sm">
              <div className="space-y-3">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-purple-600 text-white rounded-2xl rounded-tr-md px-4 py-2 max-w-[85%]">
                    <p className="text-sm">Create a project for the product launch next month</p>
                  </div>
                </div>
                {/* Wove response */}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs">✦</span>
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-2">
                    <p className="text-sm text-gray-800">Done! I created "Product Launch" with 8 tasks, milestones, and a timeline. Want me to add team members?</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features - Original Grouped Cards */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Everything you need</h2>
            <p className="text-lg text-gray-600">All your productivity tools in one beautiful place.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tasks & Events */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tasks & Events</h3>
              <p className="text-gray-600 text-sm">Capture everything you need to do. Schedule events and never miss a deadline.</p>
            </div>

            {/* Notes & Ideas */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes & Ideas</h3>
              <p className="text-gray-600 text-sm">Capture thoughts, meeting notes, and inspiration with rich text editing.</p>
            </div>

            {/* Goals & Projects */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Goals & Projects</h3>
              <p className="text-gray-600 text-sm">Track meaningful goals and manage projects with milestones and timelines.</p>
            </div>

            {/* Canvas & Workspaces */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Canvas & Workspaces</h3>
              <p className="text-gray-600 text-sm">Visualize your work on infinite canvases. Organize with separate workspaces.</p>
            </div>

            {/* Templates & Routines */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Templates & Routines</h3>
              <p className="text-gray-600 text-sm">Pre-built systems and recurring workflows that run on autopilot.</p>
            </div>

            {/* Wove AI */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4">
                <span className="text-white text-lg">✦</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Wove AI</h3>
              <p className="text-gray-600 text-sm">Your intelligent assistant that helps you organize, plan, and stay productive.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Skip the setup. Start working.
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Other tools make you build your own system. Prose gives you exactly what you need, instantly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-purple-100 flex items-center justify-center">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Tell Wove</h3>
              <p className="text-gray-600">
                Describe what you're working on. "I need to plan a product launch" or "Help me track my fitness goals."
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-purple-100 flex items-center justify-center">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Your System</h3>
              <p className="text-gray-600">
                Wove creates your projects, tasks, templates, and workflows. Everything organized and ready to go.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-purple-100 flex items-center justify-center">
                <span className="text-3xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Start Immediately</h3>
              <p className="text-gray-600">
                No tutorials. No configuration. Your workspace is built for you. Just dive in and be productive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Built for Real Work */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Built for real work</h2>
            <p className="text-lg text-gray-600">Powerful features that adapt to how you work.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Smart Dashboard */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Dashboard</h3>
              <p className="text-gray-600 text-sm">See everything at a glance. Tasks, projects, events, and progress all in one view.</p>
            </div>

            {/* Automated Workflows */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Automated Workflows</h3>
              <p className="text-gray-600 text-sm">Set up recurring tasks, reminders, and routines that run on autopilot.</p>
            </div>

            {/* Ready Templates */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready Templates</h3>
              <p className="text-gray-600 text-sm">Pre-built systems for projects, goals, habits, and more. Just pick and start.</p>
            </div>

            {/* Canvas View */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Canvas View</h3>
              <p className="text-gray-600 text-sm">Visualize your work on an infinite canvas. Connect ideas, tasks, and projects freely.</p>
            </div>

            {/* Multiple Workspaces */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multiple Workspaces</h3>
              <p className="text-gray-600 text-sm">Separate spaces for work, personal, and different projects. Stay organized everywhere.</p>
            </div>

            {/* Smart Insights */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Insights</h3>
              <p className="text-gray-600 text-sm">Understand your productivity patterns with visual analytics and suggestions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Wove AI Section */}
      <section id="ai" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-6">
              <span className="text-xl text-purple-600">✦</span>
              <span className="text-purple-600 text-sm font-medium">Powered by AI</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Meet Wove, Your AI Partner
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              More than an assistant. Wove understands your work and builds what you need.
            </p>
          </div>

          {/* Wove Capabilities */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Creation</h3>
              <p className="text-gray-600 text-sm">
                "Create a project for the hackathon" → Full project with tasks, timeline, and milestones.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Insights</h3>
              <p className="text-gray-600 text-sm">
                Get proactive suggestions. Wove notices patterns and helps you work smarter.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Natural Chat</h3>
              <p className="text-gray-600 text-sm">
                No commands to learn. Just talk naturally. "What's my priority today?"
              </p>
            </div>
          </div>

          {/* Example Chat */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-purple-600 text-white rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%]">
                    <p className="text-sm">I need to prepare for my job interview next week</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">✦</span>
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3">
                    <p className="text-gray-800 text-sm">
                      I've created an "Interview Prep" project with tasks for researching the company, practicing common questions, preparing your portfolio, and planning your outfit. I also added a reminder for the day before. What role are you interviewing for?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Canvas & Workspaces Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full mb-4">
                <span className="text-purple-600 text-sm font-medium">Workspaces & Canvas</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Your ideas,<br />connected visually
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                More than lists. Create visual workspaces where tasks, notes, and projects connect naturally.
                See the big picture while managing the details.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Infinite Canvas</p>
                    <p className="text-gray-600 text-sm">Drag, connect, and arrange your work freely in any direction</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Visual Connections</p>
                    <p className="text-gray-600 text-sm">Link related tasks, notes, and projects with visual lines</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Multiple Workspaces</p>
                    <p className="text-gray-600 text-sm">Separate spaces for work, personal, and different projects</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Canvas Preview */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl border border-gray-200 p-6 shadow-xl">
                {/* Canvas Area */}
                <div className="relative h-[400px] overflow-hidden">
                  {/* Grid background */}
                  <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}></div>

                  {/* Canvas nodes */}
                  <div className="absolute top-8 left-8 bg-white rounded-xl p-4 border border-gray-200 shadow-sm w-48">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🎯</span>
                      <span className="font-semibold text-gray-900 text-sm">Q4 Goals</span>
                    </div>
                    <p className="text-xs text-gray-500">3 milestones</p>
                  </div>

                  <div className="absolute top-32 left-48 bg-purple-100 rounded-xl p-4 border border-purple-200 shadow-sm w-44">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🚀</span>
                      <span className="font-semibold text-gray-900 text-sm">Product Launch</span>
                    </div>
                    <p className="text-xs text-purple-600">In Progress</p>
                  </div>

                  <div className="absolute top-8 right-8 bg-white rounded-xl p-4 border border-gray-200 shadow-sm w-40">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">📝</span>
                      <span className="font-semibold text-gray-900 text-sm">Meeting Notes</span>
                    </div>
                    <p className="text-xs text-gray-500">Updated today</p>
                  </div>

                  <div className="absolute top-56 left-12 bg-white rounded-xl p-4 border border-gray-200 shadow-sm w-36">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 rounded border-2 border-purple-500"></div>
                      <span className="text-gray-800 text-sm">Design review</span>
                    </div>
                    <p className="text-xs text-gray-500">Tomorrow</p>
                  </div>

                  <div className="absolute bottom-12 right-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 shadow-lg w-48">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-lg">✦</span>
                      <span className="text-white text-sm font-medium">Add to canvas...</span>
                    </div>
                  </div>

                  {/* Connection lines (SVG) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
                    <line x1="120" y1="80" x2="200" y2="160" stroke="#a78bfa" strokeWidth="2" strokeDasharray="4" />
                    <line x1="270" y1="170" x2="200" y2="80" stroke="#a78bfa" strokeWidth="2" strokeDasharray="4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Replace Your Stack Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Replace your entire stack</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stop juggling between apps. Prose brings everything together in one place.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
            {/* Old Tools */}
            <div className="flex flex-wrap justify-center gap-4 max-w-md">
              <div className="px-4 py-3 bg-gray-100 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium">
                To-do list app
              </div>
              <div className="px-4 py-3 bg-gray-100 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium">
                Notes app
              </div>
              <div className="px-4 py-3 bg-gray-100 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium">
                Project manager
              </div>
              <div className="px-4 py-3 bg-gray-100 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium">
                Calendar app
              </div>
              <div className="px-4 py-3 bg-gray-100 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium">
                Goal tracker
              </div>
              <div className="px-4 py-3 bg-gray-100 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium">
                Habit tracker
              </div>
              <div className="px-4 py-3 bg-gray-100 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium">
                Whiteboard app
              </div>
              <div className="px-4 py-3 bg-gray-100 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium">
                AI assistant
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>

            {/* Prose */}
            <div className="px-8 py-6 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-xl shadow-purple-200">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">P</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Prose</h3>
                  <p className="text-purple-200 text-sm">AI-powered productivity</p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-16 grid sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">1</div>
              <p className="text-gray-600">Single app to learn</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">5+</div>
              <p className="text-gray-600">Hours saved per month</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
              <p className="text-gray-600">Synced & connected</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-purple-600 font-medium mb-2">Your thoughts, organized</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Loved by productive people</h2>
            <p className="text-lg text-gray-600">See what others are saying about Prose</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "Prose completely changed how I manage my work. The AI assistant is like having a personal productivity coach that actually gets things done."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">SK</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Sarah K.</p>
                  <p className="text-sm text-gray-500">Product Designer</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "Finally, a tool that doesn't require a PhD to set up. I just tell Wove what I need and it builds the perfect system for me instantly."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">MT</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Michael T.</p>
                  <p className="text-sm text-gray-500">Startup Founder</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "I've tried every productivity app out there. Prose is the first one that actually feels like it works for me, not the other way around."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-semibold">JL</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Jessica L.</p>
                  <p className="text-sm text-gray-500">Marketing Manager</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Simple pricing</h2>
            <p className="text-gray-600">Start free, upgrade when you need more.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Free</h3>
              <p className="text-gray-500 text-sm mb-4">For personal use</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited tasks & notes
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Calendar & events
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Basic Wove AI assistant
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  1 workspace
                </li>
              </ul>
              <button
                onClick={onGetStarted}
                className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Get Started
              </button>
            </div>

            {/* Pro Plan */}
            <div className="p-6 bg-purple-600 rounded-2xl shadow-lg shadow-purple-200 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-500 rounded-full text-xs font-medium text-white">
                Popular
              </div>
              <h3 className="text-xl font-semibold text-white mb-1">Pro</h3>
              <p className="text-purple-200 text-sm mb-4">For power users</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-white">$12</span>
                <span className="text-purple-200">/month</span>
              </div>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center gap-2 text-purple-100">
                  <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Everything in Free
                </li>
                <li className="flex items-center gap-2 text-purple-100">
                  <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited Wove AI
                </li>
                <li className="flex items-center gap-2 text-purple-100">
                  <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited workspaces
                </li>
                <li className="flex items-center gap-2 text-purple-100">
                  <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority support
                </li>
              </ul>
              <button
                onClick={onGetStarted}
                className="w-full py-2.5 bg-white text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors"
              >
                Start Free Trial
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="p-6 bg-white rounded-2xl border-2 border-gray-900 shadow-sm relative">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Enterprise</h3>
              <p className="text-gray-500 text-sm mb-4">For teams & organizations</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">Custom</span>
              </div>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Everything in Pro
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Team collaboration
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  SSO & advanced security
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Dedicated account manager
                </li>
              </ul>
              <button
                onClick={onGetStarted}
                className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to work smarter?</h2>
          <p className="text-gray-600 mb-6">Tell Wove what you need. Start in seconds.</p>
          <button
            onClick={onGetStarted}
            className="px-8 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
          >
            Start Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xl font-bold text-gray-900">Prose</span>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-700">Privacy</a>
            <a href="#" className="hover:text-gray-700">Terms</a>
            <span>&copy; {new Date().getFullYear()} Prose</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
