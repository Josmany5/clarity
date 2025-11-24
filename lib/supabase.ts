import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://npcsrfodfkvxzseogwwf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wY3NyZm9kZmt2eHpzZW9nd3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NDExMTAsImV4cCI6MjA3OTUxNzExMH0.G2xGUqsz_IA_BbbCp7a5Z3fNwdexT9Qop4-q6FY4EqQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface DbTask {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high';
  project_id: string | null;
  goal_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbProject {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: 'active' | 'completed' | 'on-hold';
  color: string;
  created_at: string;
  updated_at: string;
}

export interface DbGoal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface DbNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  project_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbEvent {
  id: string;
  user_id: string;
  title: string;
  date: string;
  time: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbRoutine {
  id: string;
  user_id: string;
  title: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string | null;
  days: string[] | null; // For weekly: ['monday', 'wednesday', etc.]
  tasks: string[]; // Array of task descriptions
  created_at: string;
  updated_at: string;
}

export interface DbUserSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  notification_email: string | null;
  theme: 'light' | 'dark' | 'system';
  created_at: string;
  updated_at: string;
}
