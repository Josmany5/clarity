import React, { useState, useRef, useEffect } from 'react';
import { WidgetCard } from './WidgetCard';
import {
  askGemini,
  speak,
  stopSpeaking,
  startBrowserListening,
  getAIResponse,
  parseTaskCommand,
  unlockAudio
} from '../services/AIService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AIAssistantProps {
  currentPage: string;
  onTaskCreate?: (task: any) => void;
  onTaskUpdate?: (task: any) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskDeleteAll?: () => void;
  onTaskDeleteCompleted?: () => void;
  onNoteCreate?: (note: { title: string; content: string }) => any;
  onEventCreate?: (event: any) => void;
  onEventUpdate?: (event: any) => void;
  onEventDelete?: (eventId: string) => void;
  tasks?: any[];
  events?: any[];
  notes?: any[];
  goals?: any[];
  workspaces?: any[];
  taskLists?: any[];
  projects?: any[];
  aiVoice?: 'female' | 'male';
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ currentPage, onTaskCreate, onTaskUpdate, onTaskDelete, onTaskDeleteAll, onTaskDeleteCompleted, onNoteCreate, onEventCreate, onEventUpdate, onEventDelete, tasks = [], events = [], notes = [], goals = [], workspaces = [], taskLists = [], projects = [], aiVoice = 'female' }) => {
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
  const [voiceMode, setVoiceMode] = useState(false); // Continuous voice conversation mode
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceModeRef = useRef(false); // Ref to track voiceMode immediately (no async delay)

  // Robust JSON extraction function that handles nested braces and code blocks
  const extractJSON = (text: string, prefix: string): string | null => {
    // Remove code block wrappers if present
    let cleanText = text.replace(/```(?:json|tool_code)?\n?/g, '').replace(/```/g, '');

    const startIndex = cleanText.indexOf(prefix);
    if (startIndex === -1) return null;

    const jsonStart = cleanText.indexOf('{', startIndex);
    if (jsonStart === -1) return null;

    let braceCount = 0;
    let inString = false;
    let escaped = false;

    for (let i = jsonStart; i < cleanText.length; i++) {
      const char = cleanText[i];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === '{') braceCount++;
        if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            return text.substring(jsonStart, i + 1);
          }
        }
      }
    }

    return null;
  };

  // Robust JSON array extraction function that handles nested brackets and code blocks
  const extractJSONArray = (text: string, prefix: string): string | null => {
    // Remove code block wrappers if present
    let cleanText = text.replace(/```(?:json|tool_code)?\n?/g, '').replace(/```/g, '');

    const startIndex = cleanText.indexOf(prefix);
    if (startIndex === -1) return null;

    const jsonStart = cleanText.indexOf('[', startIndex);
    if (jsonStart === -1) return null;

    let bracketCount = 0;
    let inString = false;
    let escaped = false;

    for (let i = jsonStart; i < cleanText.length; i++) {
      const char = cleanText[i];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === '[') bracketCount++;
        if (char === ']') {
          bracketCount--;
          if (bracketCount === 0) {
            return cleanText.substring(jsonStart, i + 1);
          }
        }
      }
    }

    return null;
  };

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('aiChatHistory', JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-scroll to bottom when chat opens
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      // Use setTimeout to ensure DOM is rendered
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
      }, 100);
    }
  }, [isOpen, messages.length]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Check file type
    const allowedTypes = ['text/plain', 'text/csv', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only .txt, .csv, .pdf, and .doc/.docx files are supported');
      return;
    }

    setAttachedFile(file);

    // Read file content
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      setFileContent(content);
    };

    if (file.type === 'text/plain' || file.type === 'text/csv') {
      reader.readAsText(file);
    } else {
      // For PDF and DOC files, just store the file for now
      // In production, you'd send this to a backend for processing
      setFileContent(`[${file.name} - ${(file.size / 1024).toFixed(2)}KB]`);
    }
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    setFileContent('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if ((!textToSend && !attachedFile) || isLoading) return;

    // Build user message with file content if attached
    let userContent = textToSend;
    if (attachedFile && fileContent) {
      userContent += `\n\n[Attached file: ${attachedFile.name}]\n${fileContent}`;
    }

    const userMessage: Message = {
      role: 'user',
      content: attachedFile ? `${textToSend}\n📎 ${attachedFile.name}` : textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    const currentFileContent = fileContent;
    const currentFileName = attachedFile?.name || '';
    removeAttachment(); // Clear attachment after sending
    setIsLoading(true);

    let displayMessage = ''; // Declare outside try block for TTS access
    let response = ''; // Declare outside try block for TTS access

    try {
      // Build prompt with file content
      let prompt = textToSend;
      if (currentFileContent) {
        prompt += `\n\nI've attached a file (${currentFileName}) with the following content:\n\n${currentFileContent}\n\nPlease analyze this and help me with my request.`;
      }

      // Get AI response with conversation history AND app context
      response = await getAIResponse(
        prompt,
        currentPage,
        messages,
        {
          tasks: tasks || [],
          notes: notes || [],
          events: events || [],
          goals: goals || [],
          workspaces: workspaces || [],
          taskLists: taskLists || [],
          projects: projects || [],
        }
      );

      // Debug: Log raw response to see what Gemini is actually sending
      console.log('🔍 RAW GEMINI RESPONSE:', response);
      console.log('🔍 RAW RESPONSE LENGTH:', response.length);

      // Check for task creation using robust extraction
      const tasksJSON = extractJSONArray(response, 'TASKS_JSON:');
      if (tasksJSON && onTaskCreate) {
        try {
          const tasksArray = JSON.parse(tasksJSON);
          for (const taskData of tasksArray) {
            const subtasks = taskData.subtasks?.map((st: any) => ({
              id: crypto.randomUUID(),
              title: typeof st === 'string' ? st : st.title,
              completed: false,
            }));
            onTaskCreate({
              ...taskData,
              subtasks,
              createdAt: Date.now(),
              completed: false,
              tags: taskData.tags || []
            });
          }
        } catch (error) {
          console.error('Failed to parse tasks JSON:', error);
        }
      }

      // Check for note creation - simple extraction between markers
      const noteMatch = response.match(/<<<NOTE_START>>>\s*([\s\S]*?)\s*<<<NOTE_END>>>/);
      if (noteMatch && onNoteCreate) {
        try {
          const noteJSON = noteMatch[1].trim();
          const noteData = JSON.parse(noteJSON);
          console.log('📝 Creating note:', noteData);
          onNoteCreate({
            title: noteData.title,
            content: noteData.content  // Content already has real newlines
          });
        } catch (error) {
          console.error('Failed to parse note JSON:', error);
          console.error('Raw JSON string:', noteMatch[1]);
        }
      }

      // Check for event creation using robust extraction
      const eventsJSON = extractJSONArray(response, 'EVENTS_JSON:');
      if (eventsJSON && onEventCreate) {
        try {
          console.log('📅 Event JSON found:', eventsJSON);
          const eventsArray = JSON.parse(eventsJSON);
          console.log('📅 Parsed events:', eventsArray);
          for (const eventData of eventsArray) {
            // Add default color if missing
            if (!eventData.color) {
              eventData.color = '#3b82f6';
            }
            console.log('📅 Creating event:', eventData);
            onEventCreate(eventData);
          }
        } catch (error) {
          console.error('❌ Failed to parse events JSON:', error);
          console.error('Raw JSON string:', eventsJSON);
        }
      } else {
        if (!onEventCreate) {
          console.warn('⚠️ Event creation handler not provided');
        }
        if (!eventsJSON) {
          console.log('ℹ️ No EVENTS_JSON found in response');
        }
      }

      // Check for event update using robust extraction
      const eventUpdateJSON = extractJSON(response, 'EVENT_UPDATE_JSON:');
      if (eventUpdateJSON && onEventUpdate && events) {
        try {
          const updateData = JSON.parse(eventUpdateJSON);
          console.log('📅 Event update request:', updateData);
          console.log('📋 Available events:', events.map(e => e.title));

          // Try to find the event - be more flexible with matching
          const searchTerm = updateData.eventTitle.toLowerCase();
          const eventToUpdate = events.find(e => {
            const title = e.title.toLowerCase();
            return title.includes(searchTerm) || searchTerm.includes(title);
          });

          if (eventToUpdate) {
            console.log('✅ Found event to update:', eventToUpdate.title);

            console.log('🔄 Applying updates:', updateData.updates);
            onEventUpdate({
              ...eventToUpdate,
              ...updateData.updates
            });
          } else {
            console.warn('❌ Could not find event matching:', updateData.eventTitle);
          }
        } catch (error) {
          console.error('Failed to parse event update JSON:', error);
          console.error('Raw JSON string:', eventUpdateJSON);
        }
      }

      // Check for event deletion using robust extraction
      const eventDeleteJSON = extractJSON(response, 'EVENT_DELETE_JSON:');
      if (eventDeleteJSON && onEventDelete && events) {
        try {
          const deleteData = JSON.parse(eventDeleteJSON);
          console.log('🗑️ Event deletion request:', deleteData);
          console.log('📋 Available events:', events.map(e => e.title));

          // Try to find the event - be more flexible with matching
          const searchTerm = deleteData.eventTitle.toLowerCase();
          const eventToDelete = events.find(e => {
            const title = e.title.toLowerCase();
            return title.includes(searchTerm) || searchTerm.includes(title);
          });

          if (eventToDelete) {
            console.log('✅ Found event to delete:', eventToDelete.title);
            onEventDelete(eventToDelete.id);
          } else {
            console.warn('❌ Could not find event matching:', deleteData.eventTitle);
          }
        } catch (error) {
          console.error('Failed to parse event delete JSON:', error);
          console.error('Raw JSON string:', eventDeleteJSON);
        }
      }

      // Check for task update using robust extraction
      const updateJSON = extractJSON(response, 'TASK_UPDATE_JSON:');
      if (updateJSON && onTaskUpdate && tasks) {
        try {
          const updateData = JSON.parse(updateJSON);
          console.log('📝 Task update request:', updateData);
          console.log('📋 Available tasks:', tasks.map(t => t.title));

          // Try to find the task - be more flexible with matching
          const searchTerm = updateData.taskTitle.toLowerCase();
          const taskToUpdate = tasks.find(t => {
            const title = t.title.toLowerCase();
            return title.includes(searchTerm) || searchTerm.includes(title);
          });

          if (taskToUpdate) {
            console.log('✅ Found task to update:', taskToUpdate.title);
            const updates: any = { ...updateData.updates };

            // Handle adding subtasks
            if (updates.addSubtasks) {
              updates.subtasks = [
                ...(taskToUpdate.subtasks || []),
                ...updates.addSubtasks.map((st: any) => ({
                  id: crypto.randomUUID(),
                  title: typeof st === 'string' ? st : st.title,
                  completed: false,
                }))
              ];
              delete updates.addSubtasks;
            }

            console.log('🔄 Applying updates:', updates);
            onTaskUpdate({
              ...taskToUpdate,
              ...updates
            });
          } else {
            console.warn('❌ Could not find task matching:', updateData.taskTitle);
          }
        } catch (error) {
          console.error('Failed to parse task update JSON:', error);
          console.error('Raw JSON string:', updateJSON);
        }
      }

      // Check for task deletion using robust extraction
      const deleteJSON = extractJSON(response, 'TASK_DELETE_JSON:');
      if (deleteJSON && onTaskDelete && tasks) {
        try {
          const deleteData = JSON.parse(deleteJSON);
          console.log('🗑️ Task deletion request:', deleteData);
          console.log('📋 Available tasks:', tasks.map(t => t.title));

          // Try to find the task - be more flexible with matching
          const searchTerm = deleteData.taskTitle.toLowerCase();
          const taskToDelete = tasks.find(t => {
            const title = t.title.toLowerCase();
            return title.includes(searchTerm) || searchTerm.includes(title);
          });

          if (taskToDelete) {
            console.log('✅ Found task to delete:', taskToDelete.title);
            onTaskDelete(taskToDelete.id);
          } else {
            console.warn('❌ Could not find task matching:', deleteData.taskTitle);
          }
        } catch (error) {
          console.error('Failed to parse task deletion JSON:', error);
          console.error('Raw JSON string:', deleteJSON);
        }
      }

      // Check for delete all tasks
      const deleteAllJSON = extractJSON(response, 'TASK_DELETE_ALL_JSON:');
      if (deleteAllJSON && onTaskDeleteAll) {
        try {
          const deleteAllData = JSON.parse(deleteAllJSON);
          if (deleteAllData.confirm) {
            console.log('🗑️ Deleting all tasks');
            onTaskDeleteAll();
          }
        } catch (error) {
          console.error('Failed to parse delete all JSON:', error);
        }
      }

      // Check for delete completed tasks
      const deleteCompletedJSON = extractJSON(response, 'TASK_DELETE_COMPLETED_JSON:');
      if (deleteCompletedJSON && onTaskDeleteCompleted) {
        try {
          const deleteCompletedData = JSON.parse(deleteCompletedJSON);
          if (deleteCompletedData.confirm) {
            console.log('🗑️ Deleting completed tasks');
            onTaskDeleteCompleted();
          }
        } catch (error) {
          console.error('Failed to parse delete completed JSON:', error);
        }
      }

      // Remove action blocks from display message - keep only conversational text
      displayMessage = response;

      // Remove task creation JSON - use exact extracted string
      if (tasksJSON) {
        const taskMarker = 'TASKS_JSON:';
        const startIdx = displayMessage.indexOf(taskMarker);
        if (startIdx !== -1) {
          const endIdx = startIdx + taskMarker.length + tasksJSON.length;
          displayMessage = displayMessage.slice(0, startIdx) + displayMessage.slice(endIdx);
        }
      }

      // Remove note creation block (everything between markers)
      if (noteMatch) {
        displayMessage = displayMessage.replace(/<<<NOTE_START>>>[\s\S]*?<<<NOTE_END>>>\n*/g, '');
      }

      // Remove event creation JSON - use exact extracted string
      if (eventsJSON) {
        const eventMarker = 'EVENTS_JSON:';
        const startIdx = displayMessage.indexOf(eventMarker);
        if (startIdx !== -1) {
          const endIdx = startIdx + eventMarker.length + eventsJSON.length;
          displayMessage = displayMessage.slice(0, startIdx) + displayMessage.slice(endIdx);
        }
      }

      // Remove event update JSON
      if (eventUpdateJSON) {
        displayMessage = displayMessage.replace(/EVENT_UPDATE_JSON:\s*\{[\s\S]*?\}\n?/g, '');
      }

      // Remove task update JSON
      if (updateJSON) {
        displayMessage = displayMessage.replace(/TASK_UPDATE_JSON:\s*\{[\s\S]*?\}\n?/g, '');
      }

      // Remove task deletion JSON
      if (deleteJSON) {
        displayMessage = displayMessage.replace(/TASK_DELETE_JSON:\s*\{[\s\S]*?\}\n?/g, '');
      }

      // Remove bulk deletion JSONs
      if (deleteAllJSON) {
        displayMessage = displayMessage.replace(/TASK_DELETE_ALL_JSON:\s*\{[\s\S]*?\}\n?/g, '');
      }

      if (deleteCompletedJSON) {
        displayMessage = displayMessage.replace(/TASK_DELETE_COMPLETED_JSON:\s*\{[\s\S]*?\}\n?/g, '');
      }

      // Remove standalone closing bracket on its own line (Gemini sometimes outputs this after JSON arrays)
      displayMessage = displayMessage.replace(/^\s*\]\s*$/gm, '');

      // Remove stray closing braces (from JSON objects)
      displayMessage = displayMessage.replace(/^\s*\}\s*$/gm, '');

      // Remove stray opening braces/brackets that might be left behind
      displayMessage = displayMessage.replace(/^\s*[\{\[]\s*$/gm, '');

      // Remove "tool_code" text that appears when Gemini wraps JSON in code blocks
      displayMessage = displayMessage.replace(/\btool_code\b/g, '');

      // Remove conversation prefixes (Wove:, User:) that shouldn't appear in display
      displayMessage = displayMessage.replace(/^(Wove|User):\s*/gm, '');

      displayMessage = displayMessage.trim();

      console.log('🔍 DISPLAY MESSAGE AFTER CLEANING:', displayMessage);
      console.log('🔍 DISPLAY MESSAGE LENGTH:', displayMessage.length);

      const assistantMessage: Message = {
        role: 'assistant',
        content: displayMessage || response,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMessage]);

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

      // Only speak user-facing messages, not JSON function calls
      const textToSpeak = displayMessage;
      console.log('🎯 Finally block - voiceModeRef.current:', voiceModeRef.current);
      console.log('🎯 displayMessage:', displayMessage);
      console.log('🎯 response:', response);
      console.log('🎯 textToSpeak:', textToSpeak);
      console.log('🎯 textToSpeak length:', textToSpeak.length);

      // Speak the response in voice mode, then restart listening after TTS completes
      if (voiceModeRef.current) {
        console.log('🎤 Voice mode is ON, will speak response');
        (async () => {
          try {
            // Only speak if there's actual content to speak
            if (textToSpeak && textToSpeak.trim().length > 0) {
              console.log('🔊 Speaking AI response...', 'Text:', textToSpeak.substring(0, 50) + '...');
              await speak(textToSpeak, aiVoice);
              console.log('✅ TTS complete, restarting listening...');
            } else {
              console.log('⚠️ No text to speak (empty response), skipping TTS');
            }
          } catch (speakError) {
            console.error('❌ TTS error:', speakError);
          } finally {
            // Restart listening after TTS completes (or after error)
            setTimeout(() => startListening(), 500);
          }
        })();
      } else {
        console.log('⏸️ Voice mode is OFF, skipping TTS');
      }
    }
  };

  const startListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    console.log('🎤 Starting listening... voiceModeRef.current:', voiceModeRef.current);

    const recognition = startBrowserListening(
      // onResult - final transcript (after silence timeout)
      (text) => {
        console.log('🎤 Got final transcript, auto-sending:', text);
        setIsListening(false);
        // Auto-send when we get the final transcript
        if (text.trim()) {
          // Clear the input field and send the message
          setInput('');
          handleSend(text.trim());
        }
      },
      // onError
      (error) => {
        console.error('Speech recognition error:', error);
        // Show error as a system message
        const errorMessage: Message = {
          role: 'assistant',
          content: `🎤 ${error}`,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsListening(false);
      },
      // onInterimResult - show what's being said in real-time
      (interimText) => {
        setInput(interimText);
      }
    );

    if (recognition) {
      recognitionRef.current = recognition;
      setIsListening(true);
    } else {
      // Show error if speech recognition not supported
      const errorMessage: Message = {
        role: 'assistant',
        content: '🎤 Speech recognition not supported in this browser. Try Chrome, Edge, or Safari.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
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
          ? 'bottom-4 right-4 w-80 md:w-96 md:bottom-6 md:right-6'
          : 'bottom-4 right-4 left-4 top-4 md:left-auto md:w-[600px] md:top-4 md:bottom-4 md:right-6'
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
              <h3 className="text-xl font-bold text-text-primary">Wove</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Start a new chat? This will clear the conversation history.')) {
                  setMessages([]);
                  localStorage.removeItem('aiChatHistory');
                }
              }}
              className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
              aria-label="New Chat"
              title="New Chat"
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
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-text-secondary py-8 px-4">
                  <div className="text-7xl mb-6">👋</div>
                  <h2 className="text-2xl font-bold text-text-primary mb-3">Hey! I'm Wove</h2>
                  <p className="text-base text-text-secondary mb-8">Your AI assistant for everything</p>

                  <div className="mt-6 space-y-3 text-left max-w-md mx-auto">
                    <p className="text-lg font-semibold text-text-primary mb-4">I can help with:</p>

                    <div className="flex items-start gap-3 p-3 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                      <span className="text-2xl">💡</span>
                      <div>
                        <p className="text-sm font-medium text-text-primary">Brainstorming & Planning</p>
                        <p className="text-xs text-text-secondary">Ideas, strategies, and project planning</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                      <span className="text-2xl">💻</span>
                      <div>
                        <p className="text-sm font-medium text-text-primary">Coding & Technical Help</p>
                        <p className="text-xs text-text-secondary">Debug code, learn programming, get solutions</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                      <span className="text-2xl">📚</span>
                      <div>
                        <p className="text-sm font-medium text-text-primary">Learning & Explaining</p>
                        <p className="text-xs text-text-secondary">Concepts, tutorials, step-by-step guides</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                      <span className="text-2xl">✅</span>
                      <div>
                        <p className="text-sm font-medium text-text-primary">Managing Tasks & Events</p>
                        <p className="text-xs text-text-secondary">Create tasks, schedule events, organize notes</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                      <span className="text-2xl">💬</span>
                      <div>
                        <p className="text-sm font-medium text-text-primary">Conversation & Advice</p>
                        <p className="text-xs text-text-secondary">Chat about anything, get recommendations</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary mt-8 opacity-75">Just start typing, attach a file, or use voice input!</p>
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
                    <p className="text-base whitespace-pre-wrap">{msg.content}</p>
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
              {/* File attachment preview */}
              {attachedFile && (
                <div className="mb-2 p-2 bg-black/5 dark:bg-white/5 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-text-primary">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="truncate">{attachedFile.name}</span>
                    <span className="text-xs text-text-secondary">({(attachedFile.size / 1024).toFixed(2)}KB)</span>
                  </div>
                  <button
                    onClick={removeAttachment}
                    className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
                    aria-label="Remove attachment"
                  >
                    <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={async () => {
                    console.log('🎙️ Voice button clicked! Current voiceMode:', voiceMode);
                    const newVoiceMode = !voiceMode;
                    console.log('🎙️ Setting voiceMode to:', newVoiceMode);

                    // Update both state AND ref immediately
                    setVoiceMode(newVoiceMode);
                    voiceModeRef.current = newVoiceMode;

                    if (newVoiceMode) {
                      // Turning ON voice mode - unlock audio for mobile, then start listening
                      console.log('✅ Turning ON voice mode - unlocking audio and starting listening');
                      await unlockAudio(); // Unlock audio with user gesture
                      setTimeout(() => startListening(), 100);
                    } else {
                      // Turning OFF voice mode - stop listening and speaking
                      console.log('⏸️ Turning OFF voice mode - stopping listening and speaking');
                      recognitionRef.current?.stop();
                      setIsListening(false);
                      stopSpeaking();
                    }
                  }}
                  disabled={isLoading}
                  className={`p-2 sm:p-2.5 rounded-full transition-all flex-shrink-0 ${
                    voiceMode
                      ? 'bg-purple-500 text-white ring-2 ring-purple-300'
                      : 'bg-black/10 dark:bg-white/10 text-text-primary hover:bg-black/20 dark:hover:bg-white/20'
                  } disabled:opacity-50`}
                  aria-label={voiceMode ? 'Stop voice mode' : 'Start voice mode'}
                  title={voiceMode ? 'Voice mode ON (continuous conversation)' : 'Voice mode (hands-free chat)'}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="p-2 sm:p-2.5 rounded-full transition-all flex-shrink-0 bg-black/10 dark:bg-white/10 text-text-primary hover:bg-black/20 dark:hover:bg-white/20 disabled:opacity-50"
                  aria-label="Attach file"
                  title="Attach file (.txt, .csv, .pdf, .doc)"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.csv,.pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isListening ? 'Listening...' : attachedFile ? `Ask about ${attachedFile.name}...` : 'Ask me anything...'}
                  disabled={isLoading || isListening}
                  className="flex-1 min-w-0 bg-black/5 dark:bg-white/5 text-text-primary placeholder-text-secondary rounded-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-accent transition-all disabled:opacity-50"
                />

                <button
                  onClick={() => handleSend()}
                  disabled={(!input.trim() && !attachedFile) || isLoading}
                  className="p-2 sm:p-2.5 bg-accent text-white rounded-full hover:bg-accent-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  aria-label="Send message"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>

              <p className="text-xs text-text-secondary mt-2 text-center">
                {isListening ? 'Speak now...' : attachedFile ? `File attached: ${attachedFile.name}` : 'Type, attach a file, or use voice input'}
              </p>
            </div>
          </>
        )}
      </WidgetCard>
    </div>
  );
};
