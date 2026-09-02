import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileUp, Shield, Sparkles } from 'lucide-react';
import Button from './Button';

export const UploadCard = ({
  onFileSelect,
  selectedFile,
  onClearFile,
  acceptedFormats = '.eml,.msg,.txt',
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  const triggerBrowse = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats}
        onChange={handleInputChange}
        className="hidden"
      />

      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerBrowse}
        whileHover={{ scale: 1.008 }}
        className={`relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-xl border-2 border-dashed ${
          isDragging
            ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.35)] ring-2 ring-cyan-500/30'
            : 'bg-slate-900/60 border-slate-700/80 hover:border-cyan-500/50 hover:bg-slate-900/80 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] shadow-[0_8px_32px_rgba(0,0,0,0.37)]'
        }`}
      >
        {/* Soft radial glow in background */}
        <div className="absolute w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Upload Icon with animated glow */}
        <motion.div
          animate={isDragging ? { y: -6, scale: 1.1 } : { y: 0, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="relative p-5 rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/80 text-cyan-400 shadow-xl shadow-cyan-950/40 mb-5 group-hover:border-cyan-500/40 group-hover:text-cyan-300"
        >
          <UploadCloud className="w-10 h-10" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
          </span>
        </motion.div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white tracking-wide mb-1 text-center">
          Drag & Drop .EML File
        </h3>
        
        <p className="text-xs text-slate-400 text-center max-w-sm mb-6 leading-relaxed">
          Upload raw MIME emails (.eml, .msg, or .txt) with full headers for deep heuristic and NLP inspection.
        </p>

        {/* Secondary Browse File button */}
        <Button
          type="button"
          variant="secondary"
          size="md"
          icon={FileUp}
          onClick={(e) => {
            e.stopPropagation();
            triggerBrowse();
          }}
          className="border-slate-700/80 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-200"
        >
          Browse File
        </Button>

        <div className="flex items-center gap-4 mt-6 text-[11px] font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-cyan-500" /> Headers Analyzed
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" /> 100% Client Protected
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default UploadCard;
