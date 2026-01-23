interface Signals {
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

interface ScoreBreakdown {
  baseScore: number;
  penalties: string[];
  bonuses: string[];
  parsingScore: number;
  contentScore: number;
  keywordScore: number;
  finalScore: number;
}

export function calculateDeterministicScore(signals: Signals): ScoreBreakdown {
  let parsingScore = 100;
  let contentScore = 100;
  let keywordScore = 100;
  const penalties: string[] = [];
  const bonuses: string[] = [];

  // PARSING SCORE (40% weight)
  if (!signals.parsing.isReadable) {
    parsingScore -= 50;
    penalties.push("Unreadable format (-50)");
  }
  if (signals.parsing.hasTables) {
    parsingScore -= 15;
    penalties.push("Tables detected (-15)");
  }
  if (signals.parsing.hasMultiColumns) {
    parsingScore -= 10;
    penalties.push("Multi-column layout (-10)");
  }
  if (signals.parsing.hasGraphics) {
    parsingScore -= 10;
    penalties.push("Graphics/images (-10)");
  }
  if (signals.parsing.hasContactInHeader) {
    parsingScore -= 20;
    penalties.push("Contact in header (-20)");
  }
  if (signals.parsing.hasStandardHeaders) {
    bonuses.push("Standard headers (+5)");
    parsingScore = Math.min(100, parsingScore + 5);
  }

  // CONTENT SCORE (35% weight)
  const metricRatio = signals.content.totalBulletPoints > 0
    ? signals.content.bulletsWithMetrics / signals.content.totalBulletPoints
    : 0;
  
  if (metricRatio < 0.3) {
    contentScore -= 20;
    penalties.push("Low metrics usage (-20)");
  }
  
  if (signals.content.actionVerbsCount < 5) {
    contentScore -= 15;
    penalties.push("Few action verbs (-15)");
  } else {
    bonuses.push("Good action verbs (+5)");
    contentScore = Math.min(100, contentScore + 5);
  }
  
  contentScore -= signals.content.weakWordsCount * 2;
  if (signals.content.weakWordsCount > 0) {
    penalties.push(`Weak words: ${signals.content.weakWordsCount} (-${signals.content.weakWordsCount * 2})`);
  }
  
  contentScore -= signals.content.spellingErrors * 5;
  if (signals.content.spellingErrors > 0) {
    penalties.push(`Spelling errors: ${signals.content.spellingErrors} (-${signals.content.spellingErrors * 5})`);
  }
  
  contentScore -= signals.content.missingSections.length * 10;
  if (signals.content.missingSections.length > 0) {
    penalties.push(`Missing sections: ${signals.content.missingSections.join(', ')} (-${signals.content.missingSections.length * 10})`);
  }

  // KEYWORD SCORE (25% weight)
  const totalKeywords = signals.keywords.found.length + signals.keywords.missing.length;
  const keywordRatio = totalKeywords > 0
    ? signals.keywords.found.length / totalKeywords
    : 0;
  
  keywordScore = Math.round(keywordRatio * 100);
  
  if (keywordScore < 50) {
    penalties.push(`Low keyword match: ${keywordScore}% (-${100 - keywordScore})`);
  } else if (keywordScore > 80) {
    bonuses.push("Excellent keyword match (+10)");
  }

  // Ensure scores are within bounds
  parsingScore = Math.max(0, Math.min(100, parsingScore));
  contentScore = Math.max(0, Math.min(100, contentScore));
  keywordScore = Math.max(0, Math.min(100, keywordScore));

  // Final weighted score
  const finalScore = Math.round(
    parsingScore * 0.4 + 
    contentScore * 0.35 + 
    keywordScore * 0.25
  );

  return {
    baseScore: 100,
    penalties,
    bonuses,
    parsingScore,
    contentScore,
    keywordScore,
    finalScore: Math.max(0, Math.min(100, finalScore)),
  };
}

export function getScoreStatus(score: number): { label: string; band: string } {
  if (score >= 85) return { label: "excellent", band: "85-100" };
  if (score >= 70) return { label: "good", band: "70-84" };
  if (score >= 50) return { label: "needs_work", band: "50-69" };
  return { label: "critical", band: "<50" };
}