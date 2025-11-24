import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { getAIResponse } from '../services/AIService';
import { ShadowFrame, ShadowFrameProps } from './ShadowFrames/ShadowFrame';
import { parseFrameCommands, FrameCommand, createTaskListFrame, createProjectFrame, createCalendarFrame, createNotesFrame } from './ShadowFrames/FrameParser';

interface AICanvasPageProps {
  theme: string;
  tasks?: any[];
  notes?: any[];
  events?: any[];
  goals?: any[];
  projects?: any[];
  workspaces?: any[];
  taskLists?: any[];
  // Mode controlled by App
  mode: 'DO' | 'REVIEW' | 'PLAN';
  onModeChange: (mode: 'DO' | 'REVIEW' | 'PLAN') => void;
  // Callback to expose insertFrame function to parent
  onInsertFrameReady: (insertFn: (frameType: 'task-list' | 'project-card' | 'calendar' | 'notes', filterType?: 'today' | 'tomorrow' | 'week') => void) => void;
}

interface ContentItem {
  id: string;
  type: 'user-message' | 'ai-message' | 'frame';
  content?: string;
  frame?: FrameCommand;
  timestamp: number;
}

export const AICanvasPage: React.FC<AICanvasPageProps> = ({
  theme,
  tasks = [],
  notes = [],
  events = [],
  goals = [],
  projects = [],
  workspaces = [],
  taskLists = [],
  mode,
  onModeChange,
  onInsertFrameReady
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';

  // Helper to filter tasks/events by time
  const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  };

  const getThisWeek = () => {
    const today = getToday();
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 7);
    return { start: today, end: weekEnd };
  };

  // Insert frame directly without AI - adds to bottom of content
  const insertFrame = (frameType: 'task-list' | 'project-card' | 'calendar' | 'notes', filterType?: 'today' | 'tomorrow' | 'week') => {
    let frameCommand = '';
    let filteredData: any;

    switch (frameType) {
      case 'task-list':
        if (filterType === 'today') {
          const today = getToday();
          filteredData = tasks.filter(t => {
            if (!t.dueDate) return false;
            const dueDate = new Date(t.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate.getTime() === today.getTime();
          });
        } else if (filterType === 'tomorrow') {
          const tomorrow = getTomorrow();
          filteredData = tasks.filter(t => {
            if (!t.dueDate) return false;
            const dueDate = new Date(t.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate.getTime() === tomorrow.getTime();
          });
        } else if (filterType === 'week') {
          const { start, end } = getThisWeek();
          filteredData = tasks.filter(t => {
            if (!t.dueDate) return false;
            const dueDate = new Date(t.dueDate);
            return dueDate >= start && dueDate <= end;
          });
        } else {
          filteredData = tasks;
        }
        frameCommand = createTaskListFrame(filteredData);
        break;
      case 'project-card':
        // Pass all projects to create a single frame with all projects
        frameCommand = createProjectFrame(projects.length > 0 ? projects : []);
        break;
      case 'calendar':
        if (filterType === 'today') {
          const today = getToday();
          filteredData = events.filter(e => {
            const eventDate = new Date(e.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() === today.getTime();
          });
        } else if (filterType === 'week') {
          const { start, end } = getThisWeek();
          filteredData = events.filter(e => {
            const eventDate = new Date(e.date);
            return eventDate >= start && eventDate <= end;
          });
        } else {
          filteredData = events;
        }
        frameCommand = createCalendarFrame(filteredData);
        break;
      case 'notes':
        frameCommand = createNotesFrame(notes);
        break;
    }

    // Parse the frame command
    const { frames } = parseFrameCommands(frameCommand);

    if (frames.length > 0) {
      // Add frame to content items (at the end)
      const newItems: ContentItem[] = frames.map(frame => ({
        id: `content-${Date.now()}-${Math.random()}`,
        type: 'frame',
        frame,
        timestamp: Date.now()
      }));

      setContentItems(prev => [...prev, ...newItems]);
    }
  };

  // Expose insertFrame function to parent on mount
  useEffect(() => {
    onInsertFrameReady(insertFrame);
  }, []);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);

    // Add user message to content
    const userMessageItem: ContentItem = {
      id: `content-${Date.now()}-user`,
      type: 'user-message',
      content: message,
      timestamp: Date.now()
    };
    setContentItems(prev => [...prev, userMessageItem]);

    try {
      // Trim conversation history to last 10 messages
      const trimmedHistory = conversationHistory.slice(-10);

      // Get AI response with full app context
      const response = await getAIResponse(
        message,
        'Canvas',
        trimmedHistory,
        {
          tasks,
          goals,
          projects,
          notes,
          events,
          workspaces,
          taskLists
        }
      );

      // Update conversation history
      const newHistory = [
        ...conversationHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: response }
      ];
      setConversationHistory(newHistory);

      // Add AI response to content
      const aiMessageItem: ContentItem = {
        id: `content-${Date.now()}-ai`,
        type: 'ai-message',
        content: response,
        timestamp: Date.now()
      };
      setContentItems(prev => [...prev, aiMessageItem]);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorItem: ContentItem = {
        id: `content-${Date.now()}-error`,
        type: 'ai-message',
        content: 'Error: ' + errorMessage,
        timestamp: Date.now()
      };
      setContentItems(prev => [...prev, errorItem]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFrame = (contentId: string) => {
    setContentItems(prev => prev.filter(item => item.id !== contentId));
  };

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto p-4 md:p-8 -m-4 md:-m-8"
    >
      {/* Render all content items in chronological order */}
      {contentItems.map((item) => {
        if (item.type === 'frame' && item.frame) {
          return (
            <div key={item.id} className="mb-4">
              <ShadowFrame
                id={item.frame.id}
                type={item.frame.type}
                data={item.frame.data}
                theme={theme}
                onClose={() => handleRemoveFrame(item.id)}
              />
            </div>
          );
        } else if (item.type === 'user-message') {
          return (
            <div key={item.id} className="mb-3">
              <span className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                You:
              </span>
              <span className={`ml-2 text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {item.content}
              </span>
            </div>
          );
        } else if (item.type === 'ai-message') {
          return (
            <div key={item.id} className={`mb-4 p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className={`text-sm font-semibold mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                AI:
              </div>
              <div className="whitespace-pre-wrap text-sm">{item.content}</div>
            </div>
          );
        }
        return null;
      })}

      {/* Contenteditable area - type here, use /ai for AI messages */}
      <div
        ref={editorRef}
        id="canvas-editor"
        contentEditable
        suppressContentEditableWarning
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const editor = e.currentTarget;
            const text = editor.textContent || '';

            // Check if text starts with /ai or /ask
            if (text.trim().startsWith('/ai ')) {
              e.preventDefault();
              const message = text.trim().substring(4); // Remove '/ai '
              if (message) {
                handleSendMessage(message);
                editor.textContent = '';
              }
            } else if (text.trim().startsWith('/ask ')) {
              e.preventDefault();
              const message = text.trim().substring(5); // Remove '/ask '
              if (message) {
                handleSendMessage(message);
                editor.textContent = '';
              }
            }
            // Otherwise, Enter just creates a new line (normal typing)
          }
        }}
        className={`min-h-[200px] outline-none text-base leading-relaxed cursor-text mt-4 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}
        style={{ wordBreak: 'break-word' }}
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed bottom-8 right-8 px-4 py-2 bg-accent-primary text-white rounded-lg shadow-lg text-sm animate-pulse">
          AI is thinking...
        </div>
      )}
    </div>
  );
};
