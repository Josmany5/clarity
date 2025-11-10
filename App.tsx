
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardGrid } from './components/DashboardGrid';
import { NotesPage } from './components/NotesPage';
import { TasksPage } from './components/TasksPage';
import { ProjectsPage } from './components/ProjectsPage';
import { CalendarPage } from './components/CalendarPage';
import { SettingsPage } from './components/SettingsPage';
import { PlannerPage } from './components/PlannerPage';
import { WorkflowsPage } from './components/WorkflowsPage';
import { RoutinesPage } from './components/RoutinesPage';
import { TemplatesPage } from './components/TemplatesPage';
import { SystemsPage } from './components/SystemsPage';
import { HistoryPage } from './components/HistoryPage';
import { WorkspacesPage } from './components/WorkspacesPage';
import { ChatHistoryPage } from './components/ChatHistoryPage';
import { EventsPage } from './components/EventsPage';
import { SearchResultsPage } from './components/SearchResultsPage';
import { GoalsPage } from './components/GoalsPage';
import { AIAssistant } from './components/AIAssistant';
import { FloatingTimer } from './components/FloatingTimer';

export interface Note {
  id: string;
  title: string;
  content: string;
  lastModified: number;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  urgent: boolean;
  important: boolean;
  dueDate?: string; // YYYY-MM-DD (kept for backward compatibility)
  dueTime?: string;
  estimatedTime?: number; // in minutes
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    daysOfWeek?: number[]; // 0-6 (Sunday-Saturday) - specify which days task occurs
    endDate?: string; // YYYY-MM-DD (when recurrence stops)
  };
  subtasks?: Subtask[];
  listId?: string; // ID of the list this task belongs to
  createdAt: number;
}

export interface TaskList {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: number;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate?: string;
  status: 'not-started' | 'in-progress' | 'completed';
  createdAt: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  createdAt: number;
  dueDate?: string;
  dueTime?: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  type: 'class' | 'meeting' | 'appointment' | 'other';
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    daysOfWeek?: number[]; // 0-6 (Sunday-Saturday) - specify which days event occurs
    endDate?: string; // YYYY-MM-DD - when recurrence stops
  };
  location?: string;
  color?: string;
  createdAt: number;
}

export interface WorkspaceEntity {
  id: string;
  type: 'note' | 'task' | 'project' | 'goal';
  entityId: string; // ID of the actual note/task/project/goal
  position: { x: number; y: number };
  size?: { width: number; height: number };
  links: string[]; // IDs of linked entities
  parentId?: string; // For nesting/hierarchy
  customColor?: string; // Custom background color for node
  customEmoji?: string; // Custom emoji for node
}

export type ViewMode = 'map' | 'list' | 'table' | 'timeline' | 'tree' | 'zoom';

