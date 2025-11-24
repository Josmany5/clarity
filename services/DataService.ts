import { supabase } from '../lib/supabase';
import type { DbTask, DbProject, DbGoal, DbNote, DbEvent, DbRoutine, DbUserSettings } from '../lib/supabase';

// Generic CRUD operations
export const DataService = {
  // ============ TASKS ============
  async getTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data as DbTask[] | null, error };
  },

  async createTask(task: Omit<DbTask, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...task, user_id: user.id })
      .select()
      .single();
    return { data: data as DbTask | null, error };
  },

  async updateTask(id: string, updates: Partial<DbTask>) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data: data as DbTask | null, error };
  },

  async deleteTask(id: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    return { error };
  },

  // ============ PROJECTS ============
  async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data as DbProject[] | null, error };
  },

  async createProject(project: Omit<DbProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('projects')
      .insert({ ...project, user_id: user.id })
      .select()
      .single();
    return { data: data as DbProject | null, error };
  },

  async updateProject(id: string, updates: Partial<DbProject>) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data: data as DbProject | null, error };
  },

  async deleteProject(id: string) {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    return { error };
  },

  // ============ GOALS ============
  async getGoals() {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data as DbGoal[] | null, error };
  },

  async createGoal(goal: Omit<DbGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('goals')
      .insert({ ...goal, user_id: user.id })
      .select()
      .single();
    return { data: data as DbGoal | null, error };
  },

  async updateGoal(id: string, updates: Partial<DbGoal>) {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data: data as DbGoal | null, error };
  },

  async deleteGoal(id: string) {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    return { error };
  },

  // ============ NOTES ============
  async getNotes() {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data as DbNote[] | null, error };
  },

  async createNote(note: Omit<DbNote, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('notes')
      .insert({ ...note, user_id: user.id })
      .select()
      .single();
    return { data: data as DbNote | null, error };
  },

  async updateNote(id: string, updates: Partial<DbNote>) {
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data: data as DbNote | null, error };
  },

  async deleteNote(id: string) {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    return { error };
  },

  // ============ EVENTS ============
  async getEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    return { data: data as DbEvent[] | null, error };
  },

  async createEvent(event: Omit<DbEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('events')
      .insert({ ...event, user_id: user.id })
      .select()
      .single();
    return { data: data as DbEvent | null, error };
  },

  async updateEvent(id: string, updates: Partial<DbEvent>) {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data: data as DbEvent | null, error };
  },

  async deleteEvent(id: string) {
    const { error } = await supabase.from('events').delete().eq('id', id);
    return { error };
  },

  // ============ ROUTINES ============
  async getRoutines() {
    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data as DbRoutine[] | null, error };
  },

  async createRoutine(routine: Omit<DbRoutine, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('routines')
      .insert({ ...routine, user_id: user.id })
      .select()
      .single();
    return { data: data as DbRoutine | null, error };
  },

  async updateRoutine(id: string, updates: Partial<DbRoutine>) {
    const { data, error } = await supabase
      .from('routines')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data: data as DbRoutine | null, error };
  },

  async deleteRoutine(id: string) {
    const { error } = await supabase.from('routines').delete().eq('id', id);
    return { error };
  },

  // ============ USER SETTINGS ============
  async getUserSettings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // If no settings exist, create default settings
    if (error?.code === 'PGRST116' || !data) {
      const { data: newSettings, error: createError } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          notification_email: user.email
        })
        .select()
        .single();
      return { data: newSettings as DbUserSettings | null, error: createError };
    }

    return { data: data as DbUserSettings | null, error };
  },

  async updateUserSettings(updates: Partial<DbUserSettings>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();
    return { data: data as DbUserSettings | null, error };
  },
};
