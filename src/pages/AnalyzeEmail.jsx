import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import {
  UploadCloud,
  FileCode,
  FileText,
  Paperclip,
  Trash2,
  Sparkles,
  Zap,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Bot,
  Binary,
  Clock,
  ExternalLink,
  Eye,
  RefreshCw,
  Search,
  Check,
  Radio,
  FileCheck2,
  XCircle,
  Layers,
  FileUp,
  SlidersHorizontal,
  Mail
} from 'lucide-react';
import { useThreat } from '../context/ThreatContext';
import { MOCK_PRESETS as SAMPLE_PRESETS, MOCK_PRESETS } from '../data/mockData';

// Default mock for recent uploaded files
const INITIAL_RECENT_FILES = [
  {
    id: 'rec-1',
    fileName: 'Project_Titan_Wire_Authorization.eml',
    source: 'Drag & Drop (.eml)',
    fileSize: '48.2 KB',
    timestamp: '2026-09-03 10:14:22',
    riskScore: 96,
    threatLevel: 'CRITICAL',
    presetId: 'preset-bec-wire',
    subject: 'URGENT: Approved Acquisition Payment Routing Authorization [CONFIDENTIAL]'
  },
  {
    id: 'rec-2',
    fileName: 'm365_security_cert_revocation.eml',
    source: 'Direct Paste (RFC 822)',
    fileSize: '34.8 KB',
    timestamp: '2026-09-03 11:45:00',
    riskScore: 92,
    threatLevel: 'CRITICAL',
    presetId: 'preset-m365-oauth',
    subject: 'Action Required: Microsoft 365 Security Certificate Revocation'
  },
  {
    id: 'rec-3',
    fileName: 'DocuSign_Settlement_Agreement.eml',
    source: 'Attachment Sandbox (.pdf)',
    fileSize: '348.0 KB',
    timestamp: '2026-09-03 09:30:15',
    riskScore: 94,
    threatLevel: 'CRITICAL',
    presetId: 'preset-docusign-malware',
    subject: 'Completed: DocuSign Document: Q3 Fiscal Audit Settlement Agreement.pdf'
  },
  {
    id: 'rec-4',
    fileName: 'NIC_CERT_Gov_In_SSO_Circular.eml',
    source: 'Drag & Drop (.eml)',
    fileSize: '29.1 KB',
    timestamp: '2026-09-03 08:15:00',
    riskScore: 91,
    threatLevel: 'HIGH',
    presetId: 'preset-nic-gov',
    subject: 'NOTICE: Digital Public Infrastructure Security Advisory'
  },
  {
    id: 'rec-5',
    fileName: 'HR_Payroll_Payslip_Aug2026.eml',
    source: 'Direct Paste (RFC 822)',
    fileSize: '21.5 KB',
    timestamp: '2026-09-01 06:00:00',
    riskScore: 4,
    threatLevel: 'SAFE',
    presetId: 'preset-clean-payroll',
    subject: 'Your Monthly Payslip & Form 16 Tax Computation - August 2026'
  }
];

