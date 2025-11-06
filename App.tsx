
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
import { TemplatesPage } from './components/TemplatesPage';
import { SystemsPage } from './components/SystemsPage';
import { HistoryPage } from './components/HistoryPage';
import { WorkspacesPage } from './components/WorkspacesPage';
import { ChatHistoryPage } from './components/ChatHistoryPage';
import { EventsPage } from './components/EventsPage';
import { AIAssistant } from './components/AIAssistant';

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
  dueDate?: string;
  dueTime?: string;
  estimatedTime?: number; // in minutes
  subtasks?: Subtask[];
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
    daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
    endDate?: string; // YYYY-MM-DD
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

  useEffect(() => {
    window.localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    window.localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    window.localStorage.setItem('themeStyle', themeStyle);
  }, [themeStyle]);

  useEffect(() => {
    window.localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

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
      setActivePage('Notes');
    }
  };

  const handleAddTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
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
            onNewNote={handleAddNote}
            onSelectNote={(noteId) => {
                setActiveNoteId(noteId);
                setActivePage('Notes');
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
            themeMode={themeMode}
            toggleTheme={toggleMode}
        />;
      case 'Tasks':
        return <TasksPage
          tasks={tasks}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          themeMode={themeMode}
          toggleTheme={toggleMode}
        />;
      case 'Projects':
        return <ProjectsPage themeMode={themeMode} toggleTheme={toggleMode} />;
      case 'Calendar':
        return <CalendarPage themeMode={themeMode} toggleTheme={toggleMode} />;
      case 'Events':
        return <EventsPage
          events={events}
          onAddEvent={handleAddEvent}
          onUpdateEvent={handleUpdateEvent}
          onDeleteEvent={handleDeleteEvent}
          themeMode={themeMode}
          toggleTheme={toggleMode}
        />;
      case 'Planner':
        return <PlannerPage themeMode={themeMode} toggleTheme={toggleMode} />;
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
        />;
      case 'Settings':
        return <SettingsPage themeStyle={themeStyle} themeMode={themeMode} onThemeStyleChange={changeThemeStyle} onThemeModeChange={changeThemeMode} />;
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

        <div className="flex min-h-screen">
          <Sidebar activePage={activePage} setActivePage={setActivePage} />
          <main className="flex-1 flex flex-col">
            <Header
              title={activePage}
              themeMode={themeMode}
              toggleTheme={toggleMode}
              searchQuery={searchQuery}
              onSearchChange={handleSearch}
            />
            <div className="flex-1 p-4 md:p-8">
              {renderPage()}
            </div>
          </main>
        </div>

        {/* AI Assistant - Floating on all pages */}
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
            setActiveNoteId(newNote.id);
            setActivePage('Notes');
            return newNote;
          }}
          onEventCreate={handleAddEvent}
          tasks={tasks}
        />
      </div>
    </div>
  );
};

export default App;