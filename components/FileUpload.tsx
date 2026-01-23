import React, { ChangeEvent } from 'react';
import { Upload, FileText } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isDragging?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full mx-auto">
      <label
        htmlFor="resume-upload"
        className="flex flex-col items-center justify-center w-full h-64 sm:h-80 bg-white rounded-3xl shadow-2xl shadow-indigo-900/20 cursor-pointer group relative overflow-hidden transition-all duration-300 hover:shadow-indigo-900/30 hover:-translate-y-1"
      >
        <div className="absolute inset-4 border-2 border-dashed border-slate-200 rounded-2xl group-hover:border-blue-400 transition-colors"></div>
        
        <div className="flex flex-col items-center justify-center relative z-10 px-4 text-center">
          <div className="p-4 sm:p-5 bg-blue-50 border border-blue-100 rounded-2xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-sm group-hover:bg-blue-100">
            <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
          </div>
          
          <p className="mb-2 sm:mb-3 text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Drop Your Resume Here
          </p>
          <p className="text-sm sm:text-base text-slate-500 mb-6 sm:mb-8 font-medium">
            or click to browse
          </p>
          
          <div className="flex items-center space-x-6">
             <span className="flex items-center text-[10px] sm:text-xs text-slate-600 font-bold uppercase tracking-widest">
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 text-slate-500"/> Supports PDF & DOCX
             </span>
          </div>
        </div>
        
        <input 
          id="resume-upload" 
          type="file" 
          className="hidden" 
          accept=".pdf,.txt,.png,.jpg,.jpeg,.webp"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};