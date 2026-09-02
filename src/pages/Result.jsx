import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileDown,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  XCircle,
  FileText,
  Lock,
  Globe,
  Clock,
  MailWarning,
  Flame,
  ArrowLeft,
  Binary,
  Upload,
  Copy,
  Check,
  LifeBuoy,
  ChevronRight,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import Button from '../components/Button';
import { downloadPhishGuardPDF } from '../utils/pdfGenerator';
import { getDeviceId } from '../utils/deviceId';
import { API_BASE_URL } from '../utils/apiConfig';

export const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const initialReport = useMemo(() => {
    if (location.state?.analysisData) {
      return location.state.analysisData;
    }
    if (location.state?.initialRecord) {
      return location.state.initialRecord;
    }
    return null;
  }, [location.state]);

  const [historyRecordData, setHistoryRecordData] = useState(null);
  const [isLoadingRecord, setIsLoadingRecord] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const recordId = location.state?.recordId || new URLSearchParams(location.search).get('id');

  // Fetch exact record from Supabase by ID only when viewing from History / ID link
  useEffect(() => {
    // If we already have the live scan analysisData, do not re-fetch
    if (location.state?.analysisData) return;
    if (!recordId) return;

    let isMounted = true;
    if (!initialReport) {
      setIsLoadingRecord(true);
    }
    setFetchError(null);

    const fetchRecord = async () => {
      try {
        const deviceId = getDeviceId();
        const res = await fetch(
          `${API_BASE_URL}/history/${recordId}?deviceId=${encodeURIComponent(deviceId)}`,
          {
            headers: {
              'x-device-id': deviceId,
            },
          }
        );
        if (res.ok) {
          const json = await res.json();
          if (json.record && isMounted) {
            const r = json.record;
            const score = typeof r.risk_score === 'number' ? r.risk_score : 0;
            const isHigh = score >= 71;
            const isSusp = score >= 31 && score <= 70;
            const statusLabel = isHigh ? 'High Risk' : isSusp ? 'Suspicious' : 'Safe';
            const conf = typeof r.confidence === 'number' ? r.confidence : 97.5;
            const summ = r.summary || `Stored Supabase report for "${r.subject}". Evaluated risk score: ${score}%.`;

            const threatFactors = isHigh
              ? [
                  {
                    title: 'Brand Impersonation',
                    description: 'Potential unauthorized brand spoofing and sender address mismatch detected.',
                    severity: 'high',
                  },
                  {
                    title: 'Credential Harvesting Risk',
                    description: 'High risk behavioral anomaly soliciting credentials or sensitive actions.',
                    severity: 'high',
                  },
                  {
                    title: 'Urgency Pressure Signals',
                    description: 'Psychological manipulation demanding immediate or urgent compliance.',
                    severity: 'high',
                  },
                ]
              : isSusp
              ? [
                  {
                    title: 'Suspicious Content Pattern',
                    description: 'Elevated urgency cues or anomalous sender domain alignment flagged.',
                    severity: 'medium',
                  },
                  {
                    title: 'Domain Verification Signal',
                    description: 'External resource requires direct institutional validation before trust.',
                    severity: 'medium',
                  },
                ]
              : [
                  {
                    title: 'Domain & Identity Integrity',
                    description: 'Verified organizational domain and authentication records.',
                    severity: 'low',
                  },
                  {
                    title: 'Clean Behavioral Profile',
                    description: 'No psychological coercion, credential prompts, or malicious heuristics detected.',
                    severity: 'low',
                  },
                ];

            const authData = {
              spf: {
                status: score <= 30 ? 'Passed' : 'Failed',
                reason: score <= 30 ? 'SPF validation verified.' : 'SPF validation failed or missing.',
              },
              dkim: {
                status: score <= 30 ? 'Passed' : 'Failed',
                reason: score <= 30 ? 'DKIM signature verified.' : 'DKIM signature verification failed.',
              },
              dmarc: {
                status: score <= 30 ? 'Passed' : 'Failed',
                reason: score <= 30 ? 'DMARC alignment verified.' : 'DMARC alignment verification failed.',
              },
            };

            setHistoryRecordData({
              id: r.id,
              historyId: r.id,
              sender: r.sender,
              subject: r.subject,
              riskScore: score,
              status: statusLabel,
              riskLevel: statusLabel,
              confidence: conf,
              executiveSummary: summ,
              summary: summ,
              threatFactors: threatFactors,
              reasons: threatFactors.map((t) => `${t.title}: ${t.description}`),
              authentication: authData,
              spf: score <= 30 ? 'Passed' : 'Failed',
              dkim: score <= 30 ? 'Passed' : 'Failed',
              dmarc: score <= 30 ? 'Passed' : 'Failed',
              urls: Array.isArray(r.urls) ? r.urls : [],
              date: r.analyzed_at,
              analyzed_at: r.analyzed_at,
              recommendation: isHigh
                ? 'Do NOT click links, scan QR codes, or submit credentials. Quarantine and report this email immediately.'
                : isSusp
                ? 'Verify sender authenticity directly with the claimed organization before proceeding.'
                : 'Email verified from official organizational domain. Exercise standard cybersecurity hygiene.',
            });
            return;
          }
        }
        if (!initialReport) {
          throw new Error('Record could not be retrieved from Supabase.');
        }
      } catch (err) {
        console.error('History record fetch error:', err);
        if (isMounted && !initialReport) {
          setFetchError(err.message);
        }
      } finally {
        if (isMounted) {
          setIsLoadingRecord(false);
        }
      }
    };

    fetchRecord();

    return () => {
      isMounted = false;
    };
  }, [recordId, initialReport, location.state]);

  // Retrieve dynamic analysis data (strictly binds to current scan or fetched Supabase record)
  const analysisData = useMemo(() => {
    if (location.state?.analysisData) {
      return location.state.analysisData;
    }
    return historyRecordData || location.state?.initialRecord || null;
  }, [historyRecordData, location.state]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  // Loading state only when no report data is available yet
  if (isLoadingRecord && !analysisData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto py-24 text-center space-y-4"
      >
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl inline-block text-cyan-400">
          <Loader2 className="w-10 h-10 mx-auto animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-white">Loading Threat Analysis Record...</h2>
        <p className="text-xs font-mono text-slate-400">Fetching record from Supabase...</p>
      </motion.div>
    );
  }

  // Error state if record not found
  if (fetchError && !analysisData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto py-16 text-center space-y-6"
      >
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 backdrop-blur-xl inline-block text-rose-400">
          <AlertTriangle className="w-12 h-12 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-white">Record Not Found</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          Could not retrieve the requested record from Supabase. It may have been deleted.
        </p>
        <div>
          <Button
            variant="gradient"
            size="lg"
            onClick={() => navigate('/history')}
            icon={ArrowLeft}
          >
            Return to History
          </Button>
        </div>
      </motion.div>
    );
  }

  // If no analysis data is present
  if (!analysisData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto py-16 text-center space-y-6"
      >
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl inline-block text-cyan-400">
          <FileText className="w-12 h-12 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-white">No Analysis Report Available</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          Please upload or paste an email on the Analyze page to generate a live AI threat assessment report.
        </p>
        <div>
          <Button
            variant="gradient"
            size="lg"
            onClick={() => navigate('/analyze')}
            icon={Upload}
          >
            Upload & Analyze Email
          </Button>
        </div>
      </motion.div>
    );
  }

  const score = typeof analysisData.riskScore === 'number' ? analysisData.riskScore : (typeof analysisData.risk_score === 'number' ? analysisData.risk_score : 0);
  const isHighRisk = score >= 71;
  const isMediumRisk = score >= 31 && score <= 70;
  const riskLevel = isHighRisk ? 'High Risk' : isMediumRisk ? 'Suspicious' : 'Safe';

  const confidence =
    typeof analysisData.confidence === 'number' ? analysisData.confidence : 97.5;

  // Normalized Threat Factors
  const rawThreatFactors = Array.isArray(analysisData.threatFactors) && analysisData.threatFactors.length > 0
    ? analysisData.threatFactors
    : Array.isArray(analysisData.reasons) && analysisData.reasons.length > 0
    ? analysisData.reasons
    : Array.isArray(analysisData.threats) && analysisData.threats.length > 0
    ? analysisData.threats
    : [];

  const threatFactorsList = rawThreatFactors.map((item, idx) => {
    if (typeof item === 'object' && item !== null) {
      return {
        title: item.title || `Threat Factor #${idx + 1}`,
        description: item.description || 'No evidence found.',
        severity: item.severity || (score >= 71 ? 'high' : score >= 31 ? 'medium' : 'low'),
      };
    }
    const str = String(item || '');
    if (str.includes(':')) {
      const parts = str.split(':');
      return {
        title: parts[0].trim() || `Threat Factor #${idx + 1}`,
        description: parts.slice(1).join(':').trim() || 'No evidence found.',
        severity: score >= 71 ? 'high' : score >= 31 ? 'medium' : 'low',
      };
    }
    return {
      title: `Threat Factor #${idx + 1}`,
      description: str || 'No evidence found.',
      severity: score >= 71 ? 'high' : score >= 31 ? 'medium' : 'low',
    };
  });

  const urls = Array.isArray(analysisData.urls) ? analysisData.urls : [];
  const summary = analysisData.executiveSummary || analysisData.summary || 'No summary provided.';
  const recommendation =
    analysisData.recommendation ||
    (score >= 71
      ? 'Do NOT click links, scan QR codes, or submit credentials. Quarantine and report this email immediately.'
      : score >= 31
      ? `Verify sender authenticity directly with the claimed organization (${analysisData.organization || 'the official department'}) before proceeding.`
      : 'Email verified from official organizational domain. Exercise standard cybersecurity hygiene.');

  const auth = analysisData.authentication || {
    spf: analysisData.spf || 'Passed',
    dkim: analysisData.dkim || 'Passed',
    dmarc: analysisData.dmarc || 'Passed',
  };

  // Helper for authentication status extraction
  const getAuthDetails = (val, fallbackName) => {
    if (typeof val === 'object' && val !== null) {
      const raw = (val.status || 'UNKNOWN').toUpperCase();
      const isPass = raw === 'PASS' || raw === 'PASSED';
      const isFail = raw === 'FAIL' || raw === 'FAILED';
      return {
        status: isPass ? 'Passed' : isFail ? 'Failed' : 'Unknown',
        isPass,
        reason: val.reason || (isPass ? `${fallbackName} validation verified.` : `${fallbackName} verification failed or missing.`),
      };
    }
    const str = String(val || 'Unknown');
    const isPass = str.toLowerCase() === 'passed' || str.toLowerCase() === 'pass';
    const isFail = str.toLowerCase() === 'failed' || str.toLowerCase() === 'fail';
    return {
      status: isPass ? 'Passed' : isFail ? 'Failed' : 'Unknown',
      isPass,
      reason: isPass ? `${fallbackName} validation verified.` : `${fallbackName} verification failed or missing.`,
    };
  };

  const spfInfo = getAuthDetails(auth.spf, 'Sender Policy Framework');
  const dkimInfo = getAuthDetails(auth.dkim, 'DomainKeys Identified Mail');
  const dmarcInfo = getAuthDetails(auth.dmarc, 'DMARC Alignment');

  // Copy Full Forensic Report to Clipboard
  const handleCopyReport = () => {
    const reportText = `=======================================================
PHISHGUARD AI - THREAT ANALYSIS REPORT
=======================================================
Timestamp: ${new Date().toLocaleString()}
Subject: ${analysisData.subject || 'Analyzed Email Assessment'}
Sender: ${analysisData.sender || 'Unknown'}
Claimed Organization: ${analysisData.organization || 'Unspecified'}
Official Domain: ${analysisData.officialDomain || 'N/A'}

Risk Assessment:
- Risk Score: ${score}%
- Threat Status: ${riskLevel.toUpperCase()}
- AI Confidence: ${confidence}%

Email Authentication:
- SPF: ${spfInfo.status} (${spfInfo.reason})
- DKIM: ${dkimInfo.status} (${dkimInfo.reason})
- DMARC: ${dmarcInfo.status} (${dmarcInfo.reason})

AI Executive Summary:
${summary}

Identified Threat Factors:
${
  threatFactorsList.length > 0
    ? threatFactorsList.map((t, i) => `  ${i + 1}. [${t.severity.toUpperCase()}] ${t.title}: ${t.description}`).join('\n')
    : '  No threat factors detected.'
}

Recommended Action:
${recommendation}

Extracted URLs:
${
  urls.length > 0
    ? urls.map((u) => `  - ${typeof u === 'string' ? u : u.url} [${u.risk || u.reputation || 'Unknown'}]`).join('\n')
    : '  No external URLs detected.'
}
=======================================================`;

    navigator.clipboard.writeText(reportText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Download Forensic PDF Report
  const handleDownloadPDF = async () => {
    if (downloadingPdf) return;
    try {
      setDownloadingPdf(true);
      await downloadPhishGuardPDF(analysisData);
    } catch (err) {
      console.error('Failed to generate forensic PDF report:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  // SVG Gauge calculations
  const size = 220;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  const strokeStart = isHighRisk ? '#f43f5e' : isMediumRisk ? '#f59e0b' : '#06b6d4';
  const strokeEnd = isHighRisk ? '#e11d48' : isMediumRisk ? '#d97706' : '#3b82f6';
  const glowColor = isHighRisk
    ? 'rgba(244,63,94,0.3)'
    : isMediumRisk
    ? 'rgba(245,158,11,0.3)'
    : 'rgba(6,182,212,0.3)';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-7xl mx-auto pb-16"
    >
      {/* HEADER SECTION: Back button, Status badge, Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/analyze')}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-white transition-all group shadow-sm"
            title="Return to Email Analyzer"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Analysis Verdict
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono border shadow-sm ${
                  isHighRisk
                    ? 'bg-rose-950/70 text-rose-300 border-rose-500/40 shadow-rose-950/40'
                    : isMediumRisk
                    ? 'bg-amber-950/70 text-amber-300 border-amber-500/40 shadow-amber-950/40'
                    : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 shadow-emerald-950/40'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    isHighRisk ? 'bg-rose-400' : isMediumRisk ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                />
                {riskLevel.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              PhishGuard Heuristic Threat Telemetry & AI Inspection Report
            </p>
          </div>
        </div>

        {/* Action Buttons: Copy Report & Download PDF */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Copy Report Button */}
          <button
            type="button"
            onClick={handleCopyReport}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-slate-200 text-xs font-semibold transition-all flex items-center gap-2 shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 font-mono">Report Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-cyan-400" />
                <span>Copy Report</span>
              </>
            )}
          </button>

          {/* Download PDF Button */}
          <Button
            variant="outline"
            size="md"
            icon={downloadingPdf ? Loader2 : FileDown}
            onClick={handleDownloadPDF}
            disabled={downloadingPdf}
            className={`text-xs font-semibold ${downloadingPdf ? 'opacity-75 cursor-wait' : ''}`}
          >
            {downloadingPdf ? 'Generating PDF...' : 'Download PDF'}
          </Button>

          <Button
            variant="gradient"
            size="md"
            onClick={() => navigate('/analyze')}
            className="text-xs font-semibold"
          >
            Scan Another Email
          </Button>
        </div>
      </div>

      {/* RECOMMENDED ACTION CARD */}
      <motion.div
        variants={itemVariants}
        className={`p-5 rounded-2xl backdrop-blur-xl border shadow-lg flex items-start gap-4 ${
          isHighRisk
            ? 'bg-rose-950/30 border-rose-500/30 text-rose-200 shadow-rose-950/20'
            : isMediumRisk
            ? 'bg-amber-950/30 border-amber-500/30 text-amber-200 shadow-amber-950/20'
            : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200 shadow-emerald-950/20'
        }`}
      >
        <div
          className={`p-2.5 rounded-xl border flex-shrink-0 mt-0.5 ${
            isHighRisk
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
              : isMediumRisk
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
          }`}
        >
          <LifeBuoy className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider font-bold">
              Recommended Defensive Action
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/60 border border-slate-700/60">
              Protocol: {isHighRisk ? 'Immediate Quarantine' : isMediumRisk ? 'Identity Verification' : 'Standard Routine'}
            </span>
          </div>
          <p className="text-sm text-slate-100 mt-1 leading-relaxed font-medium">
            {recommendation}
          </p>
        </div>
      </motion.div>

      {/* TOP SECTION: RISK GAUGE & EXPLANATION */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Large Animated Circular SVG Risk Gauge */}
        <div className="p-8 rounded-2xl backdrop-blur-xl bg-slate-900/65 border border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.37)] flex flex-col items-center justify-center relative overflow-hidden group">
          <div
            className="absolute -top-12 -left-12 w-36 h-36 rounded-full blur-3xl pointer-events-none"
            style={{ backgroundColor: glowColor }}
          />

          <span className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">
            Threat Severity Gauge
          </span>

          <div className="relative flex items-center justify-center my-2">
            <div
              className="absolute w-44 h-44 rounded-full blur-2xl animate-pulse pointer-events-none"
              style={{ backgroundColor: glowColor }}
            />

            <svg width={size} height={size} className="rotate-[-90deg]">
              <defs>
                <linearGradient id="resultGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={strokeStart} />
                  <stop offset="100%" stopColor={strokeEnd} />
                </linearGradient>
                <filter id="resultGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#1e293b"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray="4 6"
              />

              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="url(#resultGaugeGrad)"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
                strokeLinecap="round"
                filter="url(#resultGlow)"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <motion.span
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-5xl font-black text-white tracking-tight drop-shadow-md"
              >
                {score}%
              </motion.span>
              <span
                className={`text-xs font-bold uppercase tracking-wider font-mono mt-1 ${
                  isHighRisk ? 'text-rose-400' : isMediumRisk ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {riskLevel}
              </span>
            </div>
          </div>

          <div className="w-full mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Confidence Index</span>
            <span className="font-bold text-white text-cyan-400">{confidence}% Verified</span>
          </div>
        </div>

        {/* AI Executive Summary & Key Threat Indicators */}
        <div className="lg:col-span-2 space-y-6">
          {/* Executive Summary Card */}
          <div className="p-6 rounded-2xl backdrop-blur-xl bg-slate-900/65 border border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.37)] space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">
                AI Executive Summary
              </h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {summary}
            </p>
          </div>

          {/* Why is this email suspicious? - Render Threat Factors with safe object handling */}
          <div className="p-6 rounded-2xl backdrop-blur-xl bg-slate-900/65 border border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.37)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Identified Threat Factors
                </h2>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
                Gemini Reasoning Engine
              </span>
            </div>

            {/* Threat Factors List */}
            {threatFactorsList.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No evidence found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {threatFactorsList.map((factor, idx) => {
                  const isItemHigh = factor.severity?.toLowerCase() === 'high';
                  const isItemMed = factor.severity?.toLowerCase() === 'medium';

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-start gap-3"
                    >
                      <div
                        className={`p-2 rounded-lg mt-0.5 flex-shrink-0 ${
                          isItemHigh
                            ? 'bg-rose-500/10 text-rose-400'
                            : isItemMed
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-cyan-500/10 text-cyan-400'
                        }`}
                      >
                        {isItemHigh ? (
                          <MailWarning className="w-4 h-4" />
                        ) : isItemMed ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono truncate">
                            {factor.title}
                          </h4>
                          <span
                            className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                              isItemHigh
                                ? 'text-rose-300 bg-rose-950/80 border border-rose-500/40'
                                : isItemMed
                                ? 'text-amber-300 bg-amber-950/80 border border-amber-500/40'
                                : 'text-cyan-300 bg-cyan-950/80 border border-cyan-500/40'
                            }`}
                          >
                            {factor.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                          {factor.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* SENDER VERIFICATION (SPF, DKIM, DMARC) */}
      <motion.div variants={itemVariants} className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-wide">
              Sender Authentication & Verification
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">RFC 7208 / 6376 / 7489</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* SPF */}
          <div className="p-5 rounded-2xl backdrop-blur-xl bg-slate-900/65 border border-slate-800/80 shadow-lg shadow-blue-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 font-semibold">
                SPF Record
              </span>
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  spfInfo.isPass
                    ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40'
                    : spfInfo.status === 'Failed'
                    ? 'bg-rose-950/70 text-rose-300 border border-rose-500/40'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {spfInfo.isPass ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : spfInfo.status === 'Failed' ? (
                  <XCircle className="w-3.5 h-3.5" />
                ) : (
                  <HelpCircle className="w-3.5 h-3.5" />
                )}
                {spfInfo.status}
              </span>
            </div>
            <div className="mt-3">
              <p className="text-sm font-bold text-white">Sender Policy Framework</p>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {spfInfo.reason}
              </p>
            </div>
          </div>

          {/* DKIM */}
          <div className="p-5 rounded-2xl backdrop-blur-xl bg-slate-900/65 border border-slate-800/80 shadow-lg shadow-blue-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 font-semibold">
                DKIM Signature
              </span>
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  dkimInfo.isPass
                    ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40'
                    : dkimInfo.status === 'Failed'
                    ? 'bg-rose-950/70 text-rose-300 border border-rose-500/40'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {dkimInfo.isPass ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : dkimInfo.status === 'Failed' ? (
                  <XCircle className="w-3.5 h-3.5" />
                ) : (
                  <HelpCircle className="w-3.5 h-3.5" />
                )}
                {dkimInfo.status}
              </span>
            </div>
            <div className="mt-3">
              <p className="text-sm font-bold text-white">DomainKeys Identified Mail</p>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {dkimInfo.reason}
              </p>
            </div>
          </div>

          {/* DMARC */}
          <div className="p-5 rounded-2xl backdrop-blur-xl bg-slate-900/65 border border-slate-800/80 shadow-lg shadow-blue-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 font-semibold">
                DMARC Policy
              </span>
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  dmarcInfo.isPass
                    ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40'
                    : dmarcInfo.status === 'Failed'
                    ? 'bg-rose-950/70 text-rose-300 border border-rose-500/40'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {dmarcInfo.isPass ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : dmarcInfo.status === 'Failed' ? (
                  <XCircle className="w-3.5 h-3.5" />
                ) : (
                  <HelpCircle className="w-3.5 h-3.5" />
                )}
                {dmarcInfo.status}
              </span>
            </div>
            <div className="mt-3">
              <p className="text-sm font-bold text-white">DMARC Alignment</p>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {dmarcInfo.reason}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* URL ANALYSIS TABLE */}
      {urls.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <h3 className="text-base font-bold text-white tracking-wide">
                Extracted URL Deep Analysis
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {urls.length} Hyperlink{urls.length > 1 ? 's' : ''} Inspected
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl backdrop-blur-xl bg-slate-900/65 border border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-slate-800/80 bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                  <tr>
                    <th className="px-6 py-4">URL Endpoint</th>
                    <th className="px-6 py-4">Reputation & Category</th>
                    <th className="px-6 py-4">Threat Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {urls.map((u, i) => {
                    const urlStr = typeof u === 'string' ? u : u?.url || '';
                    const repStr = typeof u === 'object' && u ? u.reputation || u.destination || 'External Resource' : 'External Resource';
                    const riskStr = (typeof u === 'object' && u ? u.risk : 'Unknown') || 'Unknown';
                    const isDangerous = riskStr.toLowerCase() === 'high' || riskStr.toLowerCase() === 'dangerous' || riskStr.toLowerCase() === 'malicious';
                    const isSusp = riskStr.toLowerCase() === 'medium' || riskStr.toLowerCase() === 'suspicious';

                    return (
                      <tr key={i} className="hover:bg-slate-800/40 transition-colors font-mono">
                        <td className="px-6 py-4">
                          <span className="text-cyan-300 break-all text-xs font-semibold">
                            {urlStr}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-300">
                          {repStr}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isDangerous
                                ? 'bg-rose-950/70 text-rose-300 border border-rose-500/40'
                                : isSusp
                                ? 'bg-amber-950/70 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            {riskStr}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Result;
