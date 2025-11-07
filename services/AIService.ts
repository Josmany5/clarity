// AI Service - SECURE version using backend API
// API keys are kept on the server, not exposed to clients

import { parseLocalDate } from '../utils/dateUtils';

// ============= SPEECH TO TEXT (Client-side - FREE) =============

export const startBrowserListening = (
  onResult: (text: string) => void,
  onError?: (error: string) => void,
  onInterimResult?: (text: string) => void
): { stop: () => void } | null => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError?.('Speech recognition not supported. Try Chrome, Edge, or Safari.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true; // Show interim results for better feedback
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    console.log('🎤 Speech recognition started');
  };

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    // Show interim results while speaking
    if (interimTranscript && onInterimResult) {
      onInterimResult(interimTranscript);
    }

    // Final result when done speaking
    if (finalTranscript) {
      console.log('🎤 Final transcript:', finalTranscript);
      onResult(finalTranscript);
    }
  };

  recognition.onerror = (event: any) => {
    console.error('🎤 Speech recognition error:', event.error);
    let errorMessage = 'Speech recognition error';

    switch (event.error) {
      case 'no-speech':
        errorMessage = 'No speech detected. Please try again.';
        break;
      case 'audio-capture':
        errorMessage = 'No microphone found or access denied.';
        break;
      case 'not-allowed':
        errorMessage = 'Microphone access denied. Please allow access in browser settings.';
        break;
      case 'network':
        errorMessage = 'Network error. Check your connection.';
        break;
      default:
        errorMessage = `Speech recognition error: ${event.error}`;
    }

    onError?.(errorMessage);
  };

  recognition.onend = () => {
    console.log('🎤 Speech recognition ended');
  };

  try {
    recognition.start();
  } catch (error) {
    console.error('Failed to start recognition:', error);
    onError?.('Failed to start speech recognition');
    return null;
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch (error) {
        console.error('Failed to stop recognition:', error);
      }
    }
  };
};

// ============= AI INTELLIGENCE (Gemini via Backend) =============

export const askGemini = async (prompt: string, context?: string): Promise<string> => {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'chat',
      data: {
        message: prompt,
        context
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'AI request failed');
  }

  const data = await response.json();
  return data.response;
};

// ============= TEXT TO SPEECH =============

// Browser TTS (FREE)
let currentSpeech: SpeechSynthesisUtterance | null = null;

export const speakWithBrowser = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      currentSpeech = null;
      resolve();
    };

    utterance.onerror = (event) => {
      currentSpeech = null;
      reject(new Error(`Speech error: ${event.error}`));
    };

    currentSpeech = utterance;
    window.speechSynthesis.speak(utterance);
  });
};

export const stopSpeaking = (): void => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  currentSpeech = null;
};

// ElevenLabs TTS via Backend (PREMIUM)
export const speakWithElevenLabs = async (text: string): Promise<void> => {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'speak',
      data: {
        text,
        usePremium: true
      }
    })
  });

  if (!response.ok) {
    throw new Error('ElevenLabs request failed');
  }

  const data = await response.json();

  // If no audio returned, backend doesn't have API key configured
  if (!data.audio) {
    throw new Error('Premium voice not configured on server');
  }

  // Convert base64 to blob and play
  const audioBlob = base64ToBlob(data.audio, 'audio/mpeg');
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);

  return new Promise((resolve, reject) => {
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      reject(new Error('Audio playback failed'));
    };
    audio.play();
  });
};

// Helper to convert base64 to Blob
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

// ============= HIGH-LEVEL API =============

// User preference stored in localStorage
const getUsePremiumVoice = (): boolean => {
  try {
    return localStorage.getItem('usePremiumVoice') === 'true';
  } catch {
    return false;
  }
};

export const setUsePremiumVoice = (value: boolean): void => {
  localStorage.setItem('usePremiumVoice', value.toString());
};

export const speak = async (text: string): Promise<void> => {
  const usePremium = getUsePremiumVoice();

  try {
    if (usePremium) {
      await speakWithElevenLabs(text);
    } else {
      await speakWithBrowser(text);
    }
  } catch (error) {
    console.error('Speech error:', error);
    // Fallback to browser if premium fails
    if (usePremium) {
      await speakWithBrowser(text);
    } else {
      throw error;
    }
  }
};

// ============= SMART TASK CREATION =============

