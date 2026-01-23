import { SYSTEM_PROMPT } from "../constants";
import { AnalysisResult } from "../types";
import { calculateDeterministicScore, getScoreStatus } from "./scoringLogic";
import { GoogleGenAI } from '@google/genai';

// Check if we're in development mode
const isDev = import.meta.env.DEV;
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize Gemini client for direct browser calls in dev mode
let genAI: GoogleGenAI | null = null;
if (isDev && API_KEY) {
  genAI = new GoogleGenAI({ apiKey: API_KEY });
}

interface AnalyzeResumeParams {
  file: File;
  base64: string;
  mimeType: string;
}

async function callGeminiApi<TBody extends Record<string, any>>(body: TBody): Promise<string> {
  // In development with API key, call Gemini directly from browser
  if (isDev && genAI) {
    const { kind, base64, mimeType, systemPrompt, message, systemInstruction } = body;
    
    if (kind === 'analyze') {
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
      return result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
    
    if (kind === 'chat') {
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
      return result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
  }
  
  // In production, use the serverless API
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `Gemini API failed (${res.status})`);
  }
  return data?.text || "";
}

export const startGeneralChat = async (): Promise<string> => {
  try {
    // Serverless is stateless, so we just return a welcome message
    return "ATS Architect online. I'm ready to audit your resume logic or answer technical questions about resume parsing algorithms.";
  } catch (error) {
    console.error("Failed to start general chat:", error);
    return "ATS System online. Ready for queries.";
  }
};

export const analyzeResume = async (
  { base64, mimeType }: Omit<AnalyzeResumeParams, 'file'>
): Promise<{ result: AnalysisResult }> => {
  try {
    // Extract base64 data (remove data URL prefix if present)
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;

    const text = await callGeminiApi({
      kind: "analyze",
      base64: base64Data,
      mimeType: mimeType || 'application/pdf',
      systemPrompt: SYSTEM_PROMPT,
    });
    
    // Default fallback result
    let result: AnalysisResult = {
      overallScore: 0,
      atsScore: 0,
      contentScore: 0,
      status: "critical",
      scoreBand: "<60",
      breakdown: {
        baseScore: 0, 
        penalties: [], 
        bonuses: [], 
        parsingScore: 0, 
        contentScore: 0, 
        keywordScore: 0, 
        finalScore: 0
      },
      signals: {
        parsing: { 
          isReadable: false, 
          hasTables: false, 
          hasMultiColumns: false, 
          hasGraphics: false, 
          hasStandardHeaders: false, 
          hasContactInHeader: false 
        },
        content: { 
          totalBulletPoints: 0, 
          bulletsWithMetrics: 0, 
          actionVerbsCount: 0, 
          weakWordsCount: 0, 
          spellingErrors: 0, 
          missingSections: [] 
        },
        keywords: { 
          found: [], 
          missing: [] 
        }
      },
      strengths: [],
      criticalIssues: [],
      improvements: [],
      keywords: { 
        missing: [], 
        present: [], 
        density: "Low", 
        recommendation: "" 
      },
      priorityActions: []
    };

    // Extract JSON block
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        
        // --- DETERMINISTIC SCORING LAYER ---
        // We take the AI's "signals" and feed them into our math engine.
        // We ignore any scores the AI might have hallucinated.
        if (parsed.signals) {
          const breakdown = calculateDeterministicScore(parsed.signals);
          const statusInfo = getScoreStatus(breakdown.finalScore);
          
          // Reconstruct the full AnalysisResult
          result = {
            ...result, // Defaults
            ...parsed, // AI Feedback (strengths, improvements)
            signals: parsed.signals,
            breakdown: breakdown,
            overallScore: breakdown.finalScore,
            atsScore: breakdown.parsingScore,
            contentScore: breakdown.contentScore,
            status: statusInfo.label,
            scoreBand: statusInfo.band,
            
            // Map keyword data for UI
            keywords: {
              present: parsed.signals.keywords.found || [],
              missing: parsed.signals.keywords.missing || [],
              density: breakdown.keywordScore > 70 ? "High" : breakdown.keywordScore > 40 ? "Moderate" : "Low",
              recommendation: breakdown.keywordScore > 70 
                ? "Good keyword matching." 
                : "Add more hard skills from the job description."
            },
            
            // Ensure arrays exist
            strengths: parsed.strengths || [],
            criticalIssues: parsed.criticalIssues || [],
            improvements: parsed.improvements || [],
            priorityActions: parsed.priorityActions || []
          };
        }
      } catch (e) {
        console.error("Failed to parse analysis JSON", e);
        throw new Error("AI returned invalid response format. Please try again.");
      }
    } else {
      throw new Error("AI response missing required JSON format");
    }

    return { result };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    
    // Better error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Invalid API key. Please check your configuration.');
      }
      if (error.message.includes('quota')) {
        throw new Error('API quota exceeded. Please try again later.');
      }
      if (error.message.includes('429')) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      throw error;
    }
    
    throw new Error('Failed to analyze resume. Please try again.');
  }
};

export const sendChatMessage = async (message: string): Promise<string> => {
  try {
    const text = await callGeminiApi({
      kind: "chat",
      message,
      systemInstruction:
        "You are a Senior ATS Architect. You DO NOT give career advice. You ONLY discuss resume technicalities, parsing rules, and keyword optimization. If asked about life, motivation, or job market trends, refuse politely and steer back to the resume document. Keep responses under 3 sentences unless detailed explanation is requested.",
    });
    return text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
};

// Helper function for chat (if needed in FloatingChat component)
export const chatWithAI = async (message: string, context?: AnalysisResult): Promise<string> => {
  try {
    const contextPrompt = context 
      ? `\n\nContext: User's resume has overall score of ${context.overallScore}/100, ATS score of ${context.atsScore}/100, content score of ${context.contentScore}/100.` 
      : '';
    
    const text = await callGeminiApi({
      kind: "chat",
      message: message + contextPrompt,
      systemInstruction:
        "You are a Senior ATS Architect. You DO NOT give career advice. You ONLY discuss resume technicalities, parsing rules, and keyword optimization. Keep responses concise (2-3 sentences) unless detailed explanation is requested.",
    });
    return text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
};