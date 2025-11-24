-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table is handled by Supabase Auth automatically

-- Task Lists table
create table if not exists task_lists (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text default '#3b82f6',
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Projects table
create table if not exists projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  status text default 'planning' check (status in ('planning', 'in-progress', 'completed', 'on-hold')),
  due_date date,
  due_time time,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Goals table
create table if not exists goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  target_date date,
  status text default 'not-started' check (status in ('not-started', 'in-progress', 'completed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tasks table
create table if not exists tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  completed boolean default false,
  urgent boolean default false,
  important boolean default false,
  due_date date,
  due_time time,
  estimated_time integer, -- in minutes
  recurring jsonb, -- { frequency, daysOfWeek, endDate }
  subtasks jsonb, -- Array of { id, title, completed }
  list_id uuid references task_lists(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  goal_id uuid references goals(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notes table
create table if not exists notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text default '',
  project_id uuid references projects(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Events table
create table if not exists events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  type text default 'other' check (type in ('class', 'meeting', 'appointment', 'other')),
  start_date date not null,
  start_time time not null,
  end_time time not null,
  recurring jsonb, -- { frequency, daysOfWeek, endDate }
  location text,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Routines table
create table if not exists routines (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  frequency text default 'daily' check (frequency in ('daily', 'weekly', 'monthly')),
  time time,
  days text[], -- For weekly routines
  tasks text[], -- Array of task descriptions
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Workspaces table
create table if not exists workspaces (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  entities jsonb default '[]'::jsonb, -- Array of WorkspaceEntity objects
  view_mode text default 'map' check (view_mode in ('map', 'list', 'table', 'timeline', 'tree', 'zoom')),
  camera jsonb default '{"x": 0, "y": 0, "zoom": 1}'::jsonb,
  edge_styles jsonb, -- Map of edge IDs to styles
  edge_handles jsonb, -- Map of edge IDs to handle positions
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User settings table
create table if not exists user_settings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade unique not null,
  email_notifications boolean default true,
  notification_email text,
  theme_style text default 'glass' check (theme_style in ('minimalist', 'glass', 'terminal', 'pastel')),
  theme_mode text default 'dark' check (theme_mode in ('light', 'dark')),
  ai_voice text default 'female' check (ai_voice in ('female', 'male')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) - Users can only see their own data

alter table task_lists enable row level security;
alter table projects enable row level security;
alter table goals enable row level security;
alter table tasks enable row level security;
alter table notes enable row level security;
alter table events enable row level security;
alter table routines enable row level security;
alter table workspaces enable row level security;
alter table user_settings enable row level security;

-- Policies for task_lists
create policy "Users can view own task_lists" on task_lists for select using (auth.uid() = user_id);
create policy "Users can create own task_lists" on task_lists for insert with check (auth.uid() = user_id);
create policy "Users can update own task_lists" on task_lists for update using (auth.uid() = user_id);
create policy "Users can delete own task_lists" on task_lists for delete using (auth.uid() = user_id);

-- Policies for projects
create policy "Users can view own projects" on projects for select using (auth.uid() = user_id);
create policy "Users can create own projects" on projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects" on projects for update using (auth.uid() = user_id);
create policy "Users can delete own projects" on projects for delete using (auth.uid() = user_id);

-- Policies for goals
create policy "Users can view own goals" on goals for select using (auth.uid() = user_id);
create policy "Users can create own goals" on goals for insert with check (auth.uid() = user_id);
create policy "Users can update own goals" on goals for update using (auth.uid() = user_id);
create policy "Users can delete own goals" on goals for delete using (auth.uid() = user_id);

-- Policies for tasks
create policy "Users can view own tasks" on tasks for select using (auth.uid() = user_id);
create policy "Users can create own tasks" on tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tasks" on tasks for delete using (auth.uid() = user_id);

-- Policies for notes
create policy "Users can view own notes" on notes for select using (auth.uid() = user_id);
create policy "Users can create own notes" on notes for insert with check (auth.uid() = user_id);
create policy "Users can update own notes" on notes for update using (auth.uid() = user_id);
create policy "Users can delete own notes" on notes for delete using (auth.uid() = user_id);

-- Policies for events
create policy "Users can view own events" on events for select using (auth.uid() = user_id);
create policy "Users can create own events" on events for insert with check (auth.uid() = user_id);
create policy "Users can update own events" on events for update using (auth.uid() = user_id);
create policy "Users can delete own events" on events for delete using (auth.uid() = user_id);

-- Policies for routines
create policy "Users can view own routines" on routines for select using (auth.uid() = user_id);
create policy "Users can create own routines" on routines for insert with check (auth.uid() = user_id);
create policy "Users can update own routines" on routines for update using (auth.uid() = user_id);
create policy "Users can delete own routines" on routines for delete using (auth.uid() = user_id);

-- Policies for workspaces
create policy "Users can view own workspaces" on workspaces for select using (auth.uid() = user_id);
create policy "Users can create own workspaces" on workspaces for insert with check (auth.uid() = user_id);
create policy "Users can update own workspaces" on workspaces for update using (auth.uid() = user_id);
create policy "Users can delete own workspaces" on workspaces for delete using (auth.uid() = user_id);

-- Policies for user_settings
create policy "Users can view own settings" on user_settings for select using (auth.uid() = user_id);
create policy "Users can create own settings" on user_settings for insert with check (auth.uid() = user_id);
create policy "Users can update own settings" on user_settings for update using (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_task_lists_updated_at before update on task_lists for each row execute function update_updated_at_column();
create trigger update_projects_updated_at before update on projects for each row execute function update_updated_at_column();
create trigger update_goals_updated_at before update on goals for each row execute function update_updated_at_column();
create trigger update_tasks_updated_at before update on tasks for each row execute function update_updated_at_column();
create trigger update_notes_updated_at before update on notes for each row execute function update_updated_at_column();
create trigger update_events_updated_at before update on events for each row execute function update_updated_at_column();
create trigger update_routines_updated_at before update on routines for each row execute function update_updated_at_column();
create trigger update_workspaces_updated_at before update on workspaces for each row execute function update_updated_at_column();
create trigger update_user_settings_updated_at before update on user_settings for each row execute function update_updated_at_column();

-- Create default settings when user signs up
create or replace function create_default_settings()
returns trigger as $$
begin
  insert into user_settings (user_id, notification_email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function create_default_settings();

-- Create default task lists when user signs up
create or replace function create_default_task_lists()
returns trigger as $$
begin
  insert into task_lists (user_id, name, color, icon) values
    (new.id, 'Work', '#3b82f6', '💼'),
    (new.id, 'Personal', '#10b981', '🏠');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created_task_lists
  after insert on auth.users
  for each row execute function create_default_task_lists();
