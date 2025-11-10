// Vercel Serverless Function for AI API
// This replaces server.js for Vercel deployment

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GOOGLE_CLOUD_TTS_KEY = process.env.GOOGLE_CLOUD_TTS_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  try {
    const { action, data } = req.body;

    // Handle chat action
    if (action === 'chat') {
      const { systemPrompt, conversationHistory, message } = data;

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

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }]
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

      if (!GOOGLE_CLOUD_TTS_KEY) {
        // No TTS key configured, return null to fallback to browser TTS
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
            return res.status(200).json({
              audio: result.audioContent,
              mimeType: 'audio/mpeg'
            });
          }
        }
      } catch (err) {
        console.error('TTS error:', err);
      }

      // Return null if TTS fails (client will use browser TTS)
      return res.status(200).json({ audio: null });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    console.error('AI API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
