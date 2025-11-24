import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export const AuthService = {
  // Sign up with email and password
  async signUp(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { user: data.user, error };
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { user: data.user, error };
  },

  // Sign in with Google
  async signInWithGoogle(): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { error };
  },

  // Sign out
  async signOut(): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current session
  async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  // Get current user
  async getUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  // Listen for auth changes
  onAuthStateChange(callback: (user: User | null, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null, session);
    });
  },

  // Send password reset email
  async resetPassword(email: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  },

  // Update password
  async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  },
};
