import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { AnalysisResult } from '../types';

interface ScoreGaugeProps {
  scores: AnalysisResult;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ scores }) => {
  const data = [
    {
      name: 'Score',
      value: scores.overallScore,
      fill: scores.overallScore > 89 ? '#059669' : scores.overallScore > 74 ? '#2563eb' : scores.overallScore > 59 ? '#d97706' : '#dc2626', 
    },
  ];

  const getStatusColor = (score: number) => {
    if (score >= 90) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (score >= 75) return "text-blue-700 bg-blue-50 border-blue-200";
    if (score >= 60) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-red-700 bg-red-50 border-red-200";
  };

  const getStatusText = (score: number) => {
    if (score >= 90) return "Strong Pass";
    if (score >= 75) return "Likely Pass";
    if (score >= 60) return "Borderline";
    return "ATS Reject";
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
        {/* Main Overall Score Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex flex-col">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Simulation Score</h3>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border w-fit ${getStatusColor(scores.overallScore)}`}>
                    {getStatusText(scores.overallScore)}
                </div>
            </div>
            
            <div className="h-16 w-16 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                        cx="50%" 
                        cy="50%" 
                        innerRadius="80%" 
                        outerRadius="100%" 
                        barSize={10} 
                        data={data} 
                        startAngle={90} 
                        endAngle={-270}
                    >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar
                        background={{ fill: '#f1f5f9' }}
                        dataKey="value"
                        cornerRadius={10}
                    />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-900">{scores.overallScore}</span>
                </div>
            </div>
        </div>

        {/* Breakdown Widgets */}
        <div className="grid grid-cols-1 gap-3">
            {/* ATS Score */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Structure (30%)</span>
                    <span className="text-sm font-bold text-slate-900">{scores.atsScore}/100</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ${scores.atsScore > 70 ? 'bg-blue-600' : 'bg-slate-400'}`} 
                        style={{ width: `${scores.atsScore}%` }}
                    ></div>
                </div>
            </div>

            {/* Content Score */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Content (40%)</span>
                    <span className="text-sm font-bold text-slate-900">{scores.contentScore}/100</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ${scores.contentScore > 70 ? 'bg-lime-500' : 'bg-slate-400'}`} 
                        style={{ width: `${scores.contentScore}%` }}
                    ></div>
                </div>
            </div>
        </div>
    </div>
  );
};