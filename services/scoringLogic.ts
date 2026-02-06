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
  // ULTRA-STRICT: Start very low - must earn every point (MNC-FOCUSED)
  let parsingScore = 70;  // Start at 70
  let contentScore = 25;  // Reduced from 30 - even stricter
  let keywordScore = 35;  // Reduced from 40
  const penalties: string[] = [];
  const bonuses: string[] = [];

  // ==================== PARSING SCORE (30% weight) ====================
  // Max possible: 90 (even with perfect format)

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

  // REDUCED bonuses - was +15, now +8
  if (signals.parsing.hasStandardHeaders) {
    bonuses.push("Standard headers (+8)");
    parsingScore = Math.min(90, parsingScore + 8); // Cap at 90
  }

  // REDUCED bonus - was +20, now +10
  if (!signals.parsing.hasTables && !signals.parsing.hasGraphics &&
    !signals.parsing.hasMultiColumns && signals.parsing.hasStandardHeaders) {
    bonuses.push("Perfect ATS format (+10)");
    parsingScore = Math.min(90, parsingScore + 10); // Cap at 90
  }

  // Hard cap parsing score at 90
  parsingScore = Math.max(0, Math.min(90, parsingScore));

  // ==================== CONTENT SCORE (45% weight - MOST IMPORTANT) ====================
  // Max without scale/impact: 85
  // Max with scale/impact: 100

  const metricRatio = signals.content.totalBulletPoints > 0
    ? signals.content.bulletsWithMetrics / signals.content.totalBulletPoints
    : 0;

  // REDUCED bonuses - quantification is still important but not enough alone
  if (metricRatio >= 0.8) {
    bonuses.push("Excellent quantification: 80%+ bullets have metrics (+20)"); // Was +40
    contentScore = Math.min(100, contentScore + 20);
  } else if (metricRatio >= 0.6) {
    bonuses.push("Good quantification: 60%+ bullets have metrics (+12)"); // Was +25
    contentScore = Math.min(100, contentScore + 12);
  } else if (metricRatio >= 0.4) {
    bonuses.push("Moderate quantification: 40%+ bullets have metrics (+8)"); // Was +15
    contentScore = Math.min(100, contentScore + 8);
  } else if (metricRatio < 0.3 && signals.content.totalBulletPoints > 0) {
    contentScore -= 25;
    penalties.push("Low metrics usage - MNCs require quantified impact (-25)");
  }

  // REDUCED action verb bonuses
  if (signals.content.actionVerbsCount >= 15) {
    bonuses.push("Exceptional action verbs: 15+ strong verbs (+10)"); // Was +20
    contentScore = Math.min(100, contentScore + 10);
  } else if (signals.content.actionVerbsCount >= 10) {
    bonuses.push("Strong action verbs: 10+ verbs (+6)"); // Was +12
    contentScore = Math.min(100, contentScore + 6);
  } else if (signals.content.actionVerbsCount >= 5) {
    bonuses.push("Adequate action verbs (+3)"); // Was +5
    contentScore = Math.min(100, contentScore + 3);
  } else {
    contentScore -= 20;
    penalties.push("Few action verbs - shows lack of ownership (-20)");
  }

  // HEAVY penalty for weak words (vague language is unacceptable)
  const weakWordPenalty = Math.min(signals.content.weakWordsCount * 5, 35); // Increased from 4 to 5
  contentScore -= weakWordPenalty;
  if (signals.content.weakWordsCount > 0) {
    penalties.push(`Weak/vague words: ${signals.content.weakWordsCount} - MNCs want specific achievements (-${weakWordPenalty})`);
  }

  // Spelling errors are unacceptable
  const spellingPenalty = Math.min(signals.content.spellingErrors * 6, 25); // Increased from 5 to 6
  contentScore -= spellingPenalty;
  if (signals.content.spellingErrors > 0) {
    penalties.push(`Spelling errors: ${signals.content.spellingErrors} - shows lack of attention to detail (-${spellingPenalty})`);
  }

  // Only penalize CRITICAL missing sections
  const criticalMissingSections = signals.content.missingSections.filter(
    section => ['Contact Info', 'Experience', 'Education'].includes(section)
  );
  const missingPenalty = criticalMissingSections.length * 25; // Increased from 20
  contentScore -= missingPenalty;
  if (criticalMissingSections.length > 0) {
    penalties.push(`Missing critical sections: ${criticalMissingSections.join(', ')} (-${missingPenalty})`);
  }

  // REDUCED structure bonus - was +8, now +4
  if (signals.content.totalBulletPoints >= 12 && signals.content.totalBulletPoints <= 25) {
    bonuses.push("Well-structured experience section (+4)"); // Was +8
    contentScore = Math.min(100, contentScore + 4);
  }

  // NEW: Penalties for missing scale/impact indicators
  // These are detected by the AI and should be in the analysis
  // For now, we'll apply a soft cap - content score maxes at 85 without exceptional criteria
  // This will be enforced in the final calculation

  // Ensure content score is within bounds (soft cap at 85 for now)
  contentScore = Math.max(0, Math.min(100, contentScore));

  // ==================== KEYWORD SCORE (25% weight) ====================
  // Max possible: 90

  const totalKeywords = signals.keywords.found.length + signals.keywords.missing.length;
  const keywordRatio = totalKeywords > 0
    ? signals.keywords.found.length / totalKeywords
    : 0.3; // Default to 30% if no analysis (penalty)

  keywordScore = Math.round(keywordRatio * 100);

  // REDUCED keyword bonuses - modern tech stack is important but not enough alone
  if (signals.keywords.found.length >= 20) {
    bonuses.push("Exceptional skills coverage: 20+ keywords (+12)"); // Was +25
    keywordScore = Math.min(90, keywordScore + 12);
  } else if (signals.keywords.found.length >= 15) {
    bonuses.push("Comprehensive skills: 15+ keywords (+8)"); // Was +15
    keywordScore = Math.min(90, keywordScore + 8);
  } else if (signals.keywords.found.length >= 10) {
    bonuses.push("Good skills coverage: 10+ keywords (+4)"); // Was +8
    keywordScore = Math.min(90, keywordScore + 4);
  } else if (signals.keywords.found.length < 5) {
    penalties.push(`Limited skills: only ${signals.keywords.found.length} keywords - MNCs need diverse tech stack (-20)`);
    keywordScore -= 20;
  }

  // Penalty for poor keyword match
  if (keywordScore < 30) {
    penalties.push(`Very low keyword match: ${keywordScore}% - missing critical skills (-15)`);
    keywordScore -= 15;
  } else if (keywordScore >= 85) {
    bonuses.push("Excellent keyword match: 85%+ (+5)"); // Was +10
    keywordScore = Math.min(90, keywordScore + 5);
  }

  // Hard cap keyword score at 90
  keywordScore = Math.max(0, Math.min(90, keywordScore));

  // ==================== FINAL SCORE CALCULATION ====================
  // Apply component caps and weighted calculation

  // Final weighted score - Content matters most for MNCs
  let finalScore = Math.round(
    parsingScore * 0.30 +   // Max contribution: 27 (90 * 0.30)
    contentScore * 0.45 +   // Max contribution: 45 (100 * 0.45)
    keywordScore * 0.25     // Max contribution: 22.5 (90 * 0.25)
  );

  // CRITICAL: Apply ceiling based on content quality
  // Without exceptional scale/impact indicators, cap final score at 88
  // This prevents good-but-not-exceptional resumes from scoring 95+
  if (contentScore < 85) {
    // If content score is below 85, it means no exceptional scale/impact
    // Cap the final score at 88
    finalScore = Math.min(88, finalScore);
  }

  // Additional safety cap: Even with perfect scores, max is 95
  // To get 95+, the AI analysis must explicitly mention scale/impact
  finalScore = Math.min(95, finalScore);

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
  if (score >= 95) {
    return {
      label: "EXCEPTIONAL - FAANG Ready",
      color: "text-green-600",
      description: "Outstanding resume! Competitive for top-tier MNCs like Google, Meta, Amazon. Demonstrates significant scale and impact."
    };
  } else if (score >= 88) {
    return {
      label: "EXCELLENT - Top MNC Ready",
      color: "text-green-500",
      description: "Strong resume! Competitive for leading product and service companies. Shows solid experience and achievements."
    };
  } else if (score >= 75) {
    return {
      label: "GOOD - Solid Foundation",
      color: "text-blue-600",
      description: "Good resume with room for improvement. Add more scale indicators and business impact for top MNCs."
    };
  } else if (score >= 65) {
    return {
      label: "FAIR - Needs Improvement",
      color: "text-yellow-600",
      description: "Decent foundation but needs significant improvements. Focus on quantified achievements and modern tech stack."
    };
  } else if (score >= 50) {
    return {
      label: "AVERAGE - Major Improvements Needed",
      color: "text-orange-600",
      description: "Below average. Requires major improvements to be competitive for MNCs. Add metrics, impact, and technical depth."
    };
  } else {
    return {
      label: "NEEDS WORK - Critical Issues",
      color: "text-red-600",
      description: "Significant issues found. Address critical problems before applying to MNCs."
    };
  }
}