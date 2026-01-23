import { GoogleGenAI } from '@google/genai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// IMPORTANT: Use process.env (not import.meta.env) in serverless functions
const API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('⚠️ API KEY NOT FOUND IN ENVIRONMENT');
}

const genAI = new GoogleGenAI({ apiKey: API_KEY || '' });

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
    if (!API_KEY) {
      console.error('❌ API Key missing at runtime');
      return res.status(500).json({ error: 'API key not configured. Please add VITE_GEMINI_API_KEY to Vercel environment variables.' });
    }

    // Handle resume analysis
    if (kind === 'analyze') {
      if (!base64 || !mimeType) {
        return res.status(400).json({ error: 'Missing base64 or mimeType for analysis' });
      }

      console.log('🔍 Starting resume analysis...');

      const result = await genAI.models.generateContent({
        model: 'gemini-1.5-pro',
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

      const response = result;
      const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

      console.log('✅ Analysis complete, response length:', text.length);

      return res.status(200).json({ text });
    }

    // Handle chat
    if (kind === 'chat') {
      if (!message) {
        return res.status(400).json({ error: 'Missing message for chat' });
      }

      console.log('💬 Processing chat message...');

      const result = await genAI.models.generateContent({
        model: 'gemini-1.5-flash',
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

      const response = result;
      const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

      console.log('✅ Chat response generated');

      return res.status(200).json({ text });
    }

    return res.status(400).json({ error: `Invalid kind parameter: ${kind}` });

  } catch (error: any) {
    console.error('❌ Gemini API Error:', error);
    
    // Detailed error logging
    if (error?.message) {
      console.error('Error message:', error.message);
    }
    if (error?.status) {
      console.error('Error status:', error.status);
    }
    
    // Better error messages
    if (error?.message?.includes('API key')) {
      return res.status(401).json({ error: 'Invalid API key. Please check VITE_GEMINI_API_KEY in Vercel settings.' });
    }
    if (error?.message?.includes('quota') || error?.status === 429) {
      return res.status(429).json({ error: 'API quota exceeded. Please try again later.' });
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