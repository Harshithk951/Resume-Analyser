import React, { useState, useEffect, useRef } from 'react';
import { Brain, X, Send, ChevronDown, Sparkles } from 'lucide-react';
import { startGeneralChat, sendChatMessage } from '../services/geminiService';
import { ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';

export const FloatingChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize the general chat session on mount
    const initChat = async () => {
      try {
        const welcomeMsg = await startGeneralChat();
        setMessages([{ role: 'model', text: welcomeMsg }]);
      } catch (e) {
        console.error(e);
      }
    };
    initChat();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(userText);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans pointer-events-none">
      {/* Chat Window Container - Enable pointer events only for this */}
      <div className="pointer-events-auto">
        {isOpen && (
            <div className="mb-4 w-[calc(100vw-2rem)] sm:w-[400px] h-[60vh] sm:h-[550px] bg-white rounded-2xl shadow-2xl shadow-indigo-900/20 border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200 origin-bottom-right absolute bottom-16 right-0 sm:relative sm:bottom-0 sm:right-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 p-4 sm:p-5 flex items-center justify-between text-white shrink-0 relative overflow-hidden">
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="flex items-center space-x-3 relative z-10">
                <div className="bg-white/10 p-2 sm:p-2.5 rounded-xl backdrop-blur-md border border-white/20 shadow-lg">
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 fill-yellow-300" />
                </div>
                <div>
                    <h3 className="font-bold text-sm sm:text-base tracking-tight text-white">Career Architect AI</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <p className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Online</p>
                    </div>
                </div>
                </div>
                <button 
                onClick={toggleChat}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white relative z-10"
                >
                <ChevronDown className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 bg-slate-50/50 custom-scrollbar space-y-5"
            >
                {messages.map((msg, i) => (
                <div 
                    key={i} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div 
                            className={`rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 text-xs sm:text-sm shadow-sm leading-relaxed ${
                            msg.role === 'user' 
                                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm' 
                                : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm'
                            }`}
                        >
                        {msg.role === 'model' ? (
                            <ReactMarkdown className="prose prose-sm max-w-none text-inherit prose-p:my-1 prose-ul:my-1 prose-strong:text-slate-900 prose-li:marker:text-slate-400">
                                {msg.text}
                            </ReactMarkdown>
                        ) : (
                            msg.text
                        )}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                            {msg.role === 'user' ? 'You' : 'Architect AI'}
                        </span>
                    </div>
                </div>
                ))}
                {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex space-x-1.5">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    </div>
                </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100 shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                <div className="relative flex items-center">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about your resume..."
                    className="w-full pl-5 pr-12 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700 transition-all placeholder:text-slate-400"
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className={`absolute right-2 p-2 rounded-lg transition-all duration-200 ${
                    input.trim() 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    <Send className="w-4 h-4" />
                </button>
                </div>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-slate-400 font-medium">Powered by Gemini 3 Pro Vision</p>
                </div>
            </div>
            </div>
        )}
      </div>

      {/* Floating Toggle Button */}
      <div className="relative group pointer-events-auto">
        {!isOpen && (
             <span className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 border-2 border-white rounded-full z-10 animate-pulse"></span>
        )}
        <button
            onClick={toggleChat}
            className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl shadow-indigo-600/30 transition-all duration-300 relative overflow-hidden ${
            isOpen 
                ? 'bg-slate-900 text-white rotate-90 scale-90' 
                : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white hover:scale-110 hover:shadow-indigo-600/50'
            }`}
        >
            {/* Ping Animation Layer */}
            {!isOpen && (
                 <span className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping duration-[2000ms]"></span>
            )}
            
            {isOpen ? <X className="w-6 h-6 sm:w-7 sm:h-7" /> : <Brain className="w-7 h-7 sm:w-8 sm:h-8 fill-white/20" />}
        </button>

        {/* Tooltip */}
        {!isOpen && (
            <div className="absolute right-16 sm:right-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 pointer-events-none hidden sm:block">
                <div className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xl whitespace-nowrap flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-yellow-300" />
                    Chat with Architect AI
                    <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-l-[8px] border-l-slate-900 border-b-[6px] border-b-transparent"></div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};