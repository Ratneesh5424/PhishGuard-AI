import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileCode,
  X,
  FileText,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Bot,
  Loader2,
  FileUp,
} from 'lucide-react';
import Button from '../components/Button';
import UploadCard from '../components/UploadCard';
import { getDeviceId } from '../utils/deviceId';
import { API_BASE_URL } from '../utils/apiConfig';

const SAMPLE_PHISHING_EMAIL = `From: "Microsoft Security Team" <no-reply@auth-update.top>
To: target-user@organization.com
Date: Tue, 01 Sep 2026 14:20:11 +0530
Subject: CRITICAL: Microsoft 365 Password Expiration Notice - Immediate Verification Required
Message-ID: <20260901-security-alert-99128@auth-update.top>
MIME-Version: 1.0
Content-Type: text/plain; charset="UTF-8"

Dear Employee,

Your Microsoft 365 enterprise password will expire in 2 hours.
Failure to authenticate will lead to immediate account suspension and termination of access to corporate Outlook, OneDrive, and Teams.

Please verify your credentials immediately through our secure single sign-on portal:
https://login-microsoft365-verify.auth-update.top/sso/login?id=89274

Alternatively, scan the QR code using your mobile authentication app to maintain session continuity.

Regards,
IT Security & Identity Administration
Microsoft Corporation / Global Identity Operations`;

