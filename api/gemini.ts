import { GoogleGenAI } from '@google/genai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// IMPORTANT: Use process.env (not import.meta.env) in serverless functions
const API_KEYS = [
  process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY,
  process.env.VITE_GEMINI_API_KEY_2
].filter(Boolean) as string[];

if (API_KEYS.length === 0) {
  console.error('⚠️ NO API KEYS FOUND IN ENVIRONMENT');
}

const getGenAIClientByIndex = (index: number) => {
  if (API_KEYS.length === 0) return null;
  const key = API_KEYS[index % API_KEYS.length];
  return new GoogleGenAI({ apiKey: key });
};

// Disable caching for API routes
export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers for development
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { kind, base64, mimeType, systemPrompt, message, systemInstruction } = req.body;

    console.log('📥 API Request:', { kind, hasMimeType: !!mimeType, hasMessage: !!message });

    if (!kind) {
      return res.status(400).json({ error: 'Missing "kind" parameter' });
    }

    // Verify API key is available
    if (API_KEYS.length === 0) {
      console.error('❌ API Key missing at runtime');
      return res.status(500).json({ error: 'API key not configured. Please add VITE_GEMINI_API_KEY to Vercel environment variables.' });
    }

    let lastError: any;
    // Try each key starting from a random index
    const startIndex = Math.floor(Math.random() * API_KEYS.length);

    for (let i = 0; i < API_KEYS.length; i++) {
      const currentIndex = startIndex + i;
      const client = getGenAIClientByIndex(currentIndex);

      if (!client) continue;

      try {
        // Handle resume analysis
        if (kind === 'analyze') {
          if (!base64 || !mimeType) {
            return res.status(400).json({ error: 'Missing base64 or mimeType for analysis' });
          }

          console.log(`🔍 Starting resume analysis... (Attempt ${i + 1}/${API_KEYS.length})`);

          const result = await client.models.generateContent({
            model: 'gemini-flash-latest',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    inlineData: {
                      data: base64,
                      mimeType: mimeType,
                    },
                  },
                  { text: 'Analyze this resume and return the JSON response as specified in your instructions.' },
                ],
              },
            ],
            config: {
              systemInstruction: systemPrompt || 'You are a resume analyzer.',
            },
          });

          const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
          console.log('✅ Analysis complete, response length:', text.length);
          return res.status(200).json({ text });
        }

        // Handle chat
        if (kind === 'chat') {
          if (!message) {
            return res.status(400).json({ error: 'Missing message for chat' });
          }

          console.log(`💬 Processing chat message... (Attempt ${i + 1}/${API_KEYS.length})`);

          const result = await client.models.generateContent({
            model: 'gemini-flash-latest',
            contents: [
              {
                role: 'user',
                parts: [{ text: message }],
              },
            ],
            config: {
              systemInstruction: systemInstruction || 'You are a helpful assistant.',
            },
          });

          const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
          console.log('✅ Chat response generated');
          return res.status(200).json({ text });
        }

      } catch (error: any) {
        lastError = error;
        // If it's a quota error (429) or Service Warning, try next key
        const isQuotaError =
          error?.message?.includes('429') ||
          error?.message?.includes('quota') ||
          error?.status === 429;

        if (isQuotaError && i < API_KEYS.length - 1) {
          console.warn(`⚠️ API key at index ${currentIndex % API_KEYS.length} exhausted. Switching to next key...`);
          continue; // Try next loop iteration (next key)
        }

        // If it's not a quota error, throw immediately
        throw error;
      }
    }

    // If we've exhausted all retries or keys, throw the last error
    if (lastError) throw lastError;

    return res.status(400).json({ error: `Invalid kind parameter: ${kind}` });

  } catch (error: any) {
    console.error('❌ Gemini API Error:', error);

    // Detailed error logging
    if (error?.message) console.error('Error message:', error.message);
    if (error?.status) console.error('Error status:', error.status);

    // Better error messages
    if (error?.message?.includes('API key')) {
      return res.status(401).json({ error: 'Invalid API key. Please check VITE_GEMINI_API_KEY in Vercel settings.' });
    }
    if (error?.message?.includes('quota') || error?.status === 429) {
      return res.status(429).json({ error: 'All API keys exhausted. Please try again later.' });
    }
    if (error?.status === 404) {
      return res.status(404).json({ error: 'Model not found. Using gemini-1.5-pro-latest.' });
    }

    return res.status(500).json({
      error: error?.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    });
  }
}