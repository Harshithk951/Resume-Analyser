import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { FileData, AnalysisResult } from "../types";
import { calculateDeterministicScore, getScoreStatus } from "./scoringLogic";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = "gemini-3-pro-preview";

let chatSession: Chat | null = null;

export const startGeneralChat = async (): Promise<string> => {
  try {
    chatSession = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: "You are a Senior ATS Architect. You DO NOT give career advice. You ONLY discuss resume technicalities, parsing rules, and keyword optimization. If asked about life, motivation, or job market trends, refuse politely and steer back to the resume document.",
      },
    });
    return "ATS Architect online. I'm ready to audit your resume logic or answer technical questions about resume parsing algorithms.";
  } catch (error) {
    console.error("Failed to start general chat:", error);
    return "ATS System online. Ready for queries.";
  }
};

export const analyzeResume = async (
  fileData: FileData
): Promise<{ text: string; result: AnalysisResult }> => {
  try {
    const base64Data = fileData.base64.split(",")[1];

    chatSession = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });

    const response = await chatSession.sendMessage({
      message: [
        {
          inlineData: {
            mimeType: fileData.mimeType,
            data: base64Data,
          },
        },
        {
          text: "Extract signals and audit this resume. Return strict JSON.",
        },
      ],
    });

    const text = response.text || "";
    
    // Default fallback result
    let result: AnalysisResult = {
        overallScore: 0,
        atsScore: 0,
        contentScore: 0,
        status: "Reject",
        scoreBand: "<60",
        breakdown: {
             baseScore: 0, penalties: [], bonuses: [], parsingScore: 0, contentScore: 0, keywordScore: 0, finalScore: 0
        },
        signals: {
            parsing: { isReadable: false, hasTables: false, hasMultiColumns: false, hasGraphics: false, hasStandardHeaders: false, hasContactInHeader: false },
            content: { totalBulletPoints: 0, bulletsWithMetrics: 0, actionVerbsCount: 0, weakWordsCount: 0, spellingErrors: 0, missingSections: [] },
            keywords: { found: [], missing: [] }
        },
        strengths: [],
        criticalIssues: [],
        improvements: [],
        keywords: { missing: [], present: [], density: "Low", recommendation: "" },
        priorityActions: []
    };

    // Extract JSON block
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        
        // --- DETERMINISTIC SCORING LAYER ---
        // We take the AI's "signals" and feed them into our math engine.
        // We ignore any scores the AI might have Hallucinated.
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
                    present: parsed.signals.keywords.found,
                    missing: parsed.signals.keywords.missing,
                    density: breakdown.keywordScore > 70 ? "High" : "Low",
                    recommendation: breakdown.keywordScore > 70 ? "Good keyword matching." : "Add more hard skills from the job description."
                }
            };
        }
      } catch (e) {
        console.error("Failed to parse analysis JSON", e);
      }
    }

    // Clean text for display (remove JSON block)
    const cleanText = text.replace(/```json\n[\s\S]*?\n```/, "").trim();

    return { text: cleanText, result };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const sendChatMessage = async (message: string): Promise<string> => {
  if (!chatSession) {
    await startGeneralChat();
  }

  if (!chatSession) {
     throw new Error("Could not initialize chat session.");
  }

  try {
    const response = await chatSession.sendMessage({
      message: message,
    });
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
};