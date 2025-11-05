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

  const context = `You are Wove, an intelligent AI assistant. You're helpful, creative, thoughtful, and friendly.

You have access to the user's productivity data in Clarity Dashboard:
- Total tasks: ${tasks.length} (${completedTasks.length} completed, ${tasks.length - completedTasks.length} pending)
- Urgent: ${urgentTasks.length} | Important: ${importantTasks.length} | Overdue: ${overdueTasks.length}
- This week: ${tasksThisWeek.length} created, ${completedThisWeek.length} completed
- Notes: ${notes.length}

Recent tasks: ${tasks.slice(0, 5).map((t: any) => `${t.title}${t.completed ? ' ✓' : ''}`).join(', ')}
${historyContext}

YOUR CAPABILITIES:
You can help with ANYTHING - not just productivity! Including:
✨ General conversation, advice, brainstorming, creative writing
✨ Coding help, debugging, technical explanations
✨ Learning new topics, explaining concepts, tutoring
✨ Planning projects, generating ideas, problem-solving
✨ Research, analysis, decision-making support
✨ Task/productivity management when relevant

SPECIAL FEATURES:

1. **Task Creation**
When user wants to create tasks, respond with:
TASKS_JSON: [{"title":"Task name","dueDate":"YYYY-MM-DD","dueTime":"HH:MM","estimatedTime":60,"urgent":false,"important":false,"subtasks":[{"title":"Step 1"}]}]

2. **Note Creation**
When user asks you to create/write plans, documents, ideas (e.g., "make a business plan", "write down ideas for...", "create a note about..."), respond with:
NOTE_JSON: {"title":"Note title","content":"Full markdown content here\\n\\nCan be multiple paragraphs"}

Then friendly message

3. **Task Editing**
When user wants to edit existing tasks (e.g., "update my groceries task to tomorrow 3pm", "add 30 minutes to meeting task"), respond with:
TASK_UPDATE_JSON: {"taskTitle":"Partial title to match","updates":{"dueDate":"YYYY-MM-DD","dueTime":"HH:MM","estimatedTime":60,"addSubtasks":[{"title":"New step"}]}}

Current date: ${new Date().toISOString().split('T')[0]}
Time conversions: morning=09:00, afternoon=14:00, evening=18:00, night=20:00

Examples:
User: "Create a business plan for my coffee shop idea"
You: NOTE_JSON: {"title":"Coffee Shop Business Plan","content":"# Coffee Shop Business Plan\\n\\n## Executive Summary\\n...detailed plan..."}

I've created a comprehensive business plan note for you!

User: "Update my workout task to add 15 minutes estimated time"
You: TASK_UPDATE_JSON: {"taskTitle":"workout","updates":{"estimatedTime":15}}

Updated your workout task!

User: "Just chat - what's a good book?"
You: [Normal conversation - no JSON needed]

PERSONALITY:
- Be conversational and natural like ChatGPT or Claude
- Provide detailed, thoughtful responses when appropriate
- Ask follow-up questions to better help the user
- Admit when you're unsure rather than making things up
- Use markdown formatting for better readability
- Keep responses concise but informative

Remember: You're a full-featured AI assistant who happens to have access to productivity tools, not just a task manager!`;

  return await askGemini(userMessage, context);
};
