import React, { useState } from 'react';
import { AnalysisResult, ScoringBreakdown } from '../types';
import { AlertTriangle, ArrowRight, X, Lock, Info, ChevronDown, ChevronUp, RefreshCw, CheckCircle2, Search, FileText, Download } from 'lucide-react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

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
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" cy="50%" 
            innerRadius="80%" outerRadius="100%" 
            barSize={10} 
            data={data} 
            startAngle={90} endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background={{ fill: '#f1f5f9' }} dataKey="value" cornerRadius={50} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">{score}</span>
          {subLabel && <span className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mt-1 text-center px-1 leading-tight">{subLabel}</span>}
        </div>
      </div>
      <h3 className="mt-2 sm:mt-4 font-bold text-slate-900 text-sm sm:text-base md:text-lg text-center leading-tight">{label}</h3>
    </div>
  );
};

const TransparencyPanel: React.FC<{ breakdown: ScoringBreakdown }> = ({ breakdown }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-8 border border-slate-200 rounded-xl overflow-hidden bg-white print:border-slate-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors no-print"
      >
        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm sm:text-base">
          <Lock className="w-4 h-4 text-slate-500" />
          Transparency: How this score was calculated
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      
      {/* Always show in print, or toggle based on state? For print, usually good to expand all. 
          Here we just respect the state for screen, but force visible for print if desired. 
          Let's keep interactive for now. */}
      {(isOpen || (typeof window !== 'undefined' && window.matchMedia('print').matches)) && (
        <div className="p-4 sm:p-6 bg-white space-y-4">
          <div>
            <h4 className="font-bold text-red-600 mb-2 flex items-center gap-2 text-sm sm:text-base"><ArrowRight className="w-4 h-4" /> Penalties Applied</h4>
            {breakdown.penalties.length > 0 ? (
              <ul className="space-y-2">
                {breakdown.penalties.map((p, i) => (
                  <li key={i} className="flex justify-between text-xs sm:text-sm border-b border-slate-100 pb-1">
                    <span className="text-slate-700 pr-2">{p.reason}</span>
                    <span className="font-mono font-bold text-red-600 whitespace-nowrap">{p.points}</span>
                  </li>
                ))}
              </ul>
            ) : (
               <p className="text-xs sm:text-sm text-slate-500 italic">No penalties detected.</p>
            )}
          </div>
          
          <div>
            <h4 className="font-bold text-green-600 mb-2 flex items-center gap-2 text-sm sm:text-base"><ArrowRight className="w-4 h-4" /> Bonuses Earned</h4>
            {breakdown.bonuses.length > 0 ? (
              <ul className="space-y-2">
                {breakdown.bonuses.map((p, i) => (
                  <li key={i} className="flex justify-between text-xs sm:text-sm border-b border-slate-100 pb-1">
                    <span className="text-slate-700 pr-2">{p.reason}</span>
                    <span className="font-mono font-bold text-green-600 whitespace-nowrap">+{p.points}</span>
                  </li>
                ))}
              </ul>
            ) : (
                <p className="text-xs sm:text-sm text-slate-500 italic">No bonuses earned.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result, fileName, onReset }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 print:bg-white print:pb-0">
      {/* Header Section */}
      <div className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white pt-8 pb-24 md:pb-32 px-4 sm:px-6 header-bg print:hidden">
        <div className="w-full max-w-[95%] 2xl:max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="w-full md:w-auto">
            <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight">Resume Audit</h1>
                <span className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                    ATS Mode
                </span>
            </div>
            <p className="text-slate-300 text-sm sm:text-lg font-medium flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 shrink-0" /> <span className="truncate max-w-[200px] sm:max-w-md">{fileName}</span>
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={handlePrint}
              className="flex-1 md:flex-none justify-center bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 font-bold py-3 px-6 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 text-sm sm:text-base"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              Report
            </button>
            <button 
              onClick={onReset}
              className="flex-1 md:flex-none justify-center bg-white text-slate-900 hover:bg-slate-100 font-bold py-3 px-6 sm:px-8 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 text-sm sm:text-base"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              New Audit
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="w-full max-w-[95%] 2xl:max-w-[1800px] mx-auto px-4 md:px-6 -mt-12 md:-mt-20 dashboard-container print:mt-0 print:px-0">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-5 sm:p-8 md:p-12 border border-slate-100 relative overflow-hidden print:shadow-none print:rounded-none print:border-none">
          
          {/* Top Status Bar */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 md:mb-12 border-b border-slate-100 pb-6 md:pb-8">
            <div className="flex-1">
                {/* Print Only Header Info */}
                <div className="hidden print:block mb-4">
                     <h1 className="text-3xl font-black text-slate-900 mb-1">ResumeOptima Audit</h1>
                     <p className="text-slate-500">File: {fileName}</p>
                     <p className="text-slate-400 text-sm">Generated on {new Date().toLocaleDateString()}</p>
                </div>

                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Final Verdict</h2>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <span className={`text-3xl sm:text-4xl font-black ${
                        result.status === "Reject" ? "text-red-600" :
                        result.status === "Borderline" ? "text-yellow-600" : "text-emerald-600"
                    }`}>
                        {result.status}
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs sm:text-sm font-bold border border-slate-200 whitespace-nowrap">
                        Band: {result.scoreBand}
                    </span>
                </div>
            </div>
            
            <div className="flex gap-4 sm:gap-8 overflow-x-auto pb-2 md:pb-0">
                <div className="min-w-fit">
                    <span className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Pass 1: Parsing</span>
                    <span className={`font-bold text-base sm:text-lg flex items-center gap-1 ${result.atsScore > 60 ? 'text-green-600' : 'text-red-600'}`}>
                        {result.atsScore > 60 ? <CheckCircle2 className="w-4 h-4"/> : <X className="w-4 h-4"/>}
                        {result.atsScore > 60 ? 'PASSED' : 'FAILED'}
                    </span>
                </div>
                <div className="min-w-fit">
                     <span className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Pass 2: Content</span>
                     <span className={`font-bold text-base sm:text-lg flex items-center gap-1 ${result.contentScore > 60 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {result.contentScore > 60 ? <CheckCircle2 className="w-4 h-4"/> : <AlertTriangle className="w-4 h-4"/>}
                        {result.contentScore > 60 ? 'OPTIMIZED' : 'NEEDS WORK'}
                    </span>
                </div>
            </div>
          </div>

          {/* Scores Section */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-2 sm:gap-8 md:gap-12 mb-8 page-break-inside-avoid">
            <div className="col-span-2 md:col-span-1 flex justify-center">
                <CircularScore score={result.overallScore} label="Overall Score" color="#0f172a" subLabel={result.scoreBand} />
            </div>
            <div className="flex justify-center">
                <CircularScore score={result.atsScore} label="Parsing Logic" color="#3b82f6" subLabel="Weight: 30%" />
            </div>
            <div className="flex justify-center">
                <CircularScore score={result.contentScore} label="Content Impact" color="#84cc16" subLabel="Weight: 40%" />
            </div>
          </div>

          <div className="page-break-inside-avoid">
             <TransparencyPanel breakdown={result.breakdown} />
          </div>

          <div className="mt-8 mb-12 sm:mb-16 p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex gap-3 text-sm text-yellow-800 print:border-slate-300 print:bg-white">
             <Info className="w-5 h-5 shrink-0" />
             <p className="text-xs sm:text-sm"><strong>Simulator Disclaimer:</strong> This tool simulates enterprise ATS algorithms (Workday/Taleo). Actual results may vary by employer settings.</p>
          </div>

          {/* Critical Issues Section */}
          <div className="mb-12 sm:mb-16 page-break-inside-avoid">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 sm:mb-8 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                Critical Fixes Required
            </h3>
            <div className="space-y-6">
              {result.criticalIssues.length > 0 ? result.criticalIssues.map((issue, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm border-l-4 border-l-red-500 print:border-l-[6px]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <h4 className="text-base sm:text-lg font-bold text-slate-900">{issue.title}</h4>
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider self-start print:border print:border-red-200">
                        {issue.severity}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-4 text-sm sm:text-base">{issue.explanation}</p>
                  
                  <div className="bg-slate-50 rounded-lg p-3 sm:p-4 text-sm print:bg-slate-100">
                    <strong className="text-slate-900 block mb-1">🔧 Engineering Fix:</strong>
                    <span className="text-slate-700">{issue.fix}</span>
                  </div>
                </div>
              )) : (
                  <div className="bg-green-50 p-6 rounded-2xl border border-green-100 text-green-800 font-medium flex items-center gap-3 text-sm sm:text-base">
                    <CheckCircle2 className="w-6 h-6 shrink-0" /> No critical parsing errors found. Great job!
                  </div>
              )}
            </div>
          </div>

          {/* Suggested Improvements Section */}
          <div className="mb-12 sm:mb-16">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 sm:mb-8">Optimizations (Content Layer)</h3>
            <div className="space-y-6 sm:space-y-8">
              {result.improvements.map((imp, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm page-break-inside-avoid">
                  <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Target: {imp.section}</span>
                    <span className="text-green-600 font-bold text-sm">+{imp.impact} pts</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center mb-4">
                    <div className="bg-red-50/50 p-3 sm:p-4 rounded-xl border border-red-100 h-full print:bg-white print:border-slate-200">
                      <span className="text-[10px] sm:text-xs font-bold text-red-500 uppercase tracking-wider mb-2 block">Current</span>
                      <p className="text-slate-700 text-xs sm:text-sm">{imp.before}</p>
                    </div>
                    
                    <div className="bg-green-50/50 p-3 sm:p-4 rounded-xl border border-green-100 h-full print:bg-white print:border-slate-200">
                      <span className="text-[10px] sm:text-xs font-bold text-green-600 uppercase tracking-wider mb-2 block">Optimized</span>
                      <p className="text-slate-900 font-medium text-xs sm:text-sm">{imp.after}</p>
                    </div>
                  </div>
                   <p className="text-[10px] sm:text-xs text-slate-500 italic">Reason: {imp.reasoning}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Keyword Analysis Section */}
          <div className="mb-8 page-break-inside-avoid">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
                 <h3 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <Search className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" /> Keyword Gap Analysis
                </h3>
                <span className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold border ${
                    result.keywords.density === "High" ? "bg-green-50 border-green-200 text-green-700" : "bg-yellow-50 border-yellow-200 text-yellow-700"
                }`}>
                    Density: {result.keywords.density}
                </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Present */}
              <div className="border border-slate-200 rounded-2xl p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold text-xs sm:text-sm uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> Matched Signals
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.present.map((kw, i) => (
                    <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold print:border print:border-slate-300">
                      {kw}
                    </span>
                  ))}
                  {result.keywords.present.length === 0 && <span className="text-slate-400 italic text-xs sm:text-sm">No significant keywords found.</span>}
                </div>
              </div>

              {/* Missing */}
              <div className="border border-slate-200 rounded-2xl p-4 sm:p-6 bg-slate-50/50 print:bg-white">
                <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold text-xs sm:text-sm uppercase tracking-wider">
                  <X className="w-4 h-4 text-red-500" /> Missing / Recommended
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.missing.map((kw, i) => (
                    <span key={i} className="bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-sm opacity-60 dashed print:opacity-100">
                      {kw}
                    </span>
                  ))}
                  {result.keywords.missing.length === 0 && <span className="text-green-600 italic text-xs sm:text-sm">No critical gaps!</span>}
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs sm:text-sm text-slate-500">{result.keywords.recommendation}</p>
          </div>

        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="text-center mt-8 sm:mt-12 mb-4 px-4 no-print">
        <p className="text-slate-400 text-[10px] sm:text-xs font-medium">Engineered with Gemini 3 Pro Vision • Deterministic Scoring Engine v1.0</p>
      </div>
    </div>
  );
};