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

export const askGemini = async (
  systemPrompt: string,
  conversationHistory: Array<{ role: string; content: string }>,
  userMessage: string,
  onChunk?: (chunk: string) => void,
  abortSignal?: AbortSignal
): Promise<string> => {
  console.log('🤖 [askGemini] Called with message:', userMessage.substring(0, 50) + '...');
  console.log('🤖 [askGemini] Conversation history:', conversationHistory.length, 'messages');
  console.log('🤖 [askGemini] Fetching /api/ai...');

  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'chat',
      data: {
        systemPrompt,
        conversationHistory,
        message: userMessage
      }
    }),
    signal: abortSignal
  });

  console.log('🤖 [askGemini] Response status:', response.status, response.statusText);

  if (!response.ok) {
    const error = await response.json();
    console.error('🤖 [askGemini] ❌ Error response:', error);
    throw new Error(error.error || 'AI request failed');
  }

  const data = await response.json();
  console.log('🤖 [askGemini] ✅ Success, response length:', data.response?.length || 0);
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
  // Stop Web Audio API playback (for Google Cloud TTS)
  if (currentAudioSource) {
    try {
      currentAudioSource.stop();
      currentAudioSource = null;
      console.log('⏹️  Stopped Web Audio playback');
    } catch (error) {
      // Already stopped or invalid state
      currentAudioSource = null;
    }
  }

  // Clear audio queue
  audioQueue = [];
  isPlayingQueue = false;

  // Stop browser TTS
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

// Global audio context that's unlocked by user gesture
let globalAudioContext: AudioContext | null = null;
let isAudioUnlocked = false;

// Track currently playing audio source for interruption support
let currentAudioSource: AudioBufferSourceNode | null = null;

// Queue for managing chunked audio playback
let audioQueue: Array<() => Promise<void>> = [];
let isPlayingQueue = false;

// Call this during a user interaction (button click, tap) to unlock audio on mobile
export const unlockAudio = async (): Promise<void> => {
  if (isAudioUnlocked) return;

  try {
    // Create AudioContext and play audible beep to unlock
    if (!globalAudioContext) {
      globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Resume context if suspended (iOS requirement)
    if (globalAudioContext.state === 'suspended') {
      await globalAudioContext.resume();
    }

    // Play a brief audible beep (100ms at 800Hz, low volume)
    // Safari requires ACTUAL audible playback, not silent buffer
    const sampleRate = globalAudioContext.sampleRate;
    const duration = 0.1; // 100ms
    const buffer = globalAudioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Generate a soft beep at 800Hz
    for (let i = 0; i < buffer.length; i++) {
      channelData[i] = Math.sin(2 * Math.PI * 800 * i / sampleRate) * 0.1; // Low volume
    }

    const source = globalAudioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(globalAudioContext.destination);
    source.start(0);

    isAudioUnlocked = true;
    console.log('✅ Audio unlocked for mobile with audible beep');
  } catch (error) {
    console.error('❌ Failed to unlock audio:', error);
  }
};

// Helper: Split text into chunks for TTS (Google Cloud has ~5000 char limit)
function chunkText(text: string, maxChars: number = 4500): string[] {
  if (text.length <= maxChars) {
    return [text];
  }

  const chunks: string[] = [];
  // Split by sentences (period, exclamation, question mark followed by space or end)
  const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || [text];

  let currentChunk = '';
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    // If adding this sentence exceeds limit, start new chunk
    if (currentChunk && (currentChunk.length + trimmed.length + 1) > maxChars) {
      chunks.push(currentChunk.trim());
      currentChunk = trimmed;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + trimmed;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}

// Helper: Split text into sentences for streaming TTS
function splitIntoSentences(text: string): string[] {
  // Split by sentences, keeping punctuation
  const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || [text];
  return sentences.map(s => s.trim()).filter(s => s.length > 0);
}

// Helper: Batch sentences into groups (reduces API calls and pauses)
function batchSentences(sentences: string[], batchSize: number = 3): string[] {
  const batches: string[] = [];
  for (let i = 0; i < sentences.length; i += batchSize) {
    const batch = sentences.slice(i, i + batchSize).join(' ');
    batches.push(batch);
  }
  return batches;
}

// Helper: Process audio queue sequentially
async function processAudioQueue(): Promise<void> {
  if (isPlayingQueue || audioQueue.length === 0) {
    return;
  }

  isPlayingQueue = true;
  while (audioQueue.length > 0) {
    const playNext = audioQueue.shift();
    if (playNext) {
      try {
        await playNext();
      } catch (error) {
        console.error('Error playing queued audio:', error);
      }
    }
  }
  isPlayingQueue = false;
}

// Play audio using Web Audio API with the unlocked AudioContext
async function playWithWebAudio(base64Audio: string): Promise<void> {
  if (!globalAudioContext) {
    throw new Error('AudioContext not available');
  }

  // Convert base64 to ArrayBuffer
  const binaryString = atob(base64Audio);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const audioBuffer = bytes.buffer;

  return new Promise((resolve, reject) => {
    // Decode audio data
    globalAudioContext!.decodeAudioData(
      audioBuffer,
      (decodedBuffer) => {
        // Create buffer source
        const source = globalAudioContext!.createBufferSource();
        source.buffer = decodedBuffer;
        source.connect(globalAudioContext!.destination);

        // Track the current audio source for interruption support
        currentAudioSource = source;

        source.onended = () => {
          console.log('✅ Web Audio playback completed');
          currentAudioSource = null;
          resolve();
        };

        // Start playback
        source.start(0);
        console.log('▶️  Web Audio playback started');
      },
      (error) => {
        console.error('❌ Audio decode error:', error);
        currentAudioSource = null;
        reject(new Error('Failed to decode audio data'));
      }
    );
  });
}

// Fetch TTS audio for a text chunk with retry logic
async function fetchTTSAudio(text: string, voice: 'female' | 'male' = 'female', retries: number = 2): Promise<string> {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`🎤 TTS attempt ${attempt + 1}/${retries + 1} for text: "${text.substring(0, 50)}..."`);

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
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ TTS API error (${response.status}):`, errorData);

        // If rate limited, wait before retry
        if (response.status === 429) {
          const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.log(`⏳ Rate limited, waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          lastError = new Error(`TTS rate limit (429), attempt ${attempt + 1}`);
          continue;
        }

        throw new Error(`Google Cloud TTS request failed (${response.status})`);
      }

      const data = await response.json();

      if (!data.audio) {
        throw new Error('Google Cloud TTS not configured on server');
      }

      console.log(`✅ TTS audio fetched successfully`);
      return data.audio;

    } catch (error) {
      console.error(`❌ TTS fetch error on attempt ${attempt + 1}:`, error);
      lastError = error;

      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError || new Error('TTS request failed after retries');
}

