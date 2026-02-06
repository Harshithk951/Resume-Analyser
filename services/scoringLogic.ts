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
  // START MUCH LOWER - Must earn points through quality (MNC-FOCUSED)
  let parsingScore = 70;  // Start at 70, not 100
  let contentScore = 30;  // Start at 30 - very strict
  let keywordScore = 40;  // Start at 40
  const penalties: string[] = [];
  const bonuses: string[] = [];

  // ==================== PARSING SCORE (30% weight) ====================
  // Reduced weight - content matters more for MNCs

  if (!signals.parsing.isReadable) {
    parsingScore -= 50;
    penalties.push("Unreadable format (-50)");
  }

  // Stricter penalties for ATS issues
  if (signals.parsing.hasTables) {
    parsingScore -= 20;
    penalties.push("Tables detected (-20)");
  }

  if (signals.parsing.hasMultiColumns) {
    parsingScore -= 15;
    penalties.push("Multi-column layout (-15)");
  }

  if (signals.parsing.hasGraphics) {
    parsingScore -= 15;
    penalties.push("Graphics/images (-15)");
  }

  if (signals.parsing.hasContactInHeader) {
    parsingScore -= 15;
    penalties.push("Contact in header (-15)");
  }

  // Reward clean format
  if (signals.parsing.hasStandardHeaders) {
    bonuses.push("Standard headers (+15)");
    parsingScore = Math.min(100, parsingScore + 15);
  }

  // Big bonus for perfect ATS format
  if (!signals.parsing.hasTables && !signals.parsing.hasGraphics &&
    !signals.parsing.hasMultiColumns && signals.parsing.hasStandardHeaders) {
    bonuses.push("Perfect ATS format (+20)");
    parsingScore = Math.min(100, parsingScore + 20);
  }

  // ==================== CONTENT SCORE (45% weight - INCREASED) ====================
  // This is what MNCs care about most

  const metricRatio = signals.content.totalBulletPoints > 0
    ? signals.content.bulletsWithMetrics / signals.content.totalBulletPoints
    : 0;

  // STRICT metric requirements - quantification is MANDATORY for high scores
  if (metricRatio >= 0.8) {
    bonuses.push("Excellent quantification: 80%+ bullets have metrics (+40)");
    contentScore = Math.min(100, contentScore + 40);
  } else if (metricRatio >= 0.6) {
    bonuses.push("Good quantification: 60%+ bullets have metrics (+25)");
    contentScore = Math.min(100, contentScore + 25);
  } else if (metricRatio >= 0.4) {
    bonuses.push("Moderate quantification: 40%+ bullets have metrics (+15)");
    contentScore = Math.min(100, contentScore + 15);
  } else if (metricRatio < 0.3 && signals.content.totalBulletPoints > 0) {
    contentScore -= 25;
    penalties.push("Low metrics usage - MNCs require quantified impact (-25)");
  }

  // STRICT action verb requirements
  if (signals.content.actionVerbsCount >= 15) {
    bonuses.push("Exceptional action verbs: 15+ strong verbs (+20)");
    contentScore = Math.min(100, contentScore + 20);
  } else if (signals.content.actionVerbsCount >= 10) {
    bonuses.push("Strong action verbs: 10+ verbs (+12)");
    contentScore = Math.min(100, contentScore + 12);
  } else if (signals.content.actionVerbsCount >= 5) {
    bonuses.push("Adequate action verbs (+5)");
    contentScore = Math.min(100, contentScore + 5);
  } else {
    contentScore -= 20;
    penalties.push("Few action verbs - shows lack of ownership (-20)");
  }

  // HEAVY penalty for weak words (vague language is unacceptable)
  const weakWordPenalty = Math.min(signals.content.weakWordsCount * 4, 30); // Increased from 2 to 4
  contentScore -= weakWordPenalty;
  if (signals.content.weakWordsCount > 0) {
    penalties.push(`Weak/vague words: ${signals.content.weakWordsCount} - MNCs want specific achievements (-${weakWordPenalty})`);
  }

  // Spelling errors are unacceptable
  const spellingPenalty = Math.min(signals.content.spellingErrors * 5, 20);
  contentScore -= spellingPenalty;
  if (signals.content.spellingErrors > 0) {
    penalties.push(`Spelling errors: ${signals.content.spellingErrors} - shows lack of attention to detail (-${spellingPenalty})`);
  }

  // Only penalize CRITICAL missing sections
  const criticalMissingSections = signals.content.missingSections.filter(
    section => ['Contact Info', 'Experience', 'Education'].includes(section)
  );
  const missingPenalty = criticalMissingSections.length * 20; // Increased from 15
  contentScore -= missingPenalty;
  if (criticalMissingSections.length > 0) {
    penalties.push(`Missing critical sections: ${criticalMissingSections.join(', ')} (-${missingPenalty})`);
  }

  // Bonus for good structure
  if (signals.content.totalBulletPoints >= 12 && signals.content.totalBulletPoints <= 25) {
    bonuses.push("Well-structured experience section (+8)");
    contentScore = Math.min(100, contentScore + 8);
  }

  // ==================== KEYWORD SCORE (25% weight) ====================
  // Modern tech stack is essential for MNCs

  const totalKeywords = signals.keywords.found.length + signals.keywords.missing.length;
  const keywordRatio = totalKeywords > 0
    ? signals.keywords.found.length / totalKeywords
    : 0.3; // Default to 30% if no analysis (penalty)

  keywordScore = Math.round(keywordRatio * 100);

  // STRICT keyword requirements - modern tech stack is essential
  if (signals.keywords.found.length >= 20) {
    bonuses.push("Exceptional skills coverage: 20+ keywords (+25)");
    keywordScore = Math.min(100, keywordScore + 25);
  } else if (signals.keywords.found.length >= 15) {
    bonuses.push("Comprehensive skills: 15+ keywords (+15)");
    keywordScore = Math.min(100, keywordScore + 15);
  } else if (signals.keywords.found.length >= 10) {
    bonuses.push("Good skills coverage: 10+ keywords (+8)");
    keywordScore = Math.min(100, keywordScore + 8);
  } else if (signals.keywords.found.length < 5) {
    penalties.push(`Limited skills: only ${signals.keywords.found.length} keywords - MNCs need diverse tech stack (-20)`);
    keywordScore -= 20;
  }

  // Penalty for poor keyword match
  if (keywordScore < 30) {
    penalties.push(`Very low keyword match: ${keywordScore}% - missing critical skills (-15)`);
    keywordScore -= 15;
  } else if (keywordScore >= 85) {
    bonuses.push("Excellent keyword match: 85%+ (+10)");
    keywordScore = Math.min(100, keywordScore + 10);
  }

  // Ensure scores are within bounds
  parsingScore = Math.max(0, Math.min(100, parsingScore));
  contentScore = Math.max(0, Math.min(100, contentScore));
  keywordScore = Math.max(0, Math.min(100, keywordScore));

  // Final weighted score - Content matters most for MNCs
  const finalScore = Math.round(
    parsingScore * 0.30 +   // Reduced from 0.40
    contentScore * 0.45 +   // Increased from 0.35
    keywordScore * 0.25     // Same
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

export function getScoreStatus(score: number): { label: string; color: string; description: string } {
  if (score >= 90) {
    return {
      label: "EXCEPTIONAL - FAANG Ready",
      color: "text-green-600",
      description: "Outstanding resume! Competitive for top-tier MNCs like Google, Meta, Amazon."
    };
  } else if (score >= 80) {
    return {
      label: "EXCELLENT - Top MNC Ready",
      color: "text-green-500",
      description: "Strong resume! Competitive for leading product and service companies."
    };
  } else if (score >= 70) {
    return {
      label: "GOOD - Solid Foundation",
      color: "text-blue-600",
      description: "Good resume with room for improvement to be competitive for top MNCs."
    };
  } else if (score >= 60) {
    return {
      label: "FAIR - Needs Improvement",
      color: "text-yellow-600",
      description: "Decent resume but needs significant improvements for top-tier companies."
    };
  } else if (score >= 50) {
    return {
      label: "AVERAGE - Major Improvements Needed",
      color: "text-orange-600",
      description: "Below average. Requires major improvements to be competitive."
    };
  } else {
    return {
      label: "NEEDS WORK - Critical Issues",
      color: "text-red-600",
      description: "Significant issues found. Address critical problems before applying to MNCs."
    };
  }
}