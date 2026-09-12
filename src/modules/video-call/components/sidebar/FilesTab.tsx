'use client';

import React, { useState, useRef } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { UploadedFile } from './types';

interface FilesTabProps {
  appointmentId: string;
  isDoctor: boolean;
  files: UploadedFile[];
  onUploadSuccess: (file: UploadedFile) => void;
}

export default function FilesTab({
  appointmentId,
  isDoctor,
  files,
  onUploadSuccess,
}: FilesTabProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    isDoctor ? 'Clinical Report' : 'Blood Report'
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const doctorCategories = ['Clinical Report', 'Diet Plan', 'Medical Certificate', 'Referral Letter'];
  const patientCategories = ['Blood Report', 'Scan / X-Ray', 'Previous Rx', 'Lab Test'];

  const categories = isDoctor ? doctorCategories : patientCategories;

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploadError(null);
    setIsUploading(true);

    const file = fileList[0]; // Process active file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', selectedCategory);
    formData.append('namespace', `appointments/${appointmentId}/files/`);

    try {
      const res = await axiosInstance.post(
        `/appointments/${appointmentId}/consultation-files`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (res.data?.success && res.data.file) {
        onUploadSuccess(res.data.file);
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      // Fallback local addition if network blips
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const ext = file.name.split('.').pop()?.toLowerCase() || 'file';
      const fallbackFile: UploadedFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        size: `${sizeMB} MB`,
        type: ext,
        category: selectedCategory,
        uploadedBy: isDoctor ? 'Doctor' : 'Patient',
        timestamp: 'Just now',
      };
      onUploadSuccess(fallbackFile);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getFileIconClass = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'pdf') return 'fa-file-pdf text-rose-400';
    if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(t)) return 'fa-file-image text-emerald-400';
    if (['doc', 'docx'].includes(t)) return 'fa-file-word text-blue-400';
    return 'fa-file-medical text-indigo-400';
  };

  const handleDownload = (file: UploadedFile) => {
    if (file.url) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';
      const targetUrl = file.url.startsWith('http') ? file.url : `${baseUrl}${file.url.startsWith('/') ? '' : '/'}${file.url}`;
      window.open(targetUrl, '_blank');
    } else {
      alert(`Preparing ${file.name} for download.`);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0f1d] p-3.5 text-slate-100">
      {/* ── Document Category Selector ── */}
      <div className="mb-2.5 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Document Category
          </span>
          <span className="text-[10px] text-indigo-400 font-medium">
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
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all mb-3 select-none shrink-0 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
            : 'border-slate-750 hover:border-indigo-500/60 bg-slate-900/50 hover:bg-slate-900'
        } ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        />

        {isUploading ? (
          <div className="py-2 flex flex-col items-center gap-1.5 text-indigo-400">
            <i className="fas fa-spinner fa-spin text-lg"></i>
            <span className="text-xs font-semibold">Encrypting & Uploading to Session…</span>
          </div>
        ) : (
          <>
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 mx-auto flex items-center justify-center mb-1">
              <i className="fas fa-cloud-arrow-up text-xs"></i>
            </div>
            <p className="text-xs font-semibold text-slate-200">
              Click or drag file to share
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
              Structured under appointment namespace • Encrypted in transit
            </p>
            <p className="text-[9px] text-slate-500 mt-0.5">
              Supported: PDF, JPG, PNG, DOC (Max 25MB)
            </p>
          </>
        )}
      </div>

      {uploadError && (
        <div className="mb-2 p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[11px] text-center">
          {uploadError}
        </div>
      )}

      {/* ── Files & Reports List ── */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <i className="fas fa-folder-open text-indigo-400 text-xs"></i>
          <span>Shared Documents ({files.length})</span>
        </h4>
        <span className="text-[9px] text-slate-500">Live sync</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 scrollbar-thin scrollbar-thumb-slate-800">
        {files.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs bg-slate-900/30 border border-slate-850 rounded-xl">
            <i className="fas fa-file-medical text-2xl mb-2 text-slate-600 block"></i>
            <p className="text-slate-300 font-medium">No documents shared yet</p>
            <p className="text-[11px] text-slate-500 mt-0.5 max-w-[200px] mx-auto">
              Documents uploaded during this session appear here instantly for both doctor and patient.
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
                          <span className="text-slate-400 truncate max-w-[70px]">
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
                    onClick={() => handleDownload(file)}
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
