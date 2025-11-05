import React, { useState, useEffect } from 'react';
import { WidgetCard } from './WidgetCard';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export const ChatHistoryPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load chat history from localStorage
    try {
      const saved = localStorage.getItem('aiChatHistory');
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }, []);

  // Refresh messages every second to catch updates
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const saved = localStorage.getItem('aiChatHistory');
        if (saved) {
          setMessages(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Failed to refresh chat history:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all chat history?')) {
      localStorage.removeItem('aiChatHistory');
      setMessages([]);
    }
  };

  const filteredMessages = messages.filter(msg =>
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedByDate = filteredMessages.reduce((acc, msg) => {
    const date = new Date(msg.timestamp).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(msg);
    return acc;
  }, {} as Record<string, Message[]>);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Chat History</h1>
        <p className="text-text-secondary">View all your conversations with Wove</p>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full px-4 py-2.5 pl-10 bg-card-bg text-text-primary placeholder-text-secondary rounded-lg border border-card-border focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          />
          <svg
            className="w-5 h-5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button
          onClick={clearHistory}
          className="px-4 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors font-medium"
        >
          Clear History
        </button>
      </div>

      {/* Messages */}
      {messages.length === 0 ? (
        <WidgetCard className="p-12 text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">No chat history yet</h3>
          <p className="text-text-secondary">Your conversations with Wove will appear here</p>
        </WidgetCard>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByDate).map(([date, msgs]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-card-border"></div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                  {date}
                </h3>
                <div className="h-px flex-1 bg-card-border"></div>
              </div>

              <div className="space-y-4">
                {msgs.map((msg, idx) => (
                  <WidgetCard key={idx} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'user'
                          ? 'bg-accent/20 text-accent'
                          : 'bg-purple-500/20 text-purple-500'
                      }`}>
                        {msg.role === 'user' ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        ) : (
                          <span className="text-lg">🤖</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-text-primary">
                            {msg.role === 'user' ? 'You' : 'Wove'}
                          </span>
                          <span className="text-xs text-text-secondary">
                            {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-text-primary whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  </WidgetCard>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredMessages.length === 0 && messages.length > 0 && (
        <WidgetCard className="p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">No results found</h3>
          <p className="text-text-secondary">Try a different search term</p>
        </WidgetCard>
      )}
    </div>
  );
};
