import React, { useState } from 'react';
import { HomeIcon, NoteIcon, HeartIcon, ProjectIcon, CalendarIcon, SettingsIcon, MenuIcon, PlannerIcon, TemplatesIcon, SystemsIcon, HistoryIcon, WorkspaceIcon, ChatIcon, GoalIcon } from './Icons';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

interface NavItemWithCollapse extends NavItemProps {
  collapsed?: boolean;
}

const NavItem: React.FC<NavItemWithCollapse> = ({ icon, label, active, onClick, collapsed = false }) => (
  <li
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    aria-current={active ? 'page' : undefined}
    title={collapsed ? label : undefined}
    className={`relative flex items-center p-3 my-1 rounded-lg cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent ${
      active
        ? 'bg-accent/20 text-accent'
        : 'text-text-secondary hover:bg-black/10 dark:hover:bg-white/10 hover:text-text-primary'
    } ${collapsed ? 'justify-center' : ''}`}
  >
    <div className={`w-6 h-6 ${collapsed ? '' : 'mr-4'}`} aria-hidden="true">{icon}</div>
    {!collapsed && <span className="font-medium">{label}</span>}
    {active && <div className="absolute left-0 w-1 h-8 bg-accent rounded-r-full" aria-hidden="true"></div>}
  </li>
);

interface SidebarProps {
    activePage: string;
    setActivePage: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  const navItems = [
    { id: 'Dashboard', icon: <HomeIcon />, label: 'Dashboard' },
    { id: 'Workspaces', icon: <WorkspaceIcon />, label: 'Workspaces' },
    { id: 'Notes', icon: <NoteIcon />, label: 'Notes' },
    { id: 'Tasks', icon: <HeartIcon />, label: 'Tasks' },
    { id: 'Events', icon: <CalendarIcon />, label: 'Events' },
    { id: 'Projects', icon: <ProjectIcon />, label: 'Projects' },
    { id: 'Goals', icon: <GoalIcon />, label: 'Goals' },
    { id: 'Calendar', icon: <CalendarIcon />, label: 'Calendar' },
    { id: 'Planner', icon: <PlannerIcon />, label: 'Planner' },
    { id: 'Workflows', icon: <TemplatesIcon />, label: 'Workflows' },
    { id: 'Routines', icon: <SystemsIcon />, label: 'Routines' },
    { id: 'Templates', icon: <TemplatesIcon />, label: 'Templates' },
    { id: 'Systems', icon: <SystemsIcon />, label: 'Systems' },
    { id: 'History', icon: <HistoryIcon />, label: 'History' },
    { id: 'Chat History', icon: <ChatIcon />, label: 'Chat History' },
    { id: 'Settings', icon: <SettingsIcon />, label: 'Settings' },
  ];

  const sidebarContent = (collapsed: boolean = false, isMobile: boolean = false) => (
    <div className="flex flex-col h-full bg-sidebar-bg backdrop-blur-2xl p-4 border-r border-sidebar-border overflow-hidden">
      <div className={`flex items-center mb-6 flex-shrink-0 ${collapsed ? 'justify-center' : 'pl-2'}`}>
         {!isMobile && (
           <button
             onClick={toggleCollapse}
             className="p-2 bg-black/10 dark:bg-white/10 rounded-lg hover:bg-black/20 dark:hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
             aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
             title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
           >
             <MenuIcon className="w-6 h-6 text-text-primary"/>
           </button>
         )}
         {!collapsed && <h1 className={`text-2xl font-bold text-text-primary ${!isMobile ? 'ml-3' : ''}`}>Prose</h1>}
      </div>
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto sidebar-scroll">
        <ul role="list" className="space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activePage === item.id}
              collapsed={collapsed}
              onClick={() => {
                setActivePage(item.id)
                setIsOpen(false)
              }}
            />
          ))}
        </ul>
      </nav>
      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .sidebar-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
        }

        .dark .sidebar-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }

        .dark .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }

        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }

        .dark .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Firefox */
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.05);
        }

        .dark .sidebar-scroll {
          scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
        }
      `}</style>
      {!collapsed && (
        <div className="mt-4 p-4 bg-black/5 dark:bg-white/5 rounded-lg text-center flex-shrink-0">
          <p className="text-sm text-text-primary font-medium">Upgrade to Pro</p>
          <p className="text-xs text-text-secondary mt-1">Unlock all features</p>
          <button
            className="mt-3 w-full bg-accent text-white py-2 rounded-lg text-sm font-semibold hover:bg-accent-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Upgrade to Pro plan"
          >
            Upgrade
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-sidebar-bg backdrop-blur-xl rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          <MenuIcon className="w-6 h-6" />
        </button>
        <div
          className={`fixed inset-0 z-40 flex transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="w-72 h-full">
            {sidebarContent(false, true)}
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setIsOpen(false)}></div>
        </div>
      </div>

      {/* Desktop Sidebar - Collapsible */}
      <aside className={`hidden lg:block ${isCollapsed ? 'w-20' : 'w-72'} flex-shrink-0 h-full transition-all duration-300`}>
        {sidebarContent(isCollapsed)}
      </aside>
    </>
  );
};