import { GoogleGenAI } from '@google/genai'

type AnalyzeBody = {
  kind: 'analyze'
  base64: string
  mimeType: string
  systemPrompt: string
}

type ChatBody = {
  kind: 'chat'
  message: string
  systemInstruction?: string
}

type Body = AnalyzeBody | ChatBody

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash'

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY
  if (!key) {
    throw new Error('Missing GEMINI_API_KEY (set it in Vercel Environment Variables).')
  }
  return key
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as Body
    const ai = new GoogleGenAI({ apiKey: getApiKey() })

    if (body.kind === 'analyze') {
      const base64Data = body.base64.includes(',') ? body.base64.split(',')[1] : body.base64

      const chat = ai.chats.create({
        model: DEFAULT_MODEL,
        config: { systemInstruction: body.systemPrompt },
      })

      const response = await chat.sendMessage({
        message: [
          { inlineData: { mimeType: body.mimeType, data: base64Data } },
          { text: 'Extract signals and audit this resume. Return strict JSON.' },
        ],
      })

      return res.status(200).json({ text: response.text || '' })
    }

    if (body.kind === 'chat') {
      const chat = ai.chats.create({
        model: DEFAULT_MODEL,
        config: {
          systemInstruction:
            body.systemInstruction ??
            'You are a Senior ATS Architect. You DO NOT give career advice. You ONLY discuss resume technicalities, parsing rules, and keyword optimization.',
        },
      })

      const response = await chat.sendMessage({ message: body.message })
      return res.status(200).json({ text: response.text || '' })
    }

    return res.status(400).json({ error: 'Invalid request body' })
  } catch (e: any) {
    const message = e?.message || 'Unknown error'
    return res.status(500).json({ error: message })
  }
}


