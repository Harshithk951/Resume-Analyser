export enum AppStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  CHATTING = 'CHATTING',
  ERROR = 'ERROR',
}

export interface CriticalIssue {
  title: string;
  impact: number;
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

export interface PenaltyOrBonus {
  reason: string;
  points: string;
}

export interface ScoreBreakdown {
  baseScore: number;
  penalties: PenaltyOrBonus[];
  bonuses: PenaltyOrBonus[];
  parsingScore: number;
  contentScore: number;
  keywordScore: number;
  finalScore: number;
}

export interface Signals {
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
    bulletsWithMetrics: number;
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

export interface AnalysisResult {
  overallScore: number;
  atsScore: number;
  contentScore: number;
  status: 'excellent' | 'good' | 'needs_work' | 'critical';
  scoreBand: string;
  breakdown: ScoreBreakdown;
  signals: Signals;
  strengths: string[];
  criticalIssues: CriticalIssue[];
  improvements: Improvement[];
  keywords: Keywords;
  priorityActions: PriorityAction[];
}

export interface FileData {
  base64: string;
  mimeType: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}