import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { FloatingChat } from './components/FloatingChat';
import { analyzeResume } from './services/geminiService';
import { AppStatus, AnalysisResult } from './types';
import { Bot, RefreshCw, Sparkles, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [file, setFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setStatus(AppStatus.ANALYZING);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        try {
            const { result } = await analyzeResume({
                file: selectedFile,
                base64: base64,
                mimeType: selectedFile.type || 'application/pdf' // Default fallback
            });

            setAnalysisResult(result);
            setStatus(AppStatus.CHATTING);
        } catch (error) {
            console.error(error);
            setStatus(AppStatus.ERROR);
        }
      };
    } catch (error) {
      console.error(error);
      setStatus(AppStatus.ERROR);
    }
  };

  const resetApp = () => {
    setStatus(AppStatus.IDLE);
    setFile(null);
    setAnalysisResult(null);
  };

  const renderContent = () => {
    // Shared Layout for Landing (IDLE) and Analyzing States
    if (status === AppStatus.IDLE || status === AppStatus.ANALYZING) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#4f46e5] via-[#7c3aed] to-[#9333ea] flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-yellow-300 selection:text-indigo-900 px-4 sm:px-6">
                {/* Background glow effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] sm:w-[800px] h-[500px] bg-blue-500/30 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none"></div>
                
                <div className="relative z-10 w-full max-w-[95%] 2xl:max-w-[1800px] mx-auto flex flex-col items-center text-center pt-8 pb-12">
                    
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-8 sm:mb-10 shadow-lg shadow-purple-900/20 animate-in fade-in zoom-in duration-500">
                        <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-300 fill-yellow-300" /> 
                        AI-POWERED ATS ANALYZER
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white mb-6 sm:mb-8 leading-[0.95] sm:leading-[0.9] tracking-tighter drop-shadow-sm">
                        BEAT THE ATS<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-lime-300">GET THE JOB</span>
                    </h1>

                    {/* Subheading */}
                    <p className="text-base sm:text-xl text-indigo-100/90 max-w-xl sm:max-w-3xl mx-auto mb-10 sm:mb-14 leading-relaxed font-light">
                        Your resume analyzed by expert AI in seconds. Get actionable insights to pass ATS systems and land more interviews.
                    </p>

                    {/* Content Switcher: Upload vs Analyzing */}
                    <div className="w-full max-w-5xl mb-16 sm:mb-20">
                        {status === AppStatus.IDLE ? (
                            <div className="transform hover:scale-[1.01] transition-transform duration-300">
                                <FileUpload onFileSelect={handleFileSelect} />
                            </div>
                        ) : (
                            // ANALYZING STATE UI
                            <div className="w-full mx-auto bg-white rounded-3xl shadow-2xl shadow-indigo-900/20 p-6 sm:p-8 h-72 sm:h-80 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 relative overflow-hidden">
                                {/* Subtle background animation inside card */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 to-transparent pointer-events-none"></div>
                                
                                <div className="mb-6 relative z-10">
                                    <div className="absolute inset-0 bg-blue-100/80 rounded-full blur-xl animate-pulse"></div>
                                    <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 relative z-10 animate-bounce" style={{ animationDuration: '3s' }} />
                                </div>
                                
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3 relative z-10 text-center">
                                    Analyzing {file?.name}
                                </h2>
                                
                                <p className="text-sm sm:text-base text-slate-500 max-w-lg mx-auto mb-6 sm:mb-8 text-center leading-relaxed font-medium relative z-10 px-4">
                                    Our AI is examining your resume for ATS compatibility, content quality, and keyword optimization...
                                </p>
                                
                                {/* 3 Dot Loader */}
                                <div className="flex space-x-2 relative z-10">
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Steps */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 w-full max-w-[90%] xl:max-w-[1400px] mx-auto">
                        {/* Step 1 */}
                        <div className={`flex flex-col items-center group transition-opacity duration-500 ${status === AppStatus.ANALYZING ? 'opacity-50' : 'opacity-100'}`}>
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/10 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold text-yellow-300 mb-4 sm:mb-5 backdrop-blur-md border border-white/20 shadow-xl shadow-purple-900/20 group-hover:bg-white/20 transition-all">1</div>
                            <h3 className="text-white font-bold text-lg sm:text-xl mb-1 sm:mb-2 tracking-tight">Upload Resume</h3>
                            <p className="text-indigo-200/80 font-medium text-sm sm:text-base">PDF or DOCX format</p>
                        </div>
                        {/* Step 2 */}
                        <div className={`flex flex-col items-center group transition-all duration-500 ${status === AppStatus.ANALYZING ? 'scale-110 opacity-100' : 'opacity-100'}`}>
                            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold mb-4 sm:mb-5 backdrop-blur-md border shadow-xl shadow-purple-900/20 transition-all ${status === AppStatus.ANALYZING ? 'bg-white text-blue-600 border-white shadow-blue-500/40' : 'bg-white/10 text-yellow-300 border-white/20 group-hover:bg-white/20'}`}>
                                {status === AppStatus.ANALYZING ? (
                                    <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" />
                                ) : (
                                    "2"
                                )}
                            </div>
                            <h3 className="text-white font-bold text-lg sm:text-xl mb-1 sm:mb-2 tracking-tight">Get Analysis</h3>
                            <p className="text-indigo-200/80 font-medium text-sm sm:text-base">ATS & content scores</p>
                        </div>
                        {/* Step 3 */}
                        <div className={`flex flex-col items-center group transition-opacity duration-500 ${status === AppStatus.ANALYZING ? 'opacity-50' : 'opacity-100'}`}>
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/10 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold text-yellow-300 mb-4 sm:mb-5 backdrop-blur-md border border-white/20 shadow-xl shadow-purple-900/20 group-hover:bg-white/20 transition-all">3</div>
                            <h3 className="text-white font-bold text-lg sm:text-xl mb-1 sm:mb-2 tracking-tight">Improve & Win</h3>
                            <p className="text-indigo-200/80 font-medium text-sm sm:text-base">Land more interviews</p>
                        </div>
                    </div>

                </div>

                {/* Floating AI Assistant for Landing Page */}
                <FloatingChat />
            </div>
        );
    }

    // Full Application Views (Error & Chatting)
    switch (status) {
      case AppStatus.ERROR:
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 max-w-md mx-auto text-center px-6">
                <div className="bg-red-50 p-6 rounded-full mb-6">
                    <Bot className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Processing Failed</h2>
                <p className="text-slate-500 mb-8">We encountered an issue reading your file. Please ensure it's a valid PDF or text document.</p>
                <button 
                    onClick={resetApp}
                    className="px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-bold flex items-center shadow-lg shadow-slate-200"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                </button>
            </div>
        );

      case AppStatus.CHATTING:
        return (
           <div className="relative">
                {analysisResult && (
                    <AnalysisDashboard 
                        result={analysisResult} 
                        fileName={file?.name || 'Resume.pdf'} 
                        onReset={resetApp} 
                    />
                )}
                {/* Always show the Chat Assistant floating on top of the dashboard */}
                <FloatingChat />
           </div>
        );
    }
  };

  return (
      <main>
        {renderContent()}
      </main>
  );
};

export default App;