export const parseTaskCommand = async (userInput: string): Promise<any> => {
  const context = `You are a task parser for a productivity dashboard.
Parse the user's natural language into a structured task.

Current date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}

Return ONLY a JSON object with these fields:
{
  "title": "task title",
  "dueDate": "YYYY-MM-DD" (optional),
  "dueTime": "HH:MM" in 24h format (optional),
  "urgent": boolean,
  "important": boolean,
  "tags": ["tag1", "tag2"]
}

Examples:
"Buy groceries tomorrow at 3pm urgent" → {"title":"Buy groceries","dueDate":"${getTomorrow()}","dueTime":"15:00","urgent":true,"important":false,"tags":[]}
"Important meeting next Monday 10am" → {"title":"Important meeting","dueDate":"${getNextMonday()}","dueTime":"10:00","urgent":false,"important":true,"tags":[]}

Parse this: "${userInput}"`;

  const response = await askGemini(context);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No JSON found in response');
  } catch (error) {
    console.error('Failed to parse task:', error);
    return {
      title: userInput,
      urgent: false,
      important: false,
      tags: []
    };
  }
};

// Helper functions
const getTomorrow = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const getNextMonday = (): string => {
  const date = new Date();
  const day = date.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().split('T')[0];
};

// ============= CONTEXT-AWARE ASSISTANCE =============

export const getAIResponse = async (
  userMessage: string,
  currentPage: string,
  conversationHistory?: Array<{ role: string; content: string }>
): Promise<string> => {
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const notes = JSON.parse(localStorage.getItem('notes') || '[]');

  // Calculate productivity stats
  const completedTasks = tasks.filter((t: any) => t.completed);
  const urgentTasks = tasks.filter((t: any) => t.urgent && !t.completed);
  const importantTasks = tasks.filter((t: any) => t.important && !t.completed);
  const overdueTasks = tasks.filter((t: any) => {
    if (!t.dueDate || t.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = parseLocalDate(t.dueDate);
    return dueDate < today;
  });

  // Weekly stats
  const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const tasksThisWeek = tasks.filter((t: any) => t.createdAt > weekAgo);
  const completedThisWeek = tasksThisWeek.filter((t: any) => t.completed);

  // Build conversation history context (last 10 messages for better context)
  const historyContext = conversationHistory && conversationHistory.length > 0
    ? `\n\nCONVERSATION HISTORY (Recent context):\n${conversationHistory.slice(-10).map(msg =>
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n')}\n`
    : '';

  // Get current date/time info for accurate date calculations
  const now = new Date();
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const currentTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const context = `You are Wove AI, an expert assistant for the Wove productivity app.

- You know everything in the app: tasks, notes, events, projects, goals, workflows, routines, templates, and productivity systems
- You can read and understand user's data when they ask about it
- You are an expert on productivity frameworks and document creation

YOUR CAPABILITIES:
- Answer questions about the app and its contents
- Help users find and use features
- Explain productivity systems and frameworks
- Suggest relevant workflows, routines, or templates based on user needs
- Create tasks, notes, and events when explicitly requested

RESPONSE STYLE:
- Be clear, concise, and helpful
- Focus on facts and practical guidance
- No unnecessary personality or emotion
- Direct answers to direct questions

=== CURRENT DATE/TIME ===
Today is: ${dayOfWeek}, ${fullDate}
Current time: ${currentTime}
ISO date: ${new Date().toISOString().split('T')[0]}

=== CURRENT APP STATE ===
You're on: ${currentPage}
Tasks: ${tasks.length} total (${completedTasks.length} done, ${urgentTasks.length} urgent, ${overdueTasks.length} overdue)
Notes: ${notes.length} total
Recent tasks: ${tasks.slice(0, 5).map((t: any) => `"${t.title}"${t.completed ? ' ✓' : ''}`).join(', ') || 'none'}
${historyContext}
ENTITY CREATION:
- Tasks: Create when user says "I need to...", "remind me to..."
- Notes: Create when user says "make me a...", "create a note...", "write a note..."
- Events: Create when user mentions appointments/meetings with times

CREATION RULES:
- NEVER show JSON in your response text
- NEVER explain the JSON structure to the user
- Just create the item silently using the format below
- Confirm creation with natural language: "I've created a note titled X" or "I've added a task for Y"

FORMAT RULES (hidden from user):
- Tasks: TASKS_JSON: [{"title":"Task name","urgent":false,"important":false,"dueDate":"YYYY-MM-DD"}]
- Notes: <<<NOTE_START>>> {"title":"Title","content":"Content with all details"} <<<NOTE_END>>>
- Events: EVENTS_JSON: [{"title":"Event","type":"class|meeting|appointment|other","startDate":"YYYY-MM-DD","startTime":"HH:MM","endTime":"HH:MM"}]

IMPORTANT: For notes, always include comprehensive content. Don't create empty notes.

That's it. Be helpful and knowledgeable.`;

  return await askGemini(userMessage, context);
};
