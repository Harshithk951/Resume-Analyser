import { AnalysisSignals, ScoringBreakdown } from "../types";

export const calculateDeterministicScore = (signals: AnalysisSignals): ScoringBreakdown => {
  let parsingScore = 100;
  let contentScore = 70; // Start at base 70 for content
  let keywordScore = 0;
  
  const penalties: { reason: string; points: number }[] = [];
  const bonuses: { reason: string; points: number }[] = [];

  // --- 1. PARSING SCORE (Weight: 30%) ---
  // Start at 100, deduct for errors.
  
  if (!signals.parsing.isReadable) {
    parsingScore = 0;
    penalties.push({ reason: "Document Text Not Selectable/Readable", points: -100 });
  } else {
    if (signals.parsing.hasTables) {
      parsingScore -= 20;
      penalties.push({ reason: "Tables Detected (Parsing Risk)", points: -20 });
    }
    if (signals.parsing.hasMultiColumns) {
      parsingScore -= 15;
      penalties.push({ reason: "Multi-column Layout Detected", points: -15 });
    }
    if (signals.parsing.hasGraphics) {
      parsingScore -= 10;
      penalties.push({ reason: "Graphics/Icons Detected", points: -10 });
    }
    if (!signals.parsing.hasStandardHeaders) {
      parsingScore -= 15;
      penalties.push({ reason: "Non-Standard Section Headers", points: -15 });
    }
    if (signals.parsing.hasContactInHeader) {
      parsingScore -= 15;
      penalties.push({ reason: "Contact Info in Header/Footer", points: -15 });
    }
  }
  parsingScore = Math.max(0, parsingScore);

  // --- 2. CONTENT SCORE (Weight: 40%) ---
  // Impact driven by metrics and action verbs.
  
  // Metric Ratio (Bullets with numbers / Total Bullets)
  const metricRatio = signals.content.totalBulletPoints > 0 
    ? signals.content.bulletsWithMetrics / signals.content.totalBulletPoints 
    : 0;

  if (metricRatio > 0.4) {
    contentScore += 20;
    bonuses.push({ reason: "High Metric Density (>40% bullets quantified)", points: +20 });
  } else if (metricRatio > 0.2) {
    contentScore += 10;
    bonuses.push({ reason: "Good Metric Usage", points: +10 });
  } else {
    contentScore -= 10;
    penalties.push({ reason: "Low Metric Density (Few numbers/results)", points: -10 });
  }

  // Weak Words
  if (signals.content.weakWordsCount > 3) {
    const deduct = Math.min(10, signals.content.weakWordsCount * 2);
    contentScore -= deduct;
    penalties.push({ reason: `Weak Action Verbs (${signals.content.weakWordsCount} instances)`, points: -deduct });
  }

  // Missing Sections
  signals.content.missingSections.forEach(section => {
    contentScore -= 10;
    penalties.push({ reason: `Missing Critical Section: ${section}`, points: -10 });
  });

  // Spelling
  if (signals.content.spellingErrors > 0) {
    contentScore -= 5;
    penalties.push({ reason: "Spelling/Grammar Errors Detected", points: -5 });
  }

  contentScore = Math.min(100, Math.max(0, contentScore));

  // --- 3. KEYWORD SCORE (Weight: 30%) ---
  const foundCount = signals.keywords.found.length;
  const missingCount = signals.keywords.missing.length;
  const totalKeywords = foundCount + missingCount;
  
  if (totalKeywords > 0) {
    keywordScore = Math.round((foundCount / totalKeywords) * 100);
  } else {
    keywordScore = 50; // Neutral if no keywords found/provided
  }

  // --- FINAL CALCULATION ---
  // Weights: Parsing 30%, Content 40%, Keywords 30%
  const finalScore = Math.round(
    (parsingScore * 0.3) + 
    (contentScore * 0.4) + 
    (keywordScore * 0.3)
  );

  return {
    baseScore: 100, // Conceptually
    parsingScore,
    contentScore,
    keywordScore,
    finalScore,
    penalties,
    bonuses
  };
};

export const getScoreStatus = (score: number): { label: string; band: string; color: string } => {
  if (score >= 90) return { label: "Strong Pass", band: "90-100", color: "text-emerald-600" };
  if (score >= 75) return { label: "Likely Pass", band: "75-89", color: "text-blue-600" };
  if (score >= 60) return { label: "Borderline", band: "60-74", color: "text-yellow-600" };
  return { label: "ATS Reject", band: "<60", color: "text-red-600" };
};