export const AnalyzeEmail = () => {
  const navigate = useNavigate();
  const { parseAndAnalyzeEmail, loadPreset, currentAnalysis } = useThreat();

  // Input states
  const [activeInputTab, setActiveInputTab] = useState('paste'); // 'upload' | 'paste'
  const [pastedEmail, setPastedEmail] = useState(currentAnalysis?.bodyText || SAMPLE_PRESETS[0].bodyText);
  const [uploadedEmlFile, setUploadedEmlFile] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [previewMode, setPreviewMode] = useState('rendered'); // 'rendered' | 'raw'
  const [recentFiles, setRecentFiles] = useState(() => {
    try {
      const stored = localStorage.getItem('phishguard_recent_uploads');
      return stored ? JSON.parse(stored) : INITIAL_RECENT_FILES;
    } catch {
      return INITIAL_RECENT_FILES;
    }
  });

  // Scanning animation states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Lifecyle safety: prevent state updates and cancel timeouts on unmount
  const isMountedRef = useRef(true);
  const activeTimeoutsRef = useRef([]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      activeTimeoutsRef.current.forEach(clearTimeout);
      activeTimeoutsRef.current = [];
    };
  }, []);

  // Auto-parse preview metadata from whatever text is present
  const parsedPreview = useMemo(() => {
    const text = pastedEmail || '';
    const lines = text.split('\n');
    let subject = '(No Subject Detected)';
    let sender = '(Unknown Sender)';
    let recipient = '(Unknown Recipient)';
    let date = new Date().toLocaleString();
    let messageId = '<unassigned@mail>';
    let returnPath = '';

    for (let line of lines) {
      const lower = line.toLowerCase();
      if (lower.startsWith('subject:')) subject = line.substring(8).trim();
      else if (lower.startsWith('from:')) sender = line.substring(5).trim();
      else if (lower.startsWith('to:')) recipient = line.substring(3).trim();
      else if (lower.startsWith('date:')) date = line.substring(5).trim();
      else if (lower.startsWith('message-id:')) messageId = line.substring(11).trim();
      else if (lower.startsWith('return-path:')) returnPath = line.substring(12).trim();
    }

    const domainMatch = sender.match(/@([a-zA-Z0-9.-]+)/);
    const senderDomain = domainMatch ? domainMatch[1].replace('>', '') : 'unknown.com';

    const urlRegex = /(https?:\/\/[^\s<>"']+)/g;
    const extractedUrls = text.match(urlRegex) || [];

    return {
      subject,
      sender,
      senderDomain,
      recipient,
      date,
      messageId,
      returnPath: returnPath || sender,
      urls: extractedUrls,
      body: text
    };
  }, [pastedEmail]);

  // Handle Drag & Drop for .eml files
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleEmlDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setUploadedEmlFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!isMountedRef.current) return;
        const content = event.target.result;
        setPastedEmail(content);
        setErrorMsg('');
      };
      reader.readAsText(file);
    }
  };

  // Handle Attachment Picker
  const handleAttachmentUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files).map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type || 'application/octet-stream',
        lastModified: f.lastModified
      }));
      setAttachments((prev) => [...prev, ...newFiles]);
      setErrorMsg('');
    }
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Trigger Multi-Stage Scanning Animation & Real Forensic Pipeline
  const handleAnalyzeWithAi = async () => {
    if (!pastedEmail.trim() && !uploadedEmlFile && attachments.length === 0) {
      setErrorMsg('Please upload an .eml file, paste email headers, or select a preset before analyzing.');
      return;
    }

    setErrorMsg('');
    setIsAnalyzing(true);
    setScanStep(0);
    setScanProgress(15);

    // Multi-stage visual scan progress
    const step1 = setTimeout(() => {
      if (isMountedRef.current) {
        setScanStep(1);
        setScanProgress(45);
      }
    }, 400);

    const step2 = setTimeout(() => {
      if (isMountedRef.current) {
        setScanStep(2);
        setScanProgress(75);
      }
    }, 850);

    const step3 = setTimeout(() => {
      if (isMountedRef.current) {
        setScanStep(3);
        setScanProgress(95);
      }
    }, 1300);

    activeTimeoutsRef.current = [step1, step2, step3];

    try {
      // Execute REAL backend forensic pipeline
      const result = await parseAndAnalyzeEmail(pastedEmail, attachments);
      if (!isMountedRef.current) return;

      // Save to recent uploads
      const newRecent = {
        id: `rec-${Date.now()}`,
        fileName: uploadedEmlFile ? uploadedEmlFile.name : `${(result?.subject || parsedPreview?.subject || 'email').slice(0, 30)}.eml`,
        source: uploadedEmlFile ? 'Drag & Drop (.eml)' : 'Direct Paste (RFC 822)',
        fileSize: `${Math.max(12, Math.round((pastedEmail.length || 2048) / 1024))} KB`,
        timestamp: new Date().toLocaleString(),
        startTime: result?.startTime ?? Date.now(),
        riskScore: typeof result?.riskScore === 'number' ? result.riskScore : (typeof result?.score === 'number' ? result.score : 0),
        threatLevel: result?.threatLevel || result?.level || result?.verdict || 'SAFE',
        presetId: result?.caseId || result?.id,
        subject: result?.subject || parsedPreview?.subject || 'Email Threat Assessment'
      };

      setRecentFiles((prev) => {
        const updated = [newRecent, ...(prev || []).filter(Boolean).slice(0, 7)];
        try {
          localStorage.setItem('phishguard_recent_uploads', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      setIsAnalyzing(false);
      navigate('/ai-report');
    } catch (err) {
      console.error('Scan error:', err);
      if (isMountedRef.current) {
        setErrorMsg(err.message || 'Failed to analyze email.');
        setIsAnalyzing(false);
      }
    } finally {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      activeTimeoutsRef.current = [];
    }
  };

  const handleLoadRecentFile = (item) => {
    if (item.presetId) {
      const p = MOCK_PRESETS.find(pr => pr.id === item.presetId);
      if (p) {
        setPastedEmail(p.bodyText);
        setUploadedEmlFile(null);
        return;
      }
    }
    // Fallback: inject subject as email text
    setPastedEmail(`From: security-feed@threat-intel.net\nSubject: ${item.subject}\nDate: ${item.timestamp}\n\n[Re-loaded archived investigation payload]`);
  };

  const handleSelectPreset = (presetId) => {
    const p = MOCK_PRESETS.find(pr => pr.id === presetId);
    if (p) {
      setPastedEmail(p.bodyText);
      setUploadedEmlFile(null);
      setErrorMsg('');
    }
  };

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Analyze Email & Threat Detection Workbench
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm">
              AI FORENSIC ENGINE
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Ingest .eml messages, examine live headers, inspect suspicious attachments, and extract multi-vector threat signals.
          </p>
        </div>

        {/* SIH Scenario Quick Loaders */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">Scenario Presets:</span>
          <button
            onClick={() => handleSelectPreset('preset-ceo-wire')}
            className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-xs font-mono text-rose-300 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>CEO Wire (96)</span>
          </button>
          <button
            onClick={() => handleSelectPreset('preset-fake-payroll')}
            className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-xs font-mono text-rose-300 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Fake Payroll (88)</span>
          </button>
          <button
            onClick={() => handleSelectPreset('preset-fake-ms-login')}
            className="px-3 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/40 text-xs font-mono text-orange-300 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Fake MS Login (82)</span>
          </button>
          <button
            onClick={() => handleSelectPreset('preset-selfstudys-promo')}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-xs font-mono text-cyan-300 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Promo (28)</span>
          </button>
          <button
            onClick={() => handleSelectPreset('preset-dsu-admission')}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-xs font-mono text-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>DSU Admission (12)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Ingestion Console (6 cols) | Right Live Email Preview Panel (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ingestion Controls */}
        <div className="lg:col-span-6 space-y-4">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <button
              onClick={() => setActiveInputTab('paste')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeInputTab === 'paste'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Paste Email / RFC 822 Text</span>
            </button>
            <button
              onClick={() => setActiveInputTab('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeInputTab === 'upload'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Drag & Drop .EML File</span>
            </button>
          </div>

          {/* Tab 1: Drag & Drop .eml Zone */}
          {activeInputTab === 'upload' ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleEmlDrop}
              className={`p-8 rounded-[20px] backdrop-blur-xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer relative min-h-[360px] ${
                isDragOver
                  ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-900/60 border-slate-700 hover:border-cyan-500/60'
              }`}
            >
              <input
                type="file"
                accept=".eml,.msg,.txt"
                onChange={handleEmlDrop}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-3 group-hover:scale-110 transition-transform shadow-inner">
                <UploadCloud className="w-10 h-10 text-cyan-300" />
              </div>

              <h3 className="text-base font-bold text-white tracking-tight">
                {isDragOver ? 'Release to Ingest .EML File' : 'Drag & Drop .EML / .MSG File Here'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                Supports RFC 822 raw message files, Outlook .msg exports, and multi-part MIME headers.
              </p>

              {uploadedEmlFile ? (
                <div className="mt-4 px-4 py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-cyan-400" />
                  <span>Ingested: <strong>{uploadedEmlFile.name}</strong> ({Math.round(uploadedEmlFile.size / 1024)} KB)</span>
                </div>
              ) : (
                <span className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 text-xs font-mono text-slate-300 border border-slate-700">
                  <FileUp className="w-3.5 h-3.5 text-cyan-400" />
                  Browse Files from Computer
                </span>
              )}
            </div>
          ) : (
            /* Tab 2: Paste Email Text Editor */
            <div className="p-5 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 font-mono">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>RFC 822 RAW HEADER & BODY TEXT EDITOR</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPastedEmail('')}
                    className="text-[11px] text-slate-400 hover:text-rose-400 font-mono transition-colors"
                  >
                    Clear Editor
                  </button>
                </div>
              </div>

              <div className="relative">
                <textarea
                  rows={14}
                  value={pastedEmail}
                  onChange={(e) => setPastedEmail(e.target.value)}
                  placeholder={`From: "Microsoft Security Team" <no-reply@auth-update-m365.online>
To: corporate-user@enterprise-defense.gov.in
Subject: Urgent Action Required: Microsoft 365 Password Expiration Notice
Date: Tue, 01 Sep 2026 14:20:11 +0530
Message-ID: <20260901-security-alert-99128@auth-update.top>

Dear Employee,
Your Microsoft 365 enterprise password will expire in 2 hours.
Please authenticate via our secure portal:
https://login-microsoft365-verify.auth-update.top/sso/login?id=89274`}
                  className="w-full p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 leading-relaxed resize-none selection:bg-cyan-500/30 font-normal"
                />
                <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-500 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                  {pastedEmail.length} chars • {pastedEmail.split('\n').length} lines
                </div>
              </div>
            </div>
          )}

          {/* Action Row: Attachment Picker Button & Multi-attachment List */}
          <div className="p-4 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 font-mono">
                <Paperclip className="w-4 h-4 text-cyan-400" />
                <span>SUSPICIOUS ATTACHMENTS ({attachments.length})</span>
              </div>

              {/* Upload Attachment Button */}
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-cyan-300 cursor-pointer transition-all shadow-sm">
                <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload Attachment</span>
                <input
                  type="file"
                  multiple
                  onChange={handleAttachmentUpload}
                  className="hidden"
                  accept=".pdf,.docx,.doc,.zip,.rar,.iso,.exe,.bin,.html"
                />
              </label>
            </div>

            {attachments.length === 0 ? (
              <p className="text-[11px] text-slate-500 font-mono">
                Optional: Upload suspected malware attachments (PDF, DOCX, ZIP, ISO) for static heuristic hash & entropy analysis.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate max-w-[160px] font-semibold">{att.name}</span>
                    <span className="text-[10px] text-slate-500">({Math.round(att.size / 1024)} KB)</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="text-slate-400 hover:text-rose-400 transition-colors ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Primary CTA: Analyze with AI Button */}
          <button
            onClick={handleAnalyzeWithAi}
            disabled={isAnalyzing}
            className="w-full py-4 rounded-[20px] bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 group cursor-pointer"
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
                <span>Analyzing email...</span>
              </span>
            ) : (
              <>
                <Zap className="w-4 h-4 text-cyan-300 group-hover:scale-110 transition-transform" />
                <span>Analyze with AI Engine</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* Right Column: Live Email Preview Panel */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col justify-between min-h-[580px] relative overflow-hidden">
            {/* Live Scan Laser Line Animation Overlay if Analyzing */}
            {isAnalyzing && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-laser z-20 pointer-events-none" />
            )}

            <div className="space-y-4">
              {/* Header Preview Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Live Email Forensic Preview
                  </span>
                </div>

                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-950 border border-slate-800">
                  <button
                    onClick={() => setPreviewMode('rendered')}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                      previewMode === 'rendered'
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Rendered View
                  </button>
                  <button
                    onClick={() => setPreviewMode('raw')}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                      previewMode === 'raw'
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Header Syntax
                  </button>
                </div>
              </div>

              {/* Parsed Metadata Headers Card */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 font-mono text-xs space-y-2">
                <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-slate-800/60">
                  <span className="text-slate-500 shrink-0 text-[11px]">SUBJECT:</span>
                  <span className="font-bold text-white text-right truncate">
                    {parsedPreview.subject}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 shrink-0 text-[11px]">FROM:</span>
                  <span className="text-cyan-300 text-right truncate">
                    {parsedPreview.sender}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 shrink-0 text-[11px]">TO:</span>
                  <span className="text-slate-300 text-right truncate">
                    {parsedPreview.recipient}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 shrink-0 text-[11px]">DATE:</span>
                  <span className="text-slate-400 text-right text-[11px]">
                    {parsedPreview.date}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                  <span className="text-slate-500 shrink-0 text-[11px]">EXTRACTED ARTIFACTS:</span>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-cyan-300 border border-blue-500/20">
                      {parsedPreview.urls.length} URLs
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {attachments.length} Attachments
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Content Viewer */}
              {previewMode === 'rendered' ? (
                <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 space-y-3 max-h-72 overflow-y-auto leading-relaxed font-sans">
                  <div className="whitespace-pre-wrap font-sans text-slate-200">
                    {parsedPreview.body || '(Email message body will render here once pasted or uploaded)'}
                  </div>

                  {parsedPreview.urls.length > 0 && (
                    <div className="pt-3 border-t border-slate-800/80 space-y-1.5 font-mono text-[11px]">
                      <span className="text-slate-400 font-bold block">DETECTED HYPERLINK TARGETS:</span>
                      {parsedPreview.urls.map((u, i) => (
                        <div key={i} className="p-1.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 truncate flex items-center gap-1.5">
                          <ExternalLink className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="truncate">{u}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1 max-h-72 overflow-y-auto leading-relaxed">
                  <div className="text-cyan-400 font-bold">Return-Path: {parsedPreview.returnPath}</div>
                  <div className="text-cyan-400 font-bold">Message-ID: {parsedPreview.messageId}</div>
                  <div>From: {parsedPreview.sender}</div>
                  <div>To: {parsedPreview.recipient}</div>
                  <div>Subject: {parsedPreview.subject}</div>
                  <div>Date: {parsedPreview.date}</div>
                  <div>MIME-Version: 1.0</div>
                  <div>Content-Type: multipart/alternative; boundary="---boundary---"</div>
                  <div className="text-slate-600">X-Spam-Checker-Version: PhishGuard AI Engine 4.2</div>
                </div>
              )}
            </div>

            {/* Quick Heuristic Readiness Footer */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Parser Status: Ready for Ingestion</span>
              </span>
              <span className="text-cyan-400">SIH 2026 Engine</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Recent Uploaded Files Panel */}
      <div className="p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Recent Uploaded Files & Ingestion Audit Log</span>
            </h2>
            <p className="text-xs text-slate-400">
              Archived threat scans and parsed evidence payloads ready for re-inspection
            </p>
          </div>

          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
            {recentFiles.length} Scans Archived
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                <th className="pb-3 font-semibold">File / Subject</th>
                <th className="pb-3 font-semibold">Source Ingestion</th>
                <th className="pb-3 font-semibold">Size</th>
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold">Risk Index</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {Array.from(new Map((recentFiles || []).filter(Boolean).map(f => [f?.id, f])).values()).filter(Boolean).map((file, index) => (
                <tr key={`${file.id}-${index}`} className="hover:bg-slate-900/60 transition-colors group">
                  <td className="py-3 pr-4">
                    <div className="font-bold text-white group-hover:text-cyan-300 transition-colors truncate max-w-xs">
                      {file.fileName}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs font-sans">
                      {file.subject}
                    </div>
                  </td>
                  <td className="py-3 text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px]">
                      {file.source}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">{file.fileSize}</td>
                  <td className="py-3 text-slate-400 text-[11px]">{file.timestamp}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      file.threatLevel === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : file.threatLevel === 'SAFE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}>
                      {file.riskScore}% {file.threatLevel}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleLoadRecentFile(file)}
                      className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-[11px] font-semibold transition-all"
                    >
                      Load in Preview
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Modal Loading State with Multi-Stage Scanning Animation */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md p-8 rounded-[24px] bg-slate-900 border border-cyan-500/40 shadow-2xl shadow-cyan-500/10 space-y-6 text-center relative overflow-hidden"
            >
              {/* Pulsing Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Animated Radar Icon */}
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 animate-ping opacity-60" />
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                  <Bot className="w-8 h-8 animate-bounce" />
                </div>
              </div>

              {/* Title & Status */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs mb-1">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>Analyzing email...</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  PhishGuard AI Deep Scanning
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Executing RFC 5322 Protocol & Multimodal Cognitive Analysis
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-teal-300"
                    initial={{ width: '10%' }}
                    animate={{ width: `${scanProgress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Progress: {scanProgress}%</span>
                  <span className="text-cyan-400">Stage {scanStep + 1} of 4</span>
                </div>
              </div>

              {/* Step-by-Step Scan Checklist */}
              <div className="space-y-2.5 text-left font-mono text-xs">
                <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                  scanStep >= 0 ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  {scanStep > 0 ? <CheckCircle2 className="w-4 h-4 text-cyan-400" /> : <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />}
                  <span>Deconstructing RFC 822 MIME & Payload</span>
                </div>

                <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                  scanStep >= 1 ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  {scanStep > 1 ? <CheckCircle2 className="w-4 h-4 text-cyan-400" /> : scanStep === 1 ? <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> : <Clock className="w-4 h-4" />}
                  <span>Validating SPF, DKIM & DMARC Alignment</span>
                </div>

                <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                  scanStep >= 2 ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  {scanStep > 2 ? <CheckCircle2 className="w-4 h-4 text-cyan-400" /> : scanStep === 2 ? <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> : <Clock className="w-4 h-4" />}
                  <span>Scanning Outbound URLs & Sandbox Hops</span>
                </div>

                <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                  scanStep >= 3 ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  {scanStep >= 3 ? <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> : <Clock className="w-4 h-4" />}
                  <span>Evaluating Cognitive BEC & Urgency Indicators</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnalyzeEmail;
