// Local development server for AI endpoints
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// AI chat endpoint
app.post('/api/ai', async (req, res) => {
  const { action, data } = req.body;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  try {
    // Handle chat action
    if (action === 'chat') {
      const { message, context } = data;
      const fullPrompt = context ? `${context}\n\nUser: ${message}` : message;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
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

    // Handle speak action (not implemented yet, but won't error)
    if (action === 'speak') {
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
