import React, { useState, useRef, useEffect } from 'react';
import { WidgetCard } from './WidgetCard';
import {
  askGemini,
  speak,
  stopSpeaking,
  startBrowserListening,
  getAIResponse,
  parseTaskCommand
} from '../services/AIService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AIAssistantProps {
  currentPage: string;
  onTaskCreate?: (task: any) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ currentPage, onTaskCreate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load messages from localStorage on init
    try {
      const saved = localStorage.getItem('aiChatHistory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('aiChatHistory', JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get AI response with conversation history
      const response = await getAIResponse(input, currentPage, messages);

      // Check if AI wants to create tasks (JSON format)
      const jsonMatch = response.match(/TASKS_JSON:\s*(\[[\s\S]*?\])/);

      if (jsonMatch && onTaskCreate) {
        try {
          const tasksArray = JSON.parse(jsonMatch[1]);
          // Create each task
          for (const taskData of tasksArray) {
            onTaskCreate({
              ...taskData,
              createdAt: Date.now(),
              completed: false,
              tags: taskData.tags || []
            });
          }
        } catch (error) {
          console.error('Failed to parse tasks JSON:', error);
        }
      }

      // Remove TASKS_JSON line from the display message
      const displayMessage = response.replace(/TASKS_JSON:\s*\[[\s\S]*?\]\n?/, '').trim();

      const assistantMessage: Message = {
        role: 'assistant',
        content: displayMessage || response,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Auto-speak disabled to prevent browser crashes
      // User can enable voice in Settings if needed
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: error.message.includes('API key')
          ? 'Please configure your API keys in Settings to use AI features.'
          : 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = startBrowserListening(
      (text) => {
        setInput(text);
        setIsListening(false);
      },
      (error) => {
        console.error('Speech recognition error:', error);
        setIsListening(false);
      }
    );

    if (recognition) {
      recognitionRef.current = recognition;
      setIsListening(true);
    }
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-accent text-white rounded-full shadow-2xl hover:scale-110 transition-transform duration-200 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-accent/50"
        aria-label="Open AI Assistant"
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    );
  }

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isMinimized
          ? 'bottom-6 right-6 w-80'
          : 'bottom-6 right-6 w-80 h-[500px]'
      }`}
    >
      <WidgetCard className="flex flex-col h-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-card-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
              <span className="text-white text-xl">🤖</span>
            </div>
            <div>
              <h3 className="font-bold text-text-primary">AI Assistant</h3>
              <p className="text-xs text-text-secondary">Powered by Gemini 2.5 Flash</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMessages([])}
              className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
              aria-label="New chat"
              title="New chat"
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
              aria-label={isMinimized ? 'Maximize' : 'Minimize'}
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMinimized ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                )}
              </svg>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-text-secondary py-12">
                  <div className="text-6xl mb-4">👋</div>
                  <p className="font-semibold text-text-primary mb-2">Hey there!</p>
                  <p className="text-sm">Ask me anything about your tasks, or say:</p>
                  <div className="mt-4 space-y-2 text-sm">
                    <p className="italic">"Create task: Buy groceries tomorrow"</p>
                    <p className="italic">"What did I accomplish this week?"</p>
                    <p className="italic">"Show my urgent tasks"</p>
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-accent text-white'
                        : 'bg-black/5 dark:bg-white/5 text-text-primary'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs mt-1 opacity-60">
                      {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-black/5 dark:bg-white/5 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-card-border">
              <div className="flex items-center gap-2">
                <button
                  onClick={startListening}
                  disabled={isLoading}
                  className={`p-3 rounded-full transition-all ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-black/10 dark:bg-white/10 text-text-primary hover:bg-black/20 dark:hover:bg-white/20'
                  } disabled:opacity-50`}
                  aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                  title={isListening ? 'Listening...' : 'Voice input'}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isListening ? 'Listening...' : 'Ask me anything...'}
                  disabled={isLoading || isListening}
                  className="flex-1 bg-black/5 dark:bg-white/5 text-text-primary placeholder-text-secondary rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent transition-all disabled:opacity-50"
                />

                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-accent text-white rounded-full hover:bg-accent-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>

              <p className="text-xs text-text-secondary mt-2 text-center">
                {isListening ? 'Speak now...' : 'Type or use voice input'}
              </p>
            </div>
          </>
        )}
      </WidgetCard>
    </div>
  );
};
