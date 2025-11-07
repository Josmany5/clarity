// Vercel Serverless Function - handles AI requests securely
// This keeps your API keys on the server, not in the client

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Server-side API keys (set in Vercel Environment Variables)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, data } = req.body;

  try {
    switch (action) {
      case 'chat':
        return await handleChat(req, res, data);
      case 'speak':
        return await handleSpeak(req, res, data);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error: any) {
    console.error('AI API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Handle chat with Gemini
async function handleChat(req: VercelRequest, res: VercelResponse, data: any) {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API key not configured on server' });
  }

  const { message, context } = data;
  const fullPrompt = context ? `${context}\n\nUser: ${message}` : message;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 2048,
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const result = await response.json();
  const aiResponse = result.candidates[0].content.parts[0].text;

  return res.status(200).json({ response: aiResponse });
}

// Handle ElevenLabs TTS
async function handleSpeak(req: VercelRequest, res: VercelResponse, data: any) {
  const { text, usePremium } = data;

  // If not using premium or no API key, return null (client will use browser TTS)
  if (!usePremium || !ELEVENLABS_API_KEY) {
    return res.status(200).json({ audio: null });
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.statusText}`);
  }

  const audioBlob = await response.arrayBuffer();
  const base64Audio = Buffer.from(audioBlob).toString('base64');

  return res.status(200).json({ audio: base64Audio });
}
