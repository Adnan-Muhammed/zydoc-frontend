'use client';

import React, { useState, useRef } from 'react';
import { UploadedFile } from './types';

interface FilesTabProps {
  isDoctor: boolean;
  files: UploadedFile[];
  onUploadFiles: (files: FileList | null, category?: string) => void;
}

export default function FilesTab({
  isDoctor,
  files,
  onUploadFiles,
}: FilesTabProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    isDoctor ? 'Diet Plan' : 'Blood Report'
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const doctorCategories = ['Diet Plan', 'Medical Certificate', 'Referral Letter', 'Clinical Report'];
  const patientCategories = ['Blood Report', 'Scan / X-Ray', 'Previous Rx', 'Lab Test'];

  const categories = isDoctor ? doctorCategories : patientCategories;

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    onUploadFiles(fileList, selectedCategory);
  };

  const getFileIconClass = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'pdf') return 'fa-file-pdf text-rose-400';
    if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(t)) return 'fa-file-image text-emerald-400';
    if (['doc', 'docx'].includes(t)) return 'fa-file-word text-blue-400';
    return 'fa-file-medical text-indigo-400';
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0f1d] p-3.5 text-slate-100">
      {/* ── Role specific contextual helper ── */}
      <div className="mb-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Document Category
          </span>
          <span className="text-[10px] text-indigo-400">
            {isDoctor ? 'Doctor Attachments' : 'Patient Records'}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`text-[10px] px-2 py-1 rounded-lg border transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 border-indigo-500 text-white font-medium shadow-xs'
                  : 'bg-slate-900 border-slate-750 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Drag & Drop Upload Zone ── */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all mb-3 select-none ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
            : 'border-slate-750 hover:border-indigo-500/60 bg-slate-900/50 hover:bg-slate-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        />
        <div className="w-9 h-9 rounded-full bg-indigo-600/20 text-indigo-400 mx-auto flex items-center justify-center mb-1.5">
          <i className="fas fa-cloud-arrow-up text-sm"></i>
        </div>
        <p className="text-xs font-semibold text-slate-200">
          Click or drag & drop to upload
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
          {isDoctor
            ? 'Upload diet plans, medical certificates, or referral letters for patient'
            : 'Upload blood reports, scan images, or medical histories'}
        </p>
        <p className="text-[9px] text-slate-500 mt-1">
          Supported: PDF, JPG, PNG, DOC (up to 25MB)
        </p>
      </div>

      {/* ── Files & Reports List ── */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <i className="fas fa-folder-open text-indigo-400 text-xs"></i>
          <span>Shared Documents ({files.length})</span>
        </h4>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 scrollbar-thin scrollbar-thumb-slate-800">
        {files.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs bg-slate-900/30 border border-slate-850 rounded-xl">
            <i className="fas fa-file-medical text-2xl mb-2 text-slate-600 block"></i>
            <p className="text-slate-300 font-medium">No documents shared yet</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Files uploaded by either participant will appear here instantly.
            </p>
          </div>
        ) : (
          files.map((file) => {
            const isDoctorFile = file.uploadedBy === 'Doctor';

            return (
              <div
                key={file.id}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between hover:border-slate-700 hover:bg-slate-900 transition-all shadow-xs group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 text-indigo-400 border border-slate-800 flex items-center justify-center shrink-0">
                    <i className={`fas ${getFileIconClass(file.type)} text-xs`}></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate pr-1" title={file.name}>
                      {file.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                      <span>{file.size}</span>
                      <span className="text-slate-600">•</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                          isDoctorFile
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                        }`}
                      >
                        {isDoctorFile ? 'Doctor' : 'Patient'}
                      </span>
                      {file.category && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400 truncate max-w-[80px]">
                            {file.category}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    type="button"
                    title="Download document"
                    onClick={() => {
                      alert(`Downloading ${file.name}`);
                    }}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors shadow-xs"
                  >
                    <i className="fas fa-arrow-down-to-line text-xs"></i>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
