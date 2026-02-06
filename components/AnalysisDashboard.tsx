import React, { useState } from 'react';
import { AnalysisResult, ScoreBreakdown, PenaltyOrBonus } from '../types';
import { AlertTriangle, ArrowRight, X, Lock, Info, ChevronDown, ChevronUp, RefreshCw, CheckCircle2, Search, FileText, Download, Copy } from 'lucide-react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { copyToClipboard } from '../utils/clipboard';
import { Toast } from './Toast';

interface AnalysisDashboardProps {
  result: AnalysisResult;
  fileName: string;
  onReset: () => void;
}

const CircularScore: React.FC<{ score: number; label: string; color: string; subLabel?: string }> = ({ score, label, color, subLabel }) => {
  const data = [{ name: 'score', value: score, fill: color }];

  return (
    <div className="flex flex-col items-center p-2">
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full blur-xl opacity-30" style={{ background: color }}></div>

        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="75%" outerRadius="95%"
            barSize={12}
            data={data}
            startAngle={90} endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background={{ fill: 'rgba(241, 245, 249, 0.3)' }} dataKey="value" cornerRadius={50} />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Glass circle in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="bg-white/40 backdrop-blur-md rounded-full w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex flex-col items-center justify-center border border-white/60 shadow-lg">
            <span className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-br from-slate-700 to-slate-900 bg-clip-text text-transparent">{score}</span>
            {subLabel && <span className="text-[9px] md:text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-0.5 text-center px-1 leading-tight">{subLabel}</span>}
          </div>
        </div>
      </div>
      <h3 className="mt-3 sm:mt-4 font-bold text-slate-800 text-sm sm:text-base md:text-lg text-center leading-tight">{label}</h3>
    </div>
  );
};

const TransparencyPanel: React.FC<{ breakdown: ScoreBreakdown }> = ({ breakdown }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-8 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-lg border border-white/60 shadow-lg print:border-slate-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white/30 hover:bg-white/50 transition-all no-print backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm sm:text-base">
          <Lock className="w-4 h-4 text-slate-600" />
          Transparency: How this score was calculated
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
      </button>

      {(isOpen || (typeof window !== 'undefined' && window.matchMedia('print').matches)) && (
        <div className="p-4 sm:p-6 bg-white/40 backdrop-blur-md space-y-4">
          <div>
            <h4 className="font-bold text-red-600 mb-2 flex items-center gap-2 text-sm sm:text-base"><ArrowRight className="w-4 h-4" /> Penalties Applied</h4>
            {breakdown.penalties.length > 0 ? (
              <ul className="space-y-2">
                {breakdown.penalties.map((p: PenaltyOrBonus, i: number) => (
                  <li key={i} className="flex justify-between text-xs sm:text-sm bg-white/40 backdrop-blur-sm rounded-lg p-2 border border-red-100/50">
                    <span className="text-slate-700 pr-2">{p.reason}</span>
                    <span className="font-mono font-bold text-red-600 whitespace-nowrap">{p.points}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs sm:text-sm text-slate-500 italic bg-white/30 backdrop-blur-sm rounded-lg p-3">No penalties detected.</p>
            )}
          </div>

          <div>
            <h4 className="font-bold text-green-600 mb-2 flex items-center gap-2 text-sm sm:text-base"><ArrowRight className="w-4 h-4" /> Bonuses Earned</h4>
            {breakdown.bonuses.length > 0 ? (
              <ul className="space-y-2">
                {breakdown.bonuses.map((p: PenaltyOrBonus, i: number) => (
                  <li key={i} className="flex justify-between text-xs sm:text-sm bg-white/40 backdrop-blur-sm rounded-lg p-2 border border-green-100/50">
                    <span className="text-slate-700 pr-2">{p.reason}</span>
                    <span className="font-mono font-bold text-green-600 whitespace-nowrap">+{p.points}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs sm:text-sm text-slate-500 italic bg-white/30 backdrop-blur-sm rounded-lg p-3">No bonuses earned.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result, fileName, onReset }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setToastMessage('Copied to clipboard!');
      setShowToast(true);
    } else {
      setToastMessage('Failed to copy');
      setShowToast(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-20 print:bg-white print:pb-0">
      {/* Header Section - Lighter gradient */}
      <div className="w-full bg-gradient-to-r from-indigo-500/90 via-purple-500/90 to-pink-500/90 backdrop-blur-xl text-white pt-8 pb-24 md:pb-32 px-4 sm:px-6 header-bg print:hidden relative overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="w-full max-w-[95%] 2xl:max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="w-full md:w-auto">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight drop-shadow-lg">Resume Audit</h1>
              <span className="bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-lg">
                ATS Mode
              </span>
            </div>
            <p className="text-white/90 text-sm sm:text-lg font-medium flex items-center gap-2 truncate drop-shadow">
              <FileText className="w-4 h-4 shrink-0" /> <span className="truncate max-w-[200px] sm:max-w-md">{fileName}</span>
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 md:flex-none justify-center bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30 font-bold py-3 px-6 rounded-2xl shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 flex items-center gap-2 text-sm sm:text-base"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              Report
            </button>
            <button
              onClick={onReset}
              className="flex-1 md:flex-none justify-center bg-white text-indigo-600 hover:bg-white/95 font-bold py-3 px-6 sm:px-8 rounded-2xl shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 flex items-center gap-2 text-sm sm:text-base"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              New Audit
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Card - Glass Effect */}
      <div className="w-full max-w-[95%] 2xl:max-w-[1800px] mx-auto px-4 md:px-6 -mt-12 md:-mt-20 dashboard-container print:mt-0 print:px-0">
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-purple-200/50 p-5 sm:p-8 md:p-12 border border-white/60 relative overflow-hidden print:shadow-none print:rounded-none print:border-none print:bg-white">

          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 pointer-events-none"></div>

          <div className="relative z-10">
            {/* Top Status Bar */}
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 md:mb-12 border-b border-white/40 pb-6 md:pb-8">
              <div className="flex-1">
                {/* Print Only Header Info */}
                <div className="hidden print:block mb-4">
                  <h1 className="text-3xl font-black text-slate-900 mb-1">ResumeOptima Audit</h1>
                  <p className="text-slate-500">File: {fileName}</p>
                  <p className="text-slate-400 text-sm">Generated on {new Date().toLocaleDateString()}</p>
                </div>

                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Final Verdict</h2>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <span className={`text-3xl sm:text-4xl font-black ${result.status === "critical" ? "bg-gradient-to-r from-red-600 to-red-500" :
                    result.status === "needs_work" ? "bg-gradient-to-r from-yellow-600 to-orange-500" :
                      "bg-gradient-to-r from-emerald-600 to-green-500"
                    } bg-clip-text text-transparent drop-shadow`}>
                    {result.status}
                  </span>
                  <span className="px-3 py-1 bg-white/60 backdrop-blur-sm text-slate-700 rounded-xl text-xs sm:text-sm font-bold border border-white/60 whitespace-nowrap shadow-sm">
                    Band: {result.scoreBand}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 sm:gap-8 overflow-x-auto pb-2 md:pb-0">
                <div className="min-w-fit bg-white/40 backdrop-blur-sm rounded-xl p-3 border border-white/50">
                  <span className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase mb-1">Pass 1: Parsing</span>
                  <span className={`font-bold text-base sm:text-lg flex items-center gap-1 ${result.atsScore > 60 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.atsScore > 60 ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    {result.atsScore > 60 ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                <div className="min-w-fit bg-white/40 backdrop-blur-sm rounded-xl p-3 border border-white/50">
                  <span className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase mb-1">Pass 2: Content</span>
                  <span className={`font-bold text-base sm:text-lg flex items-center gap-1 ${result.contentScore > 60 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {result.contentScore > 60 ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {result.contentScore > 60 ? 'OPTIMIZED' : 'NEEDS WORK'}
                  </span>
                </div>
              </div>
            </div>

            {/* JD Keywords Section (Conditional) */}
            {result.jdKeywords && (
              <div className="mb-8 page-break-inside-avoid">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" /> Job Description Match
                  </h3>
                  <span className={`px-2 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-bold border backdrop-blur-sm shadow-sm ${result.jdKeywords.matchPercentage >= 80
                      ? "bg-green-100/60 border-green-200/60 text-green-700"
                      : result.jdKeywords.matchPercentage >= 60
                        ? "bg-yellow-100/60 border-yellow-200/60 text-yellow-700"
                        : "bg-red-100/60 border-red-200/60 text-red-700"
                    }`}>
                    Match: {result.jdKeywords.matchPercentage}%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {/* Matched JD Requirements */}
                  <div className="border border-white/60 bg-green-50/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-lg">
                    <div className="flex items-center gap-2 mb-4 text-green-800 font-bold text-xs sm:text-sm uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4 text-green-600" /> Matched Requirements ({result.jdKeywords.matched.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.jdKeywords.matched.map((kw, i) => (
                        <span key={i} className="bg-green-100/70 backdrop-blur-sm text-green-800 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold print:border print:border-green-300 shadow-sm">
                          {kw}
                        </span>
                      ))}
                      {result.jdKeywords.matched.length === 0 && <span className="text-slate-400 italic text-xs sm:text-sm">No JD requirements matched.</span>}
                    </div>
                  </div>

                  {/* Missing JD Requirements */}
                  <div className="border border-white/60 bg-red-50/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 print:bg-white shadow-lg">
                    <div className="flex items-center gap-2 mb-4 text-red-800 font-bold text-xs sm:text-sm uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-red-500" /> Missing Requirements ({result.jdKeywords.missing.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.jdKeywords.missing.map((kw, i) => (
                        <span key={i} className="bg-red-100/70 backdrop-blur-sm border border-red-200/60 text-red-700 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-sm">
                          {kw}
                        </span>
                      ))}
                      {result.jdKeywords.missing.length === 0 && <span className="text-green-600 italic text-xs sm:text-sm">All JD requirements met!</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Scores Section - Glass Circles */}
            <div className={`grid ${result.jdMatchScore ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'} gap-y-6 gap-x-2 sm:gap-8 md:gap-12 mb-8 page-break-inside-avoid`}>
              <div className={`${result.jdMatchScore ? '' : 'col-span-2 md:col-span-1'} flex justify-center`}>
                <CircularScore score={result.overallScore} label="Overall Score" color="#6366f1" subLabel={result.scoreBand} />
              </div>
              <div className="flex justify-center">
                <CircularScore score={result.atsScore} label="Parsing Logic" color="#3b82f6" subLabel="Weight: 30%" />
              </div>
              <div className="flex justify-center">
                <CircularScore score={result.contentScore} label="Content Impact" color="#10b981" subLabel="Weight: 40%" />
              </div>
              {result.jdMatchScore && (
                <div className="flex justify-center">
                  <CircularScore score={result.jdMatchScore} label="JD Match" color="#f59e0b" subLabel="ALIGNMENT" />
                </div>
              )}
            </div>

            <div className="page-break-inside-avoid">
              <TransparencyPanel breakdown={result.breakdown} />
            </div>

            <div className="mt-8 mb-12 sm:mb-16 p-4 bg-amber-100/40 backdrop-blur-sm border border-amber-200/60 rounded-2xl flex gap-3 text-sm text-amber-900 print:border-slate-300 print:bg-white shadow-sm">
              <Info className="w-5 h-5 shrink-0" />
              <p className="text-xs sm:text-sm"><strong>Simulator Disclaimer:</strong> This tool simulates enterprise ATS algorithms (Workday/Taleo). Actual results may vary by employer settings.</p>
            </div>

            {/* Critical Issues Section - Glass Cards */}
            <div className="mb-12 sm:mb-16 page-break-inside-avoid">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 sm:mb-8 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                Critical Fixes Required
              </h3>
              <div className="space-y-6">
                {result.criticalIssues.length > 0 ? result.criticalIssues.map((issue, idx) => (
                  <div key={idx} className="bg-white/60 backdrop-blur-lg border border-white/60 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border-l-red-400 print:border-l-[6px]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <h4 className="text-base sm:text-lg font-bold text-slate-800">{issue.title}</h4>
                      <span className="bg-red-100/70 backdrop-blur-sm text-red-700 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider self-start print:border print:border-red-200 shadow-sm">
                        {issue.severity}
                      </span>
                    </div>
                    <p className="text-slate-700 mb-4 text-sm sm:text-base">{issue.explanation}</p>

                    <div className="bg-slate-100/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-sm print:bg-slate-100 border border-white/40">
                      <strong className="text-slate-800 block mb-1">🔧 Engineering Fix:</strong>
                      <span className="text-slate-700">{issue.fix}</span>
                    </div>
                  </div>
                )) : (
                  <div className="bg-green-100/50 backdrop-blur-sm p-6 rounded-2xl border border-green-200/60 text-green-800 font-medium flex items-center gap-3 text-sm sm:text-base shadow-sm">
                    <CheckCircle2 className="w-6 h-6 shrink-0" /> No critical parsing errors found. Great job!
                  </div>
                )}
              </div>
            </div>

            {/* Suggested Improvements Section */}
            <div className="mb-12 sm:mb-16">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 sm:mb-8">Optimizations (Content Layer)</h3>
              <div className="space-y-6 sm:space-y-8">
                {result.improvements.map((imp, idx) => (
                  <div key={idx} className="bg-white/60 backdrop-blur-lg border border-white/60 rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg hover:shadow-xl transition-all page-break-inside-avoid">
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                      <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider bg-white/50 backdrop-blur-sm px-3 py-1 rounded-lg">Target: {imp.section}</span>
                      <span className="text-green-600 font-bold text-sm bg-green-100/50 backdrop-blur-sm px-3 py-1 rounded-lg">+{imp.impact} pts</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center mb-4">
                      <div className="bg-red-50/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-red-100/60 h-full print:bg-white print:border-slate-200">
                        <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-wider mb-2 block">Current</span>
                        <p className="text-slate-700 text-xs sm:text-sm">{imp.before}</p>
                      </div>

                      <div className="bg-green-50/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-green-100/60 h-full print:bg-white print:border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] sm:text-xs font-bold text-green-600 uppercase tracking-wider">Optimized</span>
                          <button
                            onClick={() => handleCopy(imp.after)}
                            className="px-2 py-1 bg-white/60 backdrop-blur-md rounded-lg text-[10px] font-semibold text-green-700 hover:bg-white/80 transition-all flex items-center gap-1 print:hidden"
                            title="Copy optimized text"
                          >
                            <Copy className="w-3 h-3" />
                            Copy
                          </button>
                        </div>
                        <p className="text-slate-800 font-medium text-xs sm:text-sm">{imp.after}</p>
                      </div>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-600 italic bg-white/30 backdrop-blur-sm rounded-lg p-2">Reason: {imp.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Keyword Analysis Section */}
            <div className="mb-8 page-break-inside-avoid">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <Search className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" /> Keyword Gap Analysis
                </h3>
                <span className={`px-2 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-bold border backdrop-blur-sm shadow-sm ${result.keywords.density === "High" ? "bg-green-100/60 border-green-200/60 text-green-700" : "bg-yellow-100/60 border-yellow-200/60 text-yellow-700"
                  }`}>
                  Density: {result.keywords.density}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* Present */}
                <div className="border border-white/60 bg-white/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold text-xs sm:text-sm uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-green-600" /> Matched Signals
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.present.map((kw, i) => (
                      <span key={i} className="bg-slate-100/70 backdrop-blur-sm text-slate-700 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold print:border print:border-slate-300 shadow-sm">
                        {kw}
                      </span>
                    ))}
                    {result.keywords.present.length === 0 && <span className="text-slate-400 italic text-xs sm:text-sm">No significant keywords found.</span>}
                  </div>
                </div>

                {/* Missing */}
                <div className="border border-white/60 bg-slate-50/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 print:bg-white shadow-lg">
                  <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold text-xs sm:text-sm uppercase tracking-wider">
                    <X className="w-4 h-4 text-red-500" /> Missing / Recommended
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.missing.map((kw, i) => (
                      <span key={i} className="bg-white/70 backdrop-blur-sm border border-slate-200/60 text-slate-600 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-sm opacity-70 dashed print:opacity-100">
                        {kw}
                      </span>
                    ))}
                    {result.keywords.missing.length === 0 && <span className="text-green-600 italic text-xs sm:text-sm">No critical gaps!</span>}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs sm:text-sm text-slate-600 bg-white/40 backdrop-blur-sm rounded-lg p-3">{result.keywords.recommendation}</p>
            </div>

          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="text-center mt-8 sm:mt-12 mb-4 px-4 no-print">
        <p className="text-slate-500 text-[10px] sm:text-xs font-medium">Engineered with Gemini 3 Pro Vision • Deterministic Scoring Engine v1.0</p>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};