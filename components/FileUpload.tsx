import React, { ChangeEvent, useState } from 'react';
import { Upload, FileText, Settings } from 'lucide-react';
import { ATSType } from '../types';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  atsType: ATSType;
  onATSTypeChange: (type: ATSType) => void;
  jobDescription: string;
  onJobDescriptionChange: (jd: string) => void;
  isDragging?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  atsType,
  onATSTypeChange,
  jobDescription,
  onJobDescriptionChange
}) => {
  const [showJDInput, setShowJDInput] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full mx-auto space-y-6">
      {/* ATS Type Selection */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-purple-200/30 p-5 border border-white/60">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-indigo-600" />
          <h2 className="font-bold text-slate-800 text-sm sm:text-base">ATS System Type</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label
            className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${atsType === ATSType.MODERN
              ? 'border-indigo-500 bg-indigo-50/50 backdrop-blur-sm'
              : 'border-slate-200 bg-white/40 backdrop-blur-sm hover:border-indigo-300'
              }`}
          >
            <input
              type="radio"
              name="atsType"
              value={ATSType.MODERN}
              checked={atsType === ATSType.MODERN}
              onChange={() => onATSTypeChange(ATSType.MODERN)}
              className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
            />
            <div className="ml-3">
              <div className="font-semibold text-slate-900 text-sm">Modern ATS</div>
              <div className="text-xs text-slate-600 mt-1">
                Greenhouse, Lever, Workday Cloud
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Tech companies, Startups, FAANG
              </div>
            </div>
          </label>

          <label
            className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${atsType === ATSType.OLD_SCHOOL
              ? 'border-indigo-500 bg-indigo-50/50 backdrop-blur-sm'
              : 'border-slate-200 bg-white/40 backdrop-blur-sm hover:border-indigo-300'
              }`}
          >
            <input
              type="radio"
              name="atsType"
              value={ATSType.OLD_SCHOOL}
              checked={atsType === ATSType.OLD_SCHOOL}
              onChange={() => onATSTypeChange(ATSType.OLD_SCHOOL)}
              className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
            />
            <div className="ml-3">
              <div className="font-semibold text-slate-900 text-sm">Old School ATS</div>
              <div className="text-xs text-slate-600 mt-1">
                Taleo, SAP SuccessFactors
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Banks, Consulting, Traditional MNCs
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Job Description Input (Optional) */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-purple-200/30 p-5 border border-white/60">
        <button
          onClick={() => setShowJDInput(!showJDInput)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-slate-800 text-sm sm:text-base">
              Job Description (Optional)
            </h2>
          </div>
          <span className="text-xs text-indigo-600 font-semibold">
            {showJDInput ? 'Hide' : 'Show'}
          </span>
        </button>

        {showJDInput && (
          <div className="mt-4">
            <textarea
              value={jobDescription}
              onChange={(e) => onJobDescriptionChange(e.target.value)}
              placeholder="Paste the job description here to get a tailored match score and keyword analysis..."
              className="w-full h-40 px-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              maxLength={5000}
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-slate-500">
                Helps identify missing keywords and calculate JD match score
              </p>
              <span className="text-xs text-slate-400">
                {jobDescription.length}/5000
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Resume Upload */}
      <div className="w-full mx-auto">
        <label
          htmlFor="resume-upload"
          className="flex flex-col items-center justify-center w-full min-h-[250px] sm:min-h-[320px] h-auto py-10 sm:py-0 bg-white rounded-3xl shadow-2xl shadow-indigo-900/20 cursor-pointer group relative overflow-hidden transition-all duration-300 hover:shadow-indigo-900/30 hover:-translate-y-1"
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
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 text-slate-500" /> Supports PDF & DOCX
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
    </div>
  );
};