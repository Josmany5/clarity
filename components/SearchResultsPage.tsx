import React from 'react';
import type { Note, Task, Event, Workspace } from '../App';
import { WidgetCard } from './WidgetCard';
import { parseLocalDate } from '../utils/dateUtils';

interface SearchResultsPageProps {
  searchQuery: string;
  notes: Note[];
  tasks: Task[];
  events: Event[];
  workspaces: Workspace[];
  onSelectNote: (id: string) => void;
  onSelectTask?: (id: string) => void;
  onSelectEvent?: (id: string) => void;
  onSelectWorkspace?: (id: string) => void;
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  searchQuery,
  notes,
  tasks,
  events,
  workspaces,
  onSelectNote,
  onSelectTask,
  onSelectEvent,
  onSelectWorkspace,
}) => {
  const query = searchQuery.toLowerCase().trim();

  const filteredNotes = query
    ? notes.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
      )
    : [];

  const filteredTasks = query
    ? tasks.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      )
    : [];

  const filteredEvents = query
    ? events.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query)
      )
    : [];

  const filteredWorkspaces = query
    ? workspaces.filter(workspace =>
        workspace.name.toLowerCase().includes(query) ||
        workspace.description?.toLowerCase().includes(query)
      )
    : [];

  const totalResults = filteredNotes.length + filteredTasks.length + filteredEvents.length + filteredWorkspaces.length;

  const stripHtml = (html: string) => {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-accent/30 text-text-primary font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex flex-col space-y-4 md:space-y-6 px-4 md:px-4 lg:px-8 pb-6 max-w-screen-2xl mx-auto">
      <WidgetCard>
        <div className="p-4 md:p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
            Search Results
          </h1>
          <p className="text-text-secondary">
            {totalResults > 0 ? (
              <>Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{searchQuery}"</>
            ) : (
              <>No results found for "{searchQuery}"</>
            )}
          </p>
        </div>
      </WidgetCard>

      {/* Notes Results */}
      {filteredNotes.length > 0 && (
        <WidgetCard>
          <div className="p-4 md:p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              📝 Notes ({filteredNotes.length})
            </h2>
            <div className="space-y-3">
              {filteredNotes.map(note => (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note.id)}
                  className="p-4 bg-black/5 dark:bg-white/5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-colors border border-transparent hover:border-accent"
                >
                  <h3 className="font-semibold text-text-primary mb-1">
                    {highlightText(note.title || 'Untitled', query)}
                  </h3>
                  <p className="text-sm text-text-secondary line-clamp-2">
                    {highlightText(stripHtml(note.content).slice(0, 200), query)}
                  </p>
                  <p className="text-xs text-text-secondary mt-2">
                    Last modified: {new Date(note.lastModified).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </WidgetCard>
      )}

      {/* Tasks Results */}
      {filteredTasks.length > 0 && (
        <WidgetCard>
          <div className="p-4 md:p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              ✓ Tasks ({filteredTasks.length})
            </h2>
            <div className="space-y-3">
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => onSelectTask?.(task.id)}
                  className="p-4 bg-black/5 dark:bg-white/5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-colors border border-transparent hover:border-accent"
                >
                  <div className="flex items-start gap-3">
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${
                      task.urgent && task.important
                        ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                        : task.urgent
                        ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
                        : task.important
                        ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                        : 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
                    }`}>
                      {task.urgent && task.important ? 'Urgent & Important' : task.urgent ? 'Urgent' : task.important ? 'Important' : 'Normal'}
                    </div>
                    {task.completed && (
                      <div className="px-2 py-1 rounded text-xs font-semibold bg-green-500/20 text-green-600 dark:text-green-400">
                        Completed
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-text-primary mt-2">
                    {highlightText(task.title, query)}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                      {highlightText(task.description, query)}
                    </p>
                  )}
                  {(task.dueDate || task.dueTime) && (
                    <p className="text-xs text-text-secondary mt-2">
                      Due: {task.dueDate && parseLocalDate(task.dueDate).toLocaleDateString()} {task.dueTime}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </WidgetCard>
      )}

      {/* Events Results */}
      {filteredEvents.length > 0 && (
        <WidgetCard>
          <div className="p-4 md:p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              📅 Events ({filteredEvents.length})
            </h2>
            <div className="space-y-3">
              {filteredEvents.map(event => (
                <div
                  key={event.id}
                  onClick={() => onSelectEvent?.(event.id)}
                  className="p-4 bg-black/5 dark:bg-white/5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-colors border border-transparent hover:border-accent"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: event.color || '#3b82f6' }}
                    />
                    <h3 className="font-semibold text-text-primary">
                      {highlightText(event.title, query)}
                    </h3>
                  </div>
                  {event.description && (
                    <p className="text-sm text-text-secondary mb-2 line-clamp-2">
                      {highlightText(event.description, query)}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs text-text-secondary">
                    {event.startDate && (
                      <span>
                        {parseLocalDate(event.startDate).toLocaleDateString()}
                        {event.startTime && ` ${event.startTime}`}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1">
                        📍 {highlightText(event.location, query)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </WidgetCard>
      )}

      {/* Workspaces Results */}
      {filteredWorkspaces.length > 0 && (
        <WidgetCard>
          <div className="p-4 md:p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              🗺️ Workspaces ({filteredWorkspaces.length})
            </h2>
            <div className="space-y-3">
              {filteredWorkspaces.map(workspace => (
                <div
                  key={workspace.id}
                  onClick={() => onSelectWorkspace?.(workspace.id)}
                  className="p-4 bg-black/5 dark:bg-white/5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-colors border border-transparent hover:border-accent"
                >
                  <h3 className="font-semibold text-text-primary mb-1">
                    {highlightText(workspace.name, query)}
                  </h3>
                  {workspace.description && (
                    <p className="text-sm text-text-secondary mb-2">
                      {highlightText(workspace.description, query)}
                    </p>
                  )}
                  <p className="text-xs text-text-secondary">
                    {workspace.entities.length} item{workspace.entities.length !== 1 ? 's' : ''} • {workspace.viewMode} view
                  </p>
                </div>
              ))}
            </div>
          </div>
        </WidgetCard>
      )}

      {totalResults === 0 && query && (
        <WidgetCard>
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-text-primary mb-2">No results found</h3>
            <p className="text-text-secondary">
              Try searching with different keywords or check your spelling
            </p>
          </div>
        </WidgetCard>
      )}
    </div>
  );
};
