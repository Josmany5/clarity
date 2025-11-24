import React, { useState } from 'react';
import { AuthService } from '../services/AuthService';
import { DataService } from '../services/DataService';

interface OnboardingFlowProps {
  onComplete: (user?: any) => void;
  onGoToSignIn?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onGoToSignIn }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [firstTask, setFirstTask] = useState('');
  const [taskCreated, setTaskCreated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const needs = [
    { id: 'tasks', label: 'Tasks & To-dos', icon: '✓', description: 'Track what needs to get done' },
    { id: 'projects', label: 'Projects', icon: '◈', description: 'Manage larger initiatives' },
    { id: 'notes', label: 'Notes & Ideas', icon: '✎', description: 'Capture your thoughts' },
    { id: 'events', label: 'Calendar & Events', icon: '◷', description: 'Schedule your time' },
    { id: 'goals', label: 'Goals', icon: '◎', description: 'Track what you want to achieve' },
    { id: 'ai', label: 'Wove AI', icon: '✦', description: 'Get intelligent assistance' },
  ];

  const toggleNeed = (id: string) => {
    setSelectedNeeds(prev =>
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    );
  };

  const handleCreateTask = () => {
    if (!firstTask.trim() || taskCreated) return;
    setTaskCreated(true);
  };

  const handleTaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && firstTask.trim() && !taskCreated) {
      e.preventDefault();
      handleCreateTask();
    }
  };

  // Validate email/password on screen 1 before proceeding
  const validateAndProceed = async () => {
    setError('');

    // Basic validation
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Try to validate with Supabase (check if email is valid format, etc.)
    setIsLoading(true);
    try {
      // Just proceed - actual signup happens on final step
      setCurrentStep(currentStep + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setError('');
    setIsLoading(true);

    // Save preferences to localStorage
    if (userName) {
      localStorage.setItem('userName', userName);
    }
    if (selectedNeeds.length > 0) {
      localStorage.setItem('userNeeds', JSON.stringify(selectedNeeds));
    }
    // Save task for creation after signup
    if (firstTask.trim()) {
      localStorage.setItem('pendingFirstTask', firstTask.trim());
    }
    localStorage.setItem('onboardingComplete', 'true');

    // Create account
    try {
      const { error } = await AuthService.signUp(email, password);
      if (error) {
        // If signup fails, go back to screen 1 to show the error
        setCurrentStep(0);
        setError(error.message);
        setIsLoading(false);
        return;
      }
      // Success - auth state change will take user to dashboard
      onComplete();
    } catch (err: any) {
      setCurrentStep(0);
      setError(err.message || 'Failed to create account');
      setIsLoading(false);
    }
  };

  const steps = [
    // Step 1: Welcome + Signup
    {
      content: (
        <div className="space-y-5">
          {/* Icon */}
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          {/* Main headline */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Productivity that adapts to <span className="text-purple-600">YOU</span>
            </h1>
            <p className="text-gray-500 text-sm">
              Tired of scattered tools? Prose brings everything together.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Your name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="John"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min 6 characters)"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>
      )
    },
    // Step 2: What do you need help with?
    {
      content: (
        <div className="space-y-5">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">What would you like to focus on?</h2>
            <p className="text-gray-500 text-sm">Select all that apply. We'll personalize your experience.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {needs.map((need) => (
              <button
                key={need.id}
                onClick={() => toggleNeed(need.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedNeeds.includes(need.id)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2 text-purple-600">{need.icon}</div>
                <p className="font-medium text-gray-900 text-sm">{need.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{need.description}</p>
              </button>
            ))}
          </div>
        </div>
      )
    },
    // Step 3: Meet Wove + First Win (Chat style)
    {
      content: (
        <div className="space-y-4">
          {/* Chat conversation */}
          <div className="space-y-4">
            {/* Wove message */}
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-200">
                <span className="text-lg text-white">✦</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-purple-600 font-medium mb-1">Wove</p>
                <div className="bg-purple-50 rounded-2xl rounded-tl-md p-4">
                  <p className="text-gray-800">
                    Hey{userName ? ` ${userName}` : ''}! I'm <span className="font-semibold text-purple-600">Wove</span>, your AI assistant.
                  </p>
                  <p className="text-gray-600 mt-2 text-sm">
                    I'll help you stay organized, break down goals, and get things done. Let's start with a quick win!
                  </p>
                </div>
              </div>
            </div>

            {/* Wove follow-up */}
            <div className="flex gap-3">
              <div className="w-10 h-10 flex-shrink-0" />
              <div className="flex-1">
                <div className="bg-purple-50 rounded-2xl rounded-tl-md p-4">
                  <p className="text-gray-800">
                    What's <span className="font-medium">one thing</span> you want to get done today? I'll add it to your tasks.
                  </p>
                </div>
              </div>
            </div>

            {/* User response input */}
            <div className="flex gap-3">
              <div className="w-10 h-10 flex-shrink-0" />
              <div className="flex-1">
                <div className="bg-gray-100 rounded-2xl rounded-tr-md p-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={firstTask}
                    onChange={(e) => {
                      setFirstTask(e.target.value);
                      setTaskCreated(false);
                    }}
                    onKeyDown={handleTaskKeyDown}
                    placeholder="Type your task and press Enter..."
                    className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none"
                    disabled={taskCreated}
                  />
                  {firstTask && !taskCreated && (
                    <button
                      onClick={handleCreateTask}
                      className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center hover:bg-purple-600 transition-colors"
                    >
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Wove confirmation */}
            {taskCreated && firstTask && (
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-200">
                  <span className="text-lg text-white">✦</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-purple-600 font-medium mb-1">Wove</p>
                  <div className="bg-purple-50 rounded-2xl rounded-tl-md p-4">
                    <p className="text-gray-800">
                      Got it! Your task "<span className="font-medium text-purple-600">{firstTask}</span>" has been created.
                    </p>
                    <p className="text-gray-600 mt-2 text-sm">
                      You're all set! Create your account and let's get started.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    },
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = currentStep === 0 ? (email && password && confirmPassword) : true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index <= currentStep ? 'bg-purple-500 w-8' : 'bg-gray-300 w-1.5'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8">
          {currentStepData.content}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={isLoading}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Back
              </button>
            )}
            <button
              onClick={() => {
                if (isLastStep) {
                  handleComplete();
                } else if (currentStep === 0) {
                  // Validate email/password before proceeding from screen 1
                  validateAndProceed();
                } else {
                  setCurrentStep(currentStep + 1);
                }
              }}
              disabled={!canProceed || isLoading}
              className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (isLastStep ? 'Creating account...' : 'Validating...') : isLastStep ? 'Create Account' : 'Continue'}
            </button>
          </div>

          {/* Skip - goes to auth page */}
          {!isLastStep && (
            <button
              onClick={() => onGoToSignIn ? onGoToSignIn() : onComplete()}
              className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Skip to signup
            </button>
          )}
        </div>

        {/* Sign in link */}
        <p className="text-center mt-6 text-sm text-gray-500">
          Already have an account?{' '}
          <button onClick={() => onGoToSignIn ? onGoToSignIn() : onComplete()} className="text-purple-600 hover:text-purple-700 font-medium">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};