// Google Cloud TTS (HD voices) with batched sentence streaming
export const speakWithGoogleCloud = async (text: string, voice: 'female' | 'male' = 'female'): Promise<void> => {
  // Stop any current playback before starting new one
  stopSpeaking();

  // Split text into chunks (to handle Google's character limit)
  const chunks = chunkText(text, 4500);
  console.log(`🎤 Split text into ${chunks.length} chunks for TTS`);

  // For each chunk, batch sentences together to reduce API calls and pauses
  for (const chunk of chunks) {
    const sentences = splitIntoSentences(chunk);
    console.log(`🎤 Split into ${sentences.length} sentences`);

    // Batch sentences together (3-5 sentences per API call instead of 1)
    const batches = batchSentences(sentences, 4);
    console.log(`🎤 Batched into ${batches.length} groups (reduces API calls from ${sentences.length} to ${batches.length})`);

    for (const batch of batches) {
      // Queue each batch for playback
      audioQueue.push(async () => {
        console.log(`🎤 Fetching TTS for batch: "${batch.substring(0, 60)}..."`);

        try {
          const audioBase64 = await fetchTTSAudio(batch, voice);

          // Play with Web Audio API if available, otherwise fallback
          if (globalAudioContext && isAudioUnlocked) {
            return playWithWebAudio(audioBase64);
          } else {
            // Fallback to Audio element
            const audioBlob = base64ToBlob(audioBase64, 'audio/mpeg');
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            return new Promise<void>((resolve, reject) => {
              audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                resolve();
              };
              audio.onerror = () => {
                URL.revokeObjectURL(audioUrl);
                reject(new Error('Audio playback failed'));
              };

              const playPromise = audio.play();
              if (playPromise !== undefined) {
                playPromise.catch((error) => {
                  console.error('❌ Audio playback blocked:', error);
                  URL.revokeObjectURL(audioUrl);
                  reject(error);
                });
              }
            });
          }
        } catch (error) {
          console.error('❌ TTS batch failed:', error);
          // Don't break the queue, just skip this batch
          throw error;
        }
      });
    }
  }

  // Start processing the queue
  return processAudioQueue();
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
  appContext?: AppContext,
  abortSignal?: AbortSignal
): Promise<string> => {
  console.log('📡 [getAIResponse] Called from page:', currentPage);
  console.log('📡 [getAIResponse] User message:', userMessage.substring(0, 50) + '...');
  console.log('📡 [getAIResponse] Conversation history:', conversationHistory?.length || 0, 'messages');

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

  console.log('📡 [getAIResponse] Context:', {
    tasks: context.taskCount,
    notes: context.noteCount,
    events: context.eventCount,
    goals: context.goalCount,
    projects: context.projectCount
  });

  // Build system prompt with context
  const systemPrompt = buildSystemPrompt(context);

  console.log('📡 [getAIResponse] Calling askGemini...');
  // Return structured data to Gemini API with abort signal
  return await askGemini(systemPrompt, conversationHistory || [], userMessage, undefined, abortSignal);
};
