import React from 'react';
import { User, Bot } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[90%] md:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-4`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${isUser ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
          {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-5 h-5 text-blue-600" />}
        </div>

        {/* Bubble */}
        <div 
            className={`p-5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                isUser 
                ? 'bg-slate-800 text-white rounded-tr-none' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
            }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap font-sans">{message.text}</div>
          ) : (
            <ReactMarkdown 
              className="prose prose-sm max-w-none text-slate-700 prose-headings:font-bold prose-headings:text-slate-900 prose-p:my-3 prose-ul:my-3 prose-li:my-1 prose-strong:text-slate-900 prose-code:text-blue-700 prose-code:bg-blue-50 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-pre:rounded-lg"
            >
              {message.text}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
};