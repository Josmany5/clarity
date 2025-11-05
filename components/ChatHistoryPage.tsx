import React, { useState, useEffect } from 'react';
import { WidgetCard } from './WidgetCard';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatSession {
  id: string;
  messages: Message[];
  startTime: number;
  lastMessageTime: number;
  preview: string;
}

export const ChatHistoryPage: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Group messages into sessions (conversations separated by 30+ minutes of inactivity)
  const groupIntoSessions = (messages: Message[]): ChatSession[] => {
    if (messages.length === 0) return [];

    const sessions: ChatSession[] = [];
    let currentSession: Message[] = [];
    let sessionStartTime = messages[0].timestamp;

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];

      if (currentSession.length > 0) {
        const timeDiff = msg.timestamp - currentSession[currentSession.length - 1].timestamp;
        const thirtyMinutes = 30 * 60 * 1000;

        if (timeDiff > thirtyMinutes) {
          // Start new session
          sessions.push(createSession(currentSession, sessionStartTime));
          currentSession = [msg];
          sessionStartTime = msg.timestamp;
        } else {
          currentSession.push(msg);
        }
      } else {
        currentSession.push(msg);
      }
    }

    if (currentSession.length > 0) {
      sessions.push(createSession(currentSession, sessionStartTime));
    }

    return sessions.reverse(); // Most recent first
  };

  const createSession = (messages: Message[], startTime: number): ChatSession => {
    const firstUserMessage = messages.find(m => m.role === 'user');
    const preview = firstUserMessage
      ? firstUserMessage.content.slice(0, 60) + (firstUserMessage.content.length > 60 ? '...' : '')
      : 'New conversation';

    return {
      id: `session-${startTime}`,
      messages,
      startTime,
      lastMessageTime: messages[messages.length - 1].timestamp,
      preview
    };
  };

  useEffect(() => {
    const loadSessions = () => {
      try {
        const saved = localStorage.getItem('aiChatHistory');
        if (saved) {
          const messages = JSON.parse(saved);
          setSessions(groupIntoSessions(messages));
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };

    loadSessions();
    const interval = setInterval(loadSessions, 2000);
    return () => clearInterval(interval);
  }, []);

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all chat history?')) {
      localStorage.removeItem('aiChatHistory');
      setSessions([]);
      setSelectedSession(null);
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden">
      {/* Sessions List */}
      <div className="w-80 border-r border-card-border flex flex-col bg-card-bg">
        <div className="p-4 border-b border-card-border">
          <h1 className="text-2xl font-bold text-text-primary mb-3">Chat History</h1>
          <div className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full px-3 py-2 pl-9 bg-card-bg text-text-primary placeholder-text-secondary rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-accent text-sm"
            />
            <svg
              className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={clearHistory}
            className="w-full px-3 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors font-medium text-sm"
          >
            Clear All History
          </button>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto">
          {filteredSessions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-sm text-text-secondary">No conversations yet</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedSession?.id === session.id
                      ? 'bg-accent/20 border border-accent/30'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-1">
                    <span className="text-lg">🤖</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary line-clamp-2 mb-1">
                        {session.preview}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <span>{session.messages.length} messages</span>
                        <span>•</span>
                        <span>{new Date(session.startTime).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat View */}
      <div className="flex-1 flex flex-col bg-bg-secondary">
        {!selectedSession ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💭</div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">Select a conversation</h3>
              <p className="text-text-secondary">Choose a chat from the left to view messages</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-card-border bg-card-bg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-text-primary mb-1">
                    {new Date(selectedSession.startTime).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {selectedSession.messages.length} messages • {new Date(selectedSession.startTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close chat"
                >
                  <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedSession.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex items-start gap-3 max-w-[80%]">
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">🤖</span>
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-accent text-white'
                          : 'bg-card-bg border border-card-border text-text-primary'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className="text-xs mt-1 opacity-60">
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
