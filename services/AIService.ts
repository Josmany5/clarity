// AI Service - SECURE version using backend API
// API keys are kept on the server, not exposed to clients

import { buildSystemPrompt, type AIContext } from './AIInstructions';

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
  recognition.continuous = true; // Keep listening for longer pauses
  recognition.interimResults = true; // Show interim results for better feedback
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;

  let silenceTimeout: NodeJS.Timeout | null = null;
  let accumulatedTranscript = '';

  recognition.onstart = () => {
    console.log('🎤 Speech recognition started');
    accumulatedTranscript = '';
  };

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    let currentFinalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        currentFinalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    // Accumulate final transcripts
    if (currentFinalTranscript) {
      accumulatedTranscript += currentFinalTranscript + ' ';
    }

    // Show interim results while speaking (combined with accumulated)
    const displayText = (accumulatedTranscript + interimTranscript).trim();
    if (displayText && onInterimResult) {
      onInterimResult(displayText);
    }

    // Clear any existing silence timeout
    if (silenceTimeout) {
      clearTimeout(silenceTimeout);
    }

    // Set new silence timeout - fire after 1.5 seconds of silence
    silenceTimeout = setTimeout(() => {
      if (accumulatedTranscript.trim()) {
        console.log('🎤 Final transcript (after silence):', accumulatedTranscript.trim());
        onResult(accumulatedTranscript.trim());
        recognition.stop();
      }
    }, 1500); // 1.5 seconds of silence before auto-send
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
    if (silenceTimeout) {
      clearTimeout(silenceTimeout);
      silenceTimeout = null;
    }
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
        if (silenceTimeout) {
          clearTimeout(silenceTimeout);
          silenceTimeout = null;
        }
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

// Google Cloud TTS (HD voices)
export const speakWithGoogleCloud = async (text: string, voice: 'female' | 'male' = 'female'): Promise<void> => {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'speak',
      data: {
        text,
        voice
      }
    })
  });

  if (!response.ok) {
    throw new Error('Google Cloud TTS request failed');
  }

  const data = await response.json();

  // If no audio returned, backend doesn't have API key configured
  if (!data.audio) {
    throw new Error('Google Cloud TTS not configured on server');
  }

  // Convert base64 to blob and play
  const audioBlob = base64ToBlob(data.audio, data.mimeType || 'audio/mpeg');
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

export const speak = async (text: string, voice: 'female' | 'male' = 'female'): Promise<void> => {
  console.log('🎤 speak() called with text:', text);
  console.log('🎤 speak() text length:', text ? text.length : 0);
  console.log('🎤 speak() voice:', voice);

  try {
    // Try Google Cloud TTS first (high quality HD voices)
    await speakWithGoogleCloud(text, voice);
  } catch (error) {
    console.error('Google Cloud TTS error, falling back to browser TTS:', error);
    // Fallback to browser TTS if Google Cloud fails
    await speakWithBrowser(text);
  }
};

// ============= SMART TASK CREATION =============

export const parseTaskCommand = async (userInput: string): Promise<any> => {
  return {
    title: userInput,
    urgent: false,
    important: false,
    tags: []
  };
};

// ============= CONTEXT-AWARE ASSISTANCE =============

interface AppContext {
  tasks: any[];
  notes: any[];
  events: any[];
  goals: any[];
  workspaces: any[];
  taskLists: any[];
  projects: any[];
}

function buildRecentActivity(appContext: AppContext): string[] {
  const activities: string[] = [];

  // Count incomplete and urgent tasks
  const incompleteTasks = appContext.tasks.filter((t: any) => !t.completed).length;
  const urgentTasks = appContext.tasks.filter((t: any) => t.urgent && !t.completed).length;

  if (urgentTasks > 0) {
    activities.push(`${urgentTasks} urgent tasks pending`);
  }

  // Count today's events
  const today = new Date().toISOString().split('T')[0];
  const todayEvents = appContext.events.filter((e: any) => e.startDate === today).length;
  if (todayEvents > 0) {
    activities.push(`${todayEvents} events today`);
  }

  // Count recent notes (updated in last 24 hours)
  const recentNotes = appContext.notes.filter((n: any) =>
    Date.now() - n.lastModified < 24 * 60 * 60 * 1000
  ).length;
  if (recentNotes > 0) {
    activities.push(`${recentNotes} notes updated recently`);
  }

  return activities;
}

export const getAIResponse = async (
  userMessage: string,
  currentPage: string,
  conversationHistory?: Array<{ role: string; content: string }>,
  appContext?: AppContext
): Promise<string> => {
  // Build context for system prompt
  const context: AIContext = {
    currentPage,
    taskCount: appContext?.tasks.length || 0,
    noteCount: appContext?.notes.length || 0,
    eventCount: appContext?.events.length || 0,
    goalCount: appContext?.goals.length || 0,
    workspaceCount: appContext?.workspaces.length || 0,
    taskListCount: appContext?.taskLists.length || 0,
    projectCount: appContext?.projects.length || 0,
    recentActivity: appContext ? buildRecentActivity(appContext) : [],
    // Pass actual data arrays for AI to read
    tasks: appContext?.tasks || [],
    events: appContext?.events || [],
    notes: appContext?.notes || [],
    goals: appContext?.goals || [],
    projects: appContext?.projects || [],
  };

  // Build system prompt with context
  const systemPrompt = buildSystemPrompt(context);

  // Build conversation history
  const conversationText = conversationHistory
    ?.map(m => `${m.role === 'user' ? 'User' : 'Wove'}: ${m.content}`)
    .join('\n') || '';

  // Full prompt = system instructions + history + current message
  const fullPrompt = `${systemPrompt}\n\n${conversationText}\n\nUser: ${userMessage}`;

  return await askGemini(fullPrompt);
};