export interface Workspace {
  id: string;
  name: string;
  description: string;
  entities: WorkspaceEntity[];
  viewMode: ViewMode;
  camera: { x: number; y: number; zoom: number };
  edgeStyles?: Record<string, 'default' | 'step' | 'smoothstep' | 'straight'>; // Map of edge IDs to their styles
  edgeHandles?: Record<string, { sourceHandle?: string; targetHandle?: string }>; // Map of edge IDs to their handle positions
  createdAt: number;
  lastModified: number;
}

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('Dashboard');
  const [themeStyle, setThemeStyle] = useState<'minimalist' | 'glass' | 'terminal' | 'pastel'>(() => {
    try {
      const saved = window.localStorage.getItem('themeStyle');
      return (saved as any) || 'glass';
    } catch {
      return 'glass';
    }
  });
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    try {
      const saved = window.localStorage.getItem('themeMode');
      return (saved as any) || 'dark';
    } catch {
      return 'dark';
    }
  });
  const [aiVoice, setAIVoice] = useState<'female' | 'male'>(() => {
    try {
      const saved = window.localStorage.getItem('aiVoice');
      return (saved as 'female' | 'male') || 'female';
    } catch {
      return 'female';
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const savedNotes = window.localStorage.getItem('notes');
      return savedNotes ? JSON.parse(savedNotes) : [];
    } catch (error) {
      console.error("Could not parse notes from localStorage", error);
      return [];
    }
  });
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedTasks = window.localStorage.getItem('tasks');
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
      console.error("Could not parse tasks from localStorage", error);
      return [];
    }
  });
  const [taskLists, setTaskLists] = useState<TaskList[]>(() => {
    try {
      const savedLists = window.localStorage.getItem('taskLists');
      if (savedLists) {
        return JSON.parse(savedLists);
      }
      // Create default lists
      const defaultLists: TaskList[] = [
        { id: 'work', name: 'Work', color: '#3b82f6', icon: '💼', createdAt: Date.now() },
        { id: 'personal', name: 'Personal', color: '#10b981', icon: '🏠', createdAt: Date.now() },
      ];
      return defaultLists;
    } catch (error) {
      console.error("Could not parse task lists from localStorage", error);
      return [];
    }
  });
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    try {
      const savedWorkspaces = window.localStorage.getItem('workspaces');
      return savedWorkspaces ? JSON.parse(savedWorkspaces) : [];
    } catch (error) {
      console.error("Could not parse workspaces from localStorage", error);
      return [];
    }
  });
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem('activeWorkspaceId');
    } catch {
      return null;
    }
  });
  const [events, setEvents] = useState<Event[]>(() => {
    try {
      const savedEvents = window.localStorage.getItem('events');
      return savedEvents ? JSON.parse(savedEvents) : [];
    } catch (error) {
      console.error("Could not parse events from localStorage", error);
      return [];
    }
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const savedGoals = window.localStorage.getItem('goals');
      return savedGoals ? JSON.parse(savedGoals) : [];
    } catch (error) {
      console.error("Could not parse goals from localStorage", error);
      return [];
    }
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const savedProjects = window.localStorage.getItem('projects');
      return savedProjects ? JSON.parse(savedProjects) : [];
    } catch (error) {
      console.error("Could not parse projects from localStorage", error);
      return [];
    }
  });

  // Timer state (persistent across pages)
  const [timerDuration, setTimerDuration] = useState(() => {
    try {
      const saved = window.localStorage.getItem('timerDuration');
      return saved ? parseInt(saved) : 25;
    } catch {
      return 25;
    }
  });
  const [timerTimeRemaining, setTimerTimeRemaining] = useState(() => {
    try {
      const saved = window.localStorage.getItem('timerTimeRemaining');
      return saved ? parseInt(saved) : 25 * 60;
    } catch {
      return 25 * 60;
    }
  });
  const [timerIsActive, setTimerIsActive] = useState(() => {
    try {
      const saved = window.localStorage.getItem('timerIsActive');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    window.localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    window.localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    window.localStorage.setItem('taskLists', JSON.stringify(taskLists));
  }, [taskLists]);

  useEffect(() => {
    window.localStorage.setItem('themeStyle', themeStyle);
  }, [themeStyle]);

  useEffect(() => {
    window.localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  useEffect(() => {
    window.localStorage.setItem('aiVoice', aiVoice);
  }, [aiVoice]);

  useEffect(() => {
    window.localStorage.setItem('workspaces', JSON.stringify(workspaces));
  }, [workspaces]);

  useEffect(() => {
    if (activeWorkspaceId) {
      window.localStorage.setItem('activeWorkspaceId', activeWorkspaceId);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    window.localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    window.localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    window.localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    window.localStorage.setItem('timerDuration', timerDuration.toString());
  }, [timerDuration]);

  useEffect(() => {
    window.localStorage.setItem('timerTimeRemaining', timerTimeRemaining.toString());
  }, [timerTimeRemaining]);

  useEffect(() => {
    window.localStorage.setItem('timerIsActive', timerIsActive.toString());
  }, [timerIsActive]);

  // Timer countdown - runs globally on all pages
  useEffect(() => {
    let interval: number | undefined;

    if (timerIsActive && timerTimeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimerTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timerTimeRemaining === 0 && timerIsActive) {
      setTimerIsActive(false);
    }

    return () => clearInterval(interval);
  }, [timerIsActive, timerTimeRemaining]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N: New Note
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleAddNote();
      }
      // Ctrl+K: Focus Search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        searchInput?.focus();
      }
      // Ctrl+D: Toggle Dark Mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        toggleMode();
      }
      // Ctrl+H: Go to Dashboard
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setActivePage('Dashboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [notes]);

  const toggleMode = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  };

  const changeThemeStyle = (newStyle: typeof themeStyle) => {
    setThemeStyle(newStyle);
  };

  const changeThemeMode = (newMode: typeof themeMode) => {
    setThemeMode(newMode);
  };

  const changeAIVoice = (newVoice: typeof aiVoice) => {
    setAIVoice(newVoice);
  };

  const handleAddNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: 'New Note',
      content: '',
      lastModified: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setActivePage('Notes');
  };

  const handleUpdateNote = (updatedNote: Note) => {
    const otherNotes = notes.filter(note => note.id !== updatedNote.id);
    const newNotes = [{ ...updatedNote, lastModified: Date.now() }, ...otherNotes];
    setNotes(newNotes);
  };
  
  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter((note) => note.id !== noteId));
    setActiveNoteId(null);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setActivePage('Search');
    }
  };

  const handleAddTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    setActivePage('Tasks'); // Auto-navigate to Tasks page like Notes
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleDeleteAllTasks = () => {
    setTasks([]);
  };

  const handleDeleteCompletedTasks = () => {
    setTasks(tasks.filter(task => !task.completed));
  };

  const handleAddTaskList = (list: Omit<TaskList, 'id' | 'createdAt'>) => {
    const newList: TaskList = {
      ...list,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setTaskLists(prevLists => [...prevLists, newList]);
    return newList;
  };

  const handleUpdateTaskList = (updatedList: TaskList) => {
    setTaskLists(taskLists.map(list => list.id === updatedList.id ? updatedList : list));
  };

  const handleDeleteTaskList = (listId: string) => {
    // Move tasks from deleted list to inbox
    setTasks(tasks.map(task =>
      task.listId === listId ? { ...task, listId: 'inbox' } : task
    ));
    setTaskLists(taskLists.filter(list => list.id !== listId && list.id !== 'inbox'));
  };

  const handleAddEvent = (event: Omit<Event, 'id' | 'createdAt'>) => {
    const newEvent: Event = {
      ...event,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setEvents(prevEvents => [newEvent, ...prevEvents]);
  };

  const handleUpdateEvent = (updatedEvent: Event) => {
    setEvents(events.map(event => event.id === updatedEvent.id ? updatedEvent : event));
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  const handleDeleteAllEvents = () => {
    setEvents([]);
  };

  const handleAddGoal = (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setGoals(prevGoals => [newGoal, ...prevGoals]);
  };

  const handleUpdateGoal = (updatedGoal: Goal) => {
    setGoals(goals.map(goal => goal.id === updatedGoal.id ? updatedGoal : goal));
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  const handleAddProject = (project: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...project,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setProjects(prevProjects => [...prevProjects, newProject]);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(projects.map(project => project.id === updatedProject.id ? updatedProject : project));
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(project => project.id !== projectId));
  };

  const handleCreateWorkspace = (name: string, description: string = '') => {
    const newWorkspace: Workspace = {
      id: crypto.randomUUID(),
      name,
      description,
      entities: [],
      viewMode: 'map',
      camera: { x: 0, y: 0, zoom: 1 },
      createdAt: Date.now(),
      lastModified: Date.now(),
    };
    setWorkspaces([...workspaces, newWorkspace]);
    setActiveWorkspaceId(newWorkspace.id);
    return newWorkspace;
  };

  const handleUpdateWorkspace = (updatedWorkspace: Workspace) => {
    setWorkspaces(workspaces.map(ws =>
      ws.id === updatedWorkspace.id
        ? { ...updatedWorkspace, lastModified: Date.now() }
        : ws
    ));
  };

  const handleDeleteWorkspace = (workspaceId: string) => {
    setWorkspaces(workspaces.filter(ws => ws.id !== workspaceId));
    if (activeWorkspaceId === workspaceId) {
      setActiveWorkspaceId(workspaces.length > 1 ? workspaces[0].id : null);
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard':
        return <DashboardGrid
            setActivePage={setActivePage}
            theme={themeStyle}
            notes={notes}
            tasks={tasks}
            goals={goals}
            projects={projects}
            events={events}
            onUpdateGoal={handleUpdateGoal}
            onUpdateProject={handleUpdateProject}
            onUpdateTask={handleUpdateTask}
            onNewNote={handleAddNote}
            onSelectNote={(noteId) => {
                setActiveNoteId(noteId);
                setActivePage('Notes');
            }}
            timerDuration={timerDuration}
            timerTimeRemaining={timerTimeRemaining}
            timerIsActive={timerIsActive}
            onTimerDurationChange={setTimerDuration}
            onTimerTimeRemainingChange={setTimerTimeRemaining}
            onTimerIsActiveChange={setTimerIsActive}
        />;
      case 'Search':
        return <SearchResultsPage
            searchQuery={searchQuery}
            notes={notes}
            tasks={tasks}
            events={events}
            workspaces={workspaces}
            onSelectNote={(noteId) => {
              setActiveNoteId(noteId);
              setActivePage('Notes');
              setSearchQuery('');
            }}
            onSelectWorkspace={(workspaceId) => {
              setActiveWorkspaceId(workspaceId);
              setActivePage('Workspaces');
              setSearchQuery('');
            }}
        />;
      case 'Notes':
        return <NotesPage
            notes={notes}
            activeNoteId={activeNoteId}
            setActiveNoteId={setActiveNoteId}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
            onAddNote={handleAddNote}
            searchQuery={searchQuery}
        />;
      case 'Tasks':
        return <TasksPage
          tasks={tasks}
          taskLists={taskLists}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onAddTaskList={handleAddTaskList}
          onUpdateTaskList={handleUpdateTaskList}
          onDeleteTaskList={handleDeleteTaskList}
        />;
      case 'Projects':
        return <ProjectsPage />;
      case 'Goals':
        return <GoalsPage
          goals={goals}
          onAddGoal={handleAddGoal}
          onUpdateGoal={handleUpdateGoal}
          onDeleteGoal={handleDeleteGoal}
        />;
      case 'Calendar':
        return <CalendarPage
          notes={notes}
          tasks={tasks}
          events={events}
          onUpdateNote={handleUpdateNote}
          onUpdateTask={handleUpdateTask}
          onUpdateEvent={handleUpdateEvent}
        />;
      case 'Events':
        return <EventsPage
          events={events}
          onAddEvent={handleAddEvent}
          onUpdateEvent={handleUpdateEvent}
          onDeleteEvent={handleDeleteEvent}
        />;
      case 'Planner':
        return <PlannerPage />;
      case 'Workflows':
        return <WorkflowsPage />;
      case 'Routines':
        return <RoutinesPage />;
      case 'Templates':
        return <TemplatesPage />;
      case 'Systems':
        return <SystemsPage />;
      case 'History':
        return <HistoryPage />;
      case 'Chat History':
        return <ChatHistoryPage />;
      case 'Workspaces':
        return <WorkspacesPage
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          setActiveWorkspaceId={setActiveWorkspaceId}
          onCreateWorkspace={handleCreateWorkspace}
          onUpdateWorkspace={handleUpdateWorkspace}
          onDeleteWorkspace={handleDeleteWorkspace}
          notes={notes}
          tasks={tasks}
          onUpdateNote={handleUpdateNote}
          onUpdateTask={handleUpdateTask}
          onAddNote={(title, content) => {
            const newNote: Note = {
              id: crypto.randomUUID(),
              title,
              content,
              lastModified: Date.now(),
            };
            setNotes([newNote, ...notes]);
            return newNote;
          }}
          onAddTask={(task) => {
            const newTask: Task = {
              id: crypto.randomUUID(),
              title: task.title,
              completed: false,
              urgent: task.urgent,
              important: task.important,
              dueDate: task.dueDate,
              dueTime: task.dueTime,
              createdAt: Date.now(),
            };
            setTasks([newTask, ...tasks]);
            return newTask;
          }}
          themeMode={themeMode}
          toggleTheme={toggleMode}
        />;
      case 'Settings':
        return <SettingsPage themeStyle={themeStyle} themeMode={themeMode} onThemeStyleChange={changeThemeStyle} onThemeModeChange={changeThemeMode} aiVoice={aiVoice} onAIVoiceChange={changeAIVoice} />;
      default:
        return <DashboardGrid
            setActivePage={setActivePage}
            theme={themeStyle}
            notes={notes}
            tasks={tasks}
            onNewNote={handleAddNote}
            onSelectNote={(noteId) => {
                setActiveNoteId(noteId);
                setActivePage('Notes');
            }}
        />;
    }
  };

  return (
    <div className={`theme-${themeStyle} ${themeMode}`}>
      <div className="min-h-screen bg-bg-primary text-text-primary font-sans transition-colors duration-300">
        <div
          className="fixed inset-0 w-full h-full bg-cover bg-center -z-1 transition-opacity duration-500"
          style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1600880292210-85938c1b3699?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
              opacity: themeStyle === 'glass' && themeMode === 'dark' ? 1 : 0
          }}
        >
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        <div className="flex h-screen overflow-hidden">
          <Sidebar activePage={activePage} setActivePage={setActivePage} />
          <main className="flex-1 flex flex-col overflow-hidden">
            <Header
              title={activePage}
              themeMode={themeMode}
              toggleTheme={toggleMode}
              searchQuery={searchQuery}
              onSearchChange={handleSearch}
            />
            <div className="flex-1 p-4 md:p-8 overflow-y-auto">
              {renderPage()}
            </div>
          </main>
        </div>

        {/* AI Assistant - Floating chat on all pages */}
        <AIAssistant
          currentPage={activePage}
          onTaskCreate={handleAddTask}
          onTaskUpdate={handleUpdateTask}
          onTaskDelete={handleDeleteTask}
          onTaskDeleteAll={handleDeleteAllTasks}
          onTaskDeleteCompleted={handleDeleteCompletedTasks}
          onNoteCreate={(note) => {
            const newNote: Note = {
              id: crypto.randomUUID(),
              title: note.title,
              content: note.content,
              lastModified: Date.now(),
            };
            setNotes([newNote, ...notes]);
            return newNote;
          }}
          onEventCreate={handleAddEvent}
          onEventUpdate={handleUpdateEvent}
          onEventDelete={handleDeleteEvent}
          onEventDeleteAll={handleDeleteAllEvents}
          onGoalCreate={handleAddGoal}
          onGoalUpdate={handleUpdateGoal}
          onGoalDelete={handleDeleteGoal}
          onProjectCreate={handleAddProject}
          onProjectUpdate={handleUpdateProject}
          onProjectDelete={handleDeleteProject}
          onWorkspaceCreate={(workspace) => {
            const newWorkspace = handleCreateWorkspace(workspace.name, workspace.description);
            return newWorkspace;
          }}
          onWorkspaceUpdate={handleUpdateWorkspace}
          onWorkspaceDelete={handleDeleteWorkspace}
          onNoteUpdate={(updatedNote) => {
            setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note));
          }}
          onNoteDelete={(noteId) => {
            setNotes(notes.filter(note => note.id !== noteId));
          }}
          tasks={tasks}
          events={events}
          notes={notes}
          goals={goals}
          workspaces={workspaces}
          taskLists={taskLists}
          projects={projects}
          aiVoice={aiVoice}
        />

        {/* Floating Timer - Show only when active and not on Dashboard */}
        {timerIsActive && activePage !== 'Dashboard' && (
          <FloatingTimer
            duration={timerDuration}
            timeRemaining={timerTimeRemaining}
            isActive={timerIsActive}
            onPause={() => setTimerIsActive(false)}
            onResume={() => setTimerIsActive(true)}
            onStop={() => {
              setTimerIsActive(false);
              setTimerTimeRemaining(timerDuration * 60);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default App;