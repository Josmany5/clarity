import React, { useState } from 'react';
import { AuthService } from '../services/AuthService';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'forgot') {
        const { error } = await AuthService.resetPassword(email);
        if (error) throw error;
        setMessage('Check your email for a password reset link');
        return;
      }

      if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        const { error } = await AuthService.signUp(email, password);
        if (error) throw error;
        setMessage('Check your email to confirm your account');
        return;
      }

      // Login
      const { error } = await AuthService.signIn(email, password);
      if (error) throw error;
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    const { error } = await AuthService.signInWithGoogle();
    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text">Prose</h1>
            <p className="text-text-muted mt-2">
              {mode === 'login' && 'Welcome back'}
              {mode === 'signup' && 'Create your account'}
              {mode === 'forgot' && 'Reset your password'}
            </p>
          </div>

          {/* Error/Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-green-700 dark:text-green-300 text-sm">
              {message}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="you@example.com"
                required
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm font-medium text-text mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-text mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : (
                mode === 'login' ? 'Sign In' :
                mode === 'signup' ? 'Create Account' :
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Divider */}
          {mode !== 'forgot' && (
            <>
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-border"></div>
                <span className="px-4 text-text-muted text-sm">or</span>
                <div className="flex-1 border-t border-border"></div>
              </div>

              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                className="w-full py-2 bg-white dark:bg-gray-800 border border-border rounded-lg font-medium text-text hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </>
          )}

          {/* Mode Switcher */}
          <div className="mt-6 text-center text-sm">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => setMode('forgot')}
                  className="text-accent hover:underline"
                >
                  Forgot password?
                </button>
                <p className="mt-2 text-text-muted">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="text-accent hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </>
            )}
            {mode === 'signup' && (
              <p className="text-text-muted">
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-accent hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <button
                onClick={() => setMode('login')}
                className="text-accent hover:underline"
              >
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
