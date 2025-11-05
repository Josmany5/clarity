// AI Service - SECURE version using backend API
// API keys are kept on the server, not exposed to clients

// ============= SPEECH TO TEXT (Client-side - FREE) =============

export const startBrowserListening = (
  onResult: (text: string) => void,
  onError?: (error: string) => void
): { stop: () => void } | null => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError?.('Speech recognition not supported in this browser');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    onError?.(event.error);
  };

  recognition.start();

  return {
    stop: () => recognition.stop()
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
    return new Date(t.dueDate) < new Date();
  });

  // Weekly stats
  const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const tasksThisWeek = tasks.filter((t: any) => t.createdAt > weekAgo);
  const completedThisWeek = tasksThisWeek.filter((t: any) => t.completed);

  // Build conversation history context
  const historyContext = conversationHistory && conversationHistory.length > 0
    ? `\n\nCONVERSATION HISTORY:\n${conversationHistory.slice(-6).map(msg =>
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n')}\n`
    : '';

  const context = `You are a helpful AI assistant for Clarity, a productivity dashboard.

CURRENT STATS:
- Total tasks: ${tasks.length} (${completedTasks.length} completed, ${tasks.length - completedTasks.length} pending)
- Urgent tasks: ${urgentTasks.length}
- Important tasks: ${importantTasks.length}
- Overdue tasks: ${overdueTasks.length}
- This week: ${tasksThisWeek.length} tasks created, ${completedThisWeek.length} completed
- Notes: ${notes.length}

RECENT TASKS:
${tasks.slice(0, 8).map((t: any) =>
  `- ${t.title}${t.completed ? ' ✓' : ''}${t.urgent ? ' [URGENT]' : ''}${t.important ? ' [IMPORTANT]' : ''}${t.dueDate ? ` (due: ${t.dueDate})` : ''}`
).join('\n')}
${historyContext}
CAPABILITIES:
- When user asks you to create/add tasks, respond with JSON array
- Productivity analysis: "How productive was I this week?", "Show my completion rate"
- Task filtering: "Show my urgent tasks", "List overdue tasks", "What's important?"
- Weekly summaries: "Summarize my week", "What did I accomplish?"
- Search: "Find tasks about [topic]", "Show notes from last week"
- Insights: "What should I focus on?", "Any bottlenecks?"

IMPORTANT: If the user asks you to create tasks, you MUST respond with "TASKS_JSON:" followed by a JSON array, then provide a friendly confirmation message.

TASK CREATION RULES:
- ALWAYS parse and include dueDate when user mentions time references (tomorrow, next week, Monday, etc.)
- ALWAYS parse and include dueTime when user mentions specific times (3pm, 10:00, morning, etc.)
- Include estimatedTime (in minutes) when user mentions duration (30 min, 2 hours, etc.)
- Include subtasks array when user mentions steps or sub-items
- Calculate dates relative to current date: ${new Date().toISOString().split('T')[0]}
- Date format: YYYY-MM-DD (e.g., "2025-11-06")
- Time format: HH:MM in 24-hour (e.g., "15:00" for 3pm, "09:00" for 9am)
- Common conversions: morning=09:00, afternoon=14:00, evening=18:00, night=20:00
- Time duration: 1 hour = 60 minutes, convert all durations to minutes

Task Format:
{
  "title": "Task title",
  "dueDate": "YYYY-MM-DD",
  "dueTime": "HH:MM",
  "estimatedTime": 60,  // in minutes
  "urgent": false,
  "important": false,
  "subtasks": [{"title": "Step 1"}, {"title": "Step 2"}]
}

Examples:
"Buy groceries tomorrow at 3pm urgent" → TASKS_JSON: [{"title":"Buy groceries","dueDate":"${getTomorrow()}","dueTime":"15:00","urgent":true,"important":false}]
"Important meeting next Monday 10am for 2 hours" → TASKS_JSON: [{"title":"Important meeting","dueDate":"${getNextMonday()}","dueTime":"10:00","estimatedTime":120,"urgent":false,"important":true}]
"Study for exam with steps: read chapter 1, do practice problems, review notes" → TASKS_JSON: [{"title":"Study for exam","urgent":false,"important":true,"subtasks":[{"title":"Read chapter 1"},{"title":"Do practice problems"},{"title":"Review notes"}]}]

I've created your tasks!

Be helpful, concise, and data-driven. Use the stats and conversation history to give specific answers.`;

  return await askGemini(userMessage, context);
};
