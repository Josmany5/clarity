// Local development server for AI endpoints
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_CLOUD_TTS_KEY = process.env.GOOGLE_CLOUD_TTS_KEY;

// AI chat endpoint
app.post('/api/ai', async (req, res) => {
  const { action, data } = req.body;

  // Log incoming request
  console.log(`📨 Incoming API request - Action: ${action}`);

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  try {
    // Handle chat action
    if (action === 'chat') {
      const { systemPrompt, context, conversationHistory, message } = data;
      console.log(`💬 Chat request - Message: "${message.substring(0, 50)}..."`);
      console.log(`📊 Conversation history length: ${conversationHistory?.length || 0}`);

      // Support both systemPrompt (from app) and context (from tests)
      const actualSystemPrompt = systemPrompt || context || 'You are a helpful assistant.';

      // Build contents array with proper role structure
      const contents = [];

      // Add conversation history with roles
      if (conversationHistory && conversationHistory.length > 0) {
        for (const msg of conversationHistory) {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          });
        }
      }

      // Add current user message
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      console.log(`🚀 Calling Gemini API (gemini-2.5-flash-lite)...`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: actualSystemPrompt }]
            },
            contents: contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
            }
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      const aiResponse = result.candidates[0].content.parts[0].text;

      return res.status(200).json({ response: aiResponse });
    }

    // Handle speak action - use Google Cloud TTS
    if (action === 'speak') {
      const { text, voice = 'female' } = data;
      console.log(`🎤 TTS Request - Voice preference: ${voice}`);
      console.log(`📝 Received text:`, text);
      console.log(`📏 Text length:`, text ? text.length : 0);

      if (!GOOGLE_CLOUD_TTS_KEY) {
        console.log('⚠️  Google Cloud TTS key not configured, falling back to browser TTS');
        return res.status(200).json({ audio: null });
      }

      try {
        // Clean text for TTS - remove markdown formatting
        let cleanedText = text
          .replace(/\*\*/g, '')  // Remove bold markers
          .replace(/\*/g, '')    // Remove italic/bullet markers
          .replace(/_/g, '')     // Remove underscores
          .replace(/`/g, '')     // Remove code markers
          .replace(/#{1,6}\s/g, '') // Remove markdown headers
          .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Convert links to just text
          .trim();

        // Select voice based on preference
        const voiceName = voice === 'male' ? 'en-US-Chirp3-HD-Rasalgethi' : 'en-US-Chirp3-HD-Sulafat';
        const ssmlGender = voice === 'male' ? 'MALE' : 'FEMALE';
        console.log(`🔊 Using voice: ${voiceName} (${ssmlGender})`);

        // Use Google Cloud Text-to-Speech API with Chirp3-HD (latest HD voices)
        const ttsResponse = await fetch(
          `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_CLOUD_TTS_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              input: { text: cleanedText },
              voice: {
                languageCode: 'en-US',
                name: voiceName,
                ssmlGender: ssmlGender
              },
              audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: 1.0,
                pitch: 0.0
              }
            })
          }
        );

        if (ttsResponse.ok) {
          const result = await ttsResponse.json();

          if (result.audioContent) {
            console.log('✅ Google Cloud TTS audio generated');
            return res.status(200).json({
              audio: result.audioContent,
              mimeType: 'audio/mpeg'
            });
          }

          console.log('⚠️  No audio data found in Google Cloud TTS response');
        } else {
          const errorText = await ttsResponse.text();
          console.error('❌ Google Cloud TTS API error:', ttsResponse.status, errorText);
        }
      } catch (err) {
        console.error('❌ TTS error:', err);
      }

      // Return null if TTS fails (client will use browser TTS)
      return res.status(200).json({ audio: null });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    console.error('AI API Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Local API server running on http://localhost:${PORT}`);
  console.log(`📝 Gemini API Key: ${GEMINI_API_KEY ? '✓ Configured' : '✗ Missing'}`);
  console.log(`🔑 API Key (first/last 5): ${GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 5) + '...' + GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 5) : 'N/A'}`);
});
