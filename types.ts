export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isAnalysis?: boolean;
}

export interface CriticalIssue {
  title: string;
  impact: number; // This will now be calculated, but kept for UI compatibility
  severity: 'critical' | 'high' | 'medium' | 'low';
  explanation: string;
  fix: string;
}

export interface Improvement {
  section: string;
  before: string;
  after: string;
  impact: number;
  reasoning: string;
}

export interface Keywords {
  missing: string[];
  present: string[];
  density: string;
  recommendation: string;
}

export interface PriorityAction {
  rank: number;
  action: string;
  impact: string;
  urgency: string;
  timeEstimate: string;
}

// Raw Signals from Gemini (No scores, just facts)
export interface AnalysisSignals {
  parsing: {
    isReadable: boolean;
    hasTables: boolean;
    hasMultiColumns: boolean;
    hasGraphics: boolean;
    hasStandardHeaders: boolean;
    hasContactInHeader: boolean;
  };
  content: {
    totalBulletPoints: number;
    bulletsWithMetrics: number; // How many bullets have % or $ or numbers
    actionVerbsCount: number;
    weakWordsCount: number;
    spellingErrors: number;
    missingSections: string[];
  };
  keywords: {
    found: string[];
    missing: string[];
  };
}

// Calculated Scores based on Signals
export interface ScoringBreakdown {
  baseScore: number;
  penalties: {
    reason: string;
    points: number;
  }[];
  bonuses: {
    reason: string;
    points: number;
  }[];
  parsingScore: number;
  contentScore: number;
  keywordScore: number;
  finalScore: number;
}

export interface AnalysisResult {
  // Legacy fields for UI compatibility, but derived from ScoringBreakdown
  overallScore: number;
  atsScore: number;
  contentScore: number;
  
  // New Strict Fields
  status: string; // "Strong Pass", "Likely Pass", "Borderline", "Reject"
  scoreBand: string; // e.g., "75-80"
  breakdown: ScoringBreakdown;
  signals: AnalysisSignals;

  strengths: string[];
  criticalIssues: CriticalIssue[];
  improvements: Improvement[];
  keywords: Keywords;
  priorityActions: PriorityAction[];
  vocabulary?: {
      weakWords: string[];
      suggestedVerbs: string[];
  };
}

export enum AppStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  CHATTING = 'CHATTING',
  ERROR = 'ERROR'
}

export interface FileData {
  file: File;
  base64: string;
  mimeType: string;
}