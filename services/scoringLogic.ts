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

  // PARSING SCORE (40% weight) - More lenient on common practices
  if (!signals.parsing.isReadable) {
    parsingScore -= 50;
    penalties.push("Unreadable format (-50)");
  }

  // Reduced penalty for tables - many ATS can handle simple tables
  if (signals.parsing.hasTables) {
    parsingScore -= 5;
    penalties.push("Tables detected (-5)");
  }

  if (signals.parsing.hasMultiColumns) {
    parsingScore -= 10;
    penalties.push("Multi-column layout (-10)");
  }

  if (signals.parsing.hasGraphics) {
    parsingScore -= 10;
    penalties.push("Graphics/images (-10)");
  }

  // Reduced penalty - contact in header is common practice
  if (signals.parsing.hasContactInHeader) {
    parsingScore -= 10;
    penalties.push("Contact in header (-10)");
  }

  // Reward good practices
  if (signals.parsing.hasStandardHeaders) {
    bonuses.push("Standard headers (+10)");
    parsingScore = Math.min(100, parsingScore + 10);
  }

  // Bonus for clean formatting (no tables, graphics, multi-columns)
  if (!signals.parsing.hasTables && !signals.parsing.hasGraphics && !signals.parsing.hasMultiColumns) {
    bonuses.push("Clean, simple format (+10)");
    parsingScore = Math.min(100, parsingScore + 10);
  }

  // CONTENT SCORE (35% weight) - More rewards for good practices
  const metricRatio = signals.content.totalBulletPoints > 0
    ? signals.content.bulletsWithMetrics / signals.content.totalBulletPoints
    : 0;

  // Reward high metric usage
  if (metricRatio >= 0.5) {
    bonuses.push("Excellent quantification: 50%+ bullets have metrics (+15)");
    contentScore = Math.min(100, contentScore + 15);
  } else if (metricRatio < 0.3 && signals.content.totalBulletPoints > 0) {
    contentScore -= 15;
    penalties.push("Low metrics usage (-15)");
  }

  // More nuanced action verb scoring
  if (signals.content.actionVerbsCount >= 10) {
    bonuses.push("Strong action verbs throughout (+10)");
    contentScore = Math.min(100, contentScore + 10);
  } else if (signals.content.actionVerbsCount >= 5) {
    bonuses.push("Good action verbs (+5)");
    contentScore = Math.min(100, contentScore + 5);
  } else if (signals.content.actionVerbsCount < 3) {
    contentScore -= 15;
    penalties.push("Few action verbs (-15)");
  }

  // Reduced penalty for weak words
  const weakWordPenalty = Math.min(signals.content.weakWordsCount * 2, 20); // Cap at -20
  contentScore -= weakWordPenalty;
  if (signals.content.weakWordsCount > 0) {
    penalties.push(`Weak words: ${signals.content.weakWordsCount} (-${weakWordPenalty})`);
  }

  // Reduced spelling error penalty
  const spellingPenalty = Math.min(signals.content.spellingErrors * 3, 15); // Cap at -15
  contentScore -= spellingPenalty;
  if (signals.content.spellingErrors > 0) {
    penalties.push(`Spelling errors: ${signals.content.spellingErrors} (-${spellingPenalty})`);
  }

  // Only penalize truly critical missing sections
  const criticalMissingSections = signals.content.missingSections.filter(
    section => ['Contact Info', 'Experience', 'Education'].includes(section)
  );
  const missingPenalty = criticalMissingSections.length * 15;
  contentScore -= missingPenalty;
  if (criticalMissingSections.length > 0) {
    penalties.push(`Missing critical sections: ${criticalMissingSections.join(', ')} (-${missingPenalty})`);
  }

  // Bonus for having good bullet point count
  if (signals.content.totalBulletPoints >= 10 && signals.content.totalBulletPoints <= 20) {
    bonuses.push("Good bullet point count (+5)");
    contentScore = Math.min(100, contentScore + 5);
  }

  // KEYWORD SCORE (25% weight) - More sophisticated scoring
  const totalKeywords = signals.keywords.found.length + signals.keywords.missing.length;
  const keywordRatio = totalKeywords > 0
    ? signals.keywords.found.length / totalKeywords
    : 0.5; // Default to 50% if no keywords analyzed

  keywordScore = Math.round(keywordRatio * 100);

  // Bonus for comprehensive keyword coverage
  if (signals.keywords.found.length >= 15) {
    bonuses.push("Comprehensive skills coverage: 15+ keywords (+10)");
    keywordScore = Math.min(100, keywordScore + 10);
  } else if (signals.keywords.found.length >= 10) {
    bonuses.push("Good skills coverage: 10+ keywords (+5)");
    keywordScore = Math.min(100, keywordScore + 5);
  }

  if (keywordScore < 40) {
    penalties.push(`Low keyword match: ${keywordScore}% (-${60 - keywordScore})`);
  } else if (keywordScore >= 80) {
    bonuses.push("Excellent keyword match (+5)");
    keywordScore = Math.min(100, keywordScore + 5);
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