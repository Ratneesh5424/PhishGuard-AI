import React, { useState } from 'react';
import { UploadCloud, FileCheck2, FileUp } from 'lucide-react';

export const UploadBox = ({
  onFileSelect,
  selectedFile,
  acceptedFormats = '.eml,.msg,.txt',
  label = 'Drag & Drop .EML / .MSG File Here',
  sublabel = 'Automatic extraction of MIME boundaries, headers, and attachments.',
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    if (files && files[0] && onFileSelect) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`p-8 rounded-[20px] backdrop-blur-xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer relative min-h-[300px] ${
        isDragOver
          ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.25)]'
          : 'bg-slate-900/60 border-slate-700 hover:border-cyan-500/60'
      } ${className}`}
    >
      <input
        type="file"
        accept={acceptedFormats}
        onChange={handleDrop}
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
      />
      <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-3 group-hover:scale-110 transition-transform shadow-inner">
        <UploadCloud className="w-10 h-10 text-cyan-300" />
      </div>

      <h3 className="text-base font-bold text-white tracking-tight">
        {isDragOver ? 'Release to Ingest File' : label}
      </h3>
      <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
        {sublabel}
      </p>

      {selectedFile ? (
        <div className="mt-4 px-4 py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-cyan-400" />
          <span>Loaded: <strong>{selectedFile.name}</strong> ({Math.round(selectedFile.size / 1024)} KB)</span>
        </div>
      ) : (
        <span className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 text-xs font-mono text-slate-300 border border-slate-700">
          <FileUp className="w-3.5 h-3.5 text-cyan-400" />
          Browse Files from Computer
        </span>
      )}
    </div>
  );
};

export default UploadBox;
