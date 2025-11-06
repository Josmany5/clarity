import React, { useState, useEffect } from 'react';
import type { Note } from '../App';
import { NoteIcon, SunIcon, MoonIcon } from './Icons';
import { RichTextEditor } from './RichTextEditor';

interface NotesPageProps {
  notes: Note[];
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onAddNote: () => void;
  searchQuery?: string;
  themeMode: 'light' | 'dark';
  toggleTheme: () => void;
}

export const NotesPage: React.FC<NotesPageProps> = ({
  notes,
  activeNoteId,
  setActiveNoteId,
  onUpdateNote,
  onDeleteNote,
  onAddNote,
  searchQuery = '',
  themeMode,
  toggleTheme
}) => {
  // Local state for editing
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const activeNote = notes.find((note) => note.id === activeNoteId);

  // Update local state when active note changes
  useEffect(() => {
    if (activeNote) {
      setEditTitle(activeNote.title);
      setEditContent(activeNote.content);
    }
  }, [activeNote?.id]);

  // Filter notes based on search query
  const filteredNotes = searchQuery.trim()
    ? notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notes;

  const handleTitleChange = (value: string) => {
    setEditTitle(value);
    if (activeNote) {
      onUpdateNote({ ...activeNote, title: value });
    }
  };

  const handleContentChange = (value: string) => {
    setEditContent(value);
    if (activeNote) {
      onUpdateNote({ ...activeNote, content: value });
    }
  };

  const handleDelete = () => {
    if (activeNote && window.confirm(`Delete "${activeNote.title}"? This cannot be undone.`)) {
      onDeleteNote(activeNote.id);
      setEditTitle('');
      setEditContent('');
    }
  };

  const handleSelectNote = (noteId: string) => {
    setActiveNoteId(noteId);
    setShowSidebar(false); // Hide sidebar on mobile when note is selected
  };

  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="flex h-full gap-0 relative max-w-screen-2xl mx-auto">
      {/* Toggle Button - Mobile Only */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="md:hidden fixed bottom-6 left-6 z-50 w-14 h-14 bg-accent text-white rounded-full shadow-2xl flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-accent/50"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showSidebar ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Notes List Sidebar */}
      <div className={`w-full md:w-80 flex-shrink-0 flex flex-col bg-sidebar-bg backdrop-blur-2xl md:rounded-l-2xl border-r border-sidebar-border ${showSidebar ? 'absolute inset-0 z-40' : 'hidden md:flex'}`}>
        <div className="p-4 border-b border-sidebar-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-text-primary">
            {searchQuery ? `Results` : 'Notes'}
          </h2>
          <button
            onClick={onAddNote}
            className="p-2 rounded-lg bg-accent hover:bg-accent-secondary text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Add new note"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredNotes.length > 0 ? (
            <div className="divide-y divide-sidebar-border">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    note.id === activeNoteId
                      ? 'bg-accent/20 border-l-4 border-accent'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 border-l-4 border-transparent'
                  }`}
                >
                  <h3 className="font-semibold text-text-primary truncate mb-1">
                    {note.title || 'Untitled'}
                  </h3>
                  <p className="text-sm text-text-secondary truncate">
                    {note.content
                      ? note.content.replace(/<[^>]*>/g, '').replace(/#{1,6}\s/g, '').replace(/\*\*/g, '').replace(/\*/g, '').replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').slice(0, 100)
                      : 'No content'}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {new Date(note.lastModified).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <NoteIcon className="w-12 h-12 text-text-secondary mx-auto mb-2 opacity-50" />
              <p className="text-text-secondary">
                {searchQuery ? `No notes found for "${searchQuery}"` : 'No notes yet'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Note Editor */}
      <div className="flex-1 flex flex-col bg-card-bg backdrop-blur-xl rounded-r-2xl">
        {activeNote ? (
          <>
            {/* Editor Header */}
            <div className="p-4 border-b border-card-border flex items-center justify-between gap-4">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="flex-1 text-2xl font-bold bg-transparent text-text-primary placeholder-text-secondary focus:outline-none py-2"
                placeholder="Note Title"
                aria-label="Note title"
              />
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-red-500 hover:text-white hover:bg-red-500 font-semibold text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Delete note"
              >
                Delete
              </button>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-hidden">
              <RichTextEditor
                content={editContent}
                onChange={handleContentChange}
                placeholder="Start writing your note..."
              />
            </div>

            {/* Editor Footer */}
            <div className="p-4 border-t border-card-border text-xs text-text-secondary">
              Last modified: {new Date(activeNote.lastModified).toLocaleString()}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <NoteIcon className="w-20 h-20 text-accent mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-2">No Note Selected</h2>
            <p className="text-text-secondary mb-6">
              Select a note from the list or create a new one
            </p>
            <button
              onClick={onAddNote}
              className="px-6 py-3 bg-accent hover:bg-accent-secondary text-white rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            >
              Create New Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