export const AnalyzeEmail = () => {
  const navigate = useNavigate();

  // Form State
  const [selectedFile, setSelectedFile] = useState(null);
  const [emailText, setEmailText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setErrorMessage('');
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleClearAll = () => {
    setEmailText('');
    setSelectedFile(null);
    setErrorMessage('');
  };

  const handleLoadSample = () => {
    setEmailText(SAMPLE_PHISHING_EMAIL);
    const sampleBlob = new Blob([SAMPLE_PHISHING_EMAIL], { type: 'message/rfc822' });
    const sampleFile = new File([sampleBlob], 'critical_security_alert_m365.eml', {
      type: 'message/rfc822',
    });
    setSelectedFile(sampleFile);
    setErrorMessage('');
  };

  const handleAnalyze = async () => {
    if (!selectedFile && !emailText.trim()) {
      setErrorMessage('Please upload a .eml file or paste email content.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage('');

    try {
      const deviceId = getDeviceId();

      // Build multipart/form-data with field name "email" and device identity
      const formData = new FormData();

      if (selectedFile) {
        formData.append('email', selectedFile);
      } else {
        const textBlob = new Blob([emailText], { type: 'message/rfc822' });
        formData.append('email', textBlob, 'email.eml');
      }

      formData.append('deviceId', deviceId);
      formData.append('device_id', deviceId);

      const response = await fetch(`${API_BASE_URL}/api/analyze?deviceId=${encodeURIComponent(deviceId)}`, {
        method: 'POST',
        headers: {
          'x-device-id': deviceId,
        },
        body: formData,
      });

      if (!response.ok) {
        let errData;
        try {
          errData = await response.json();
        } catch (_) {}

        if (response.status === 429) {
          throw new Error(errData?.error || 'Daily Gemini quota exceeded. Try later or use another API key.');
        }
        if (response.status === 503) {
          throw new Error(errData?.error || 'Gemini service is temporarily busy. Please retry in a few seconds.');
        }

        const serverError = errData?.error || errData?.message || `Server error (${response.status})`;
        throw new Error(serverError);
      }

      const resJson = await response.json();
      const data = resJson.data || resJson;

      if (!data || data.riskScore === undefined) {
        throw new Error(data?.error || 'Analysis failed: Invalid response received from server.');
      }

      const reportId = data.id || data.historyId || `rep-${Date.now()}`;

      // Persist to device-scoped localStorage fallback
      try {
        const storageKey = `phishguard_history_${deviceId}`;
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const newRecord = {
          ...data,
          id: reportId,
          historyId: reportId,
          device_id: deviceId,
          analyzed_at: data.analyzed_at || new Date().toISOString(),
        };
        const updated = [newRecord, ...existing.filter((item) => item.id !== reportId)];
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (storageErr) {
        // ignore storage errors
      }

      // Notify dashboard of new scan without stale session caching
      try {
        window.dispatchEvent(new Event('phishguard_analysis_completed'));
      } catch (e) {
        // ignore
      }

      navigate('/result', {
        state: {
          recordId: reportId,
          analysisData: {
            ...data,
            id: reportId,
            historyId: reportId,
          },
        },
      });
    } catch (err) {
      console.error('Analysis error:', err);
      setErrorMessage(err.message || 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper formatting for file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const hasContent = emailText.trim().length > 0 || selectedFile !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-6xl mx-auto pb-16"
    >
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
              <FileUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Analyze Suspicious Email
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Upload a .eml file or paste email content for AI-powered phishing detection.
              </p>
            </div>
          </div>
        </div>

        {/* STATUS BADGE: AI Ready */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AI Ready
          </span>
          <button
            type="button"
            onClick={handleLoadSample}
            className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-cyan-400 hover:text-cyan-300 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Phishing Sample
          </button>
        </div>
      </div>

      {/* ERROR BANNER */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-sm flex items-start gap-3 backdrop-blur-md shadow-lg shadow-rose-950/20"
          >
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Analysis failed</span>
              <span className="text-xs text-rose-300/80 break-words">
                {errorMessage}
              </span>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="text-rose-400 hover:text-rose-200"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN TWO-COLUMN WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: MAIN UPLOAD CARD */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-cyan-400" />
              Method 1: File Upload (.EML)
            </span>
            <span className="text-[11px] font-mono text-slate-500">MIME / RFC 822</span>
          </div>

          <UploadCard
            onFileSelect={handleFileSelect}
            className="h-full min-h-[340px]"
          />
        </div>

        {/* RIGHT COLUMN: PASTE EMAIL CONTENT CARD */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-400" />
              Method 2: Paste Raw Email
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {emailText.length} characters
            </span>
          </div>

          {/* Textarea Glassmorphic Card */}
          <div className="relative flex-1 p-5 rounded-2xl backdrop-blur-xl bg-slate-900/65 border border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.37)] shadow-blue-950/20 flex flex-col focus-within:border-cyan-500/50 focus-within:shadow-[0_0_25px_rgba(6,182,212,0.2)] transition-all min-h-[340px]">
            <textarea
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              placeholder="Paste the suspicious email content here... (including headers if available)"
              className="w-full flex-1 bg-transparent border-0 text-slate-200 placeholder-slate-500 text-xs md:text-sm font-mono leading-relaxed resize-none focus:outline-none scrollbar-thin scrollbar-thumb-slate-700"
            />

            {/* Bottom Character Counter & Clear Text */}
            <div className="pt-3 mt-auto border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>{emailText ? `${emailText.split(/\s+/).filter(Boolean).length} words` : 'Awaiting input...'}</span>
              {emailText && (
                <button
                  type="button"
                  onClick={() => setEmailText('')}
                  className="hover:text-rose-400 text-slate-400 transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear Text
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ATTACHMENT SECTION (Shows when a file is selected) */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="p-5 rounded-2xl backdrop-blur-xl bg-slate-900/70 border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <FileCode className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white truncate max-w-xs md:max-w-md">
                    {selectedFile.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Ready to Scan
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Size: {formatFileSize(selectedFile.size)} • Type: {selectedFile.type || 'message/rfc822'}
                </p>
              </div>
            </div>

            {/* Remove attachment button */}
            <button
              type="button"
              onClick={handleRemoveFile}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-all flex items-center gap-1.5 text-xs font-mono self-end sm:self-auto"
            >
              <X className="w-4 h-4" />
              <span>Remove</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM ACTIONS BAR */}
      <div className="p-6 rounded-2xl backdrop-blur-xl bg-slate-900/70 border border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.37)] shadow-blue-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
          <Bot className="w-4 h-4 text-cyan-400" />
          <span>Multimodal threat intelligence engine connected</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Clear Secondary Button */}
          <Button
            variant="secondary"
            size="md"
            icon={RotateCcw}
            onClick={handleClearAll}
            disabled={!hasContent || isAnalyzing}
            className="w-full sm:w-auto hover:bg-slate-800 text-slate-300"
          >
            Clear
          </Button>

          {/* Analyze Email Primary Gradient Button */}
          <Button
            variant="gradient"
            size="md"
            icon={isAnalyzing ? Loader2 : Sparkles}
            onClick={handleAnalyze}
            disabled={!hasContent || isAnalyzing}
            className={`w-full sm:w-auto min-w-[180px] shadow-[0_0_20px_rgba(6,182,212,0.4)] ${
              isAnalyzing ? 'animate-pulse cursor-wait' : ''
            }`}
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Threat...
              </span>
            ) : (
              'Analyze Email'
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyzeEmail;
