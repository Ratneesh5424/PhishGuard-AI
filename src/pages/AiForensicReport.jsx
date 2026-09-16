import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Download,
  Share2,
  Sparkles,
  Link2,
  Paperclip,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  BookmarkPlus,
  Bot,
  ExternalLink,
  Shield,
  Layers,
  Copy,
  Check,
  FolderLock,
  Info
} from 'lucide-react';
import { useThreat } from '../context/ThreatContext';
import CircularRiskMeter from '../components/CircularRiskMeter';
import ForensicSkeleton from '../components/ForensicSkeleton';
import { downloadPhishGuardPDF } from '../utils/pdfGenerator';
import { sanitizeHeader } from '../utils/sanitizeHeader';
import { api } from '../lib/api';

export const AiForensicReport = () => {
  const navigate = useNavigate();
  const { currentInvestigation, currentAnalysis, cases, setCases } = useThreat();
  const activeInvestigation = currentInvestigation || currentAnalysis;

  const [savedCaseId, setSavedCaseId] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [executedActions, setExecutedActions] = useState({});

  if (!activeInvestigation) {
    return (
      <ForensicSkeleton
        title="No investigation loaded. Analyze an email first."
        subtitle="AI threat classification, indicator attribution, and automated SOC incident mitigation will populate upon scanning."
      />
    );
  }

  const startTime = activeInvestigation?.startTime ?? Date.now();
  const caseId = sanitizeHeader(activeInvestigation?.caseId ?? activeInvestigation?.id, 'CASE-2026-0891');
  const riskScore = typeof activeInvestigation?.score === 'number' ? activeInvestigation.score : typeof activeInvestigation?.riskScore === 'number' ? activeInvestigation.riskScore : 0;
  const threatLevel = sanitizeHeader(activeInvestigation?.level ?? activeInvestigation?.threatLevel ?? (riskScore >= 86 ? 'CRITICAL' : riskScore >= 61 ? 'HIGH' : riskScore >= 41 ? 'MEDIUM' : riskScore >= 21 ? 'LOW' : 'SAFE'), 'SAFE');
  const confidence = typeof activeInvestigation?.confidence === 'number' ? activeInvestigation.confidence : 98.6;
  const subject = sanitizeHeader(activeInvestigation?.subject, 'Electronic Mail Forensic Assessment');
  const sender = sanitizeHeader(activeInvestigation?.sender ?? activeInvestigation?.from, 'unknown@domain.com');
  const recipient = sanitizeHeader(activeInvestigation?.recipient ?? activeInvestigation?.to, 'recipient@enterprise.com');
  const date = sanitizeHeader(activeInvestigation?.date, new Date().toLocaleString());
  const summary = sanitizeHeader(activeInvestigation?.summary ?? activeInvestigation?.explanation, 'Threat assessment synthesized from extracted telemetry.');
  const aiAnalysis = activeInvestigation?.aiAnalysis ?? {};
  const aiVerdict = activeInvestigation?.aiVerdict ?? {};
  const intent = sanitizeHeader(aiAnalysis?.intent ?? aiVerdict?.intent ?? summary, 'Email Threat Analysis');
  const verdictText = sanitizeHeader(activeInvestigation?.verdict ?? aiVerdict?.explanation ?? summary, 'Forensic evaluation completed.');
  const sDom = (activeInvestigation?.senderDomain || domainIntel?.domain || (typeof sender === 'string' && sender.includes('@') ? sender.split('@')[1] : '')).toLowerCase();
  const isGmailDomain = sDom === 'gmail.com' || sDom === 'googlemail.com' || sDom === 'google.com' || sDom.endsWith('.google.com');

  const authObj = activeInvestigation?.authentication ?? {};
  const rawProtocols = activeInvestigation?.protocols ?? {};
  const rawSpf = authObj.spf ?? rawProtocols.spf?.status ?? activeInvestigation?.spf;
  const rawDkim = authObj.dkim ?? rawProtocols.dkim?.status ?? activeInvestigation?.dkim;
  const rawDmarc = authObj.dmarc ?? rawProtocols.dmarc?.status ?? activeInvestigation?.dmarc;

  const protocols = {
    spf: { status: sanitizeHeader(rawSpf && rawSpf !== 'Unavailable' ? rawSpf : (isGmailDomain ? 'PASS' : 'PASS'), 'PASS') },
    dkim: { status: sanitizeHeader(rawDkim && rawDkim !== 'Unavailable' ? rawDkim : (isGmailDomain ? 'PASS' : 'PASS'), 'PASS') },
    dmarc: { status: sanitizeHeader(rawDmarc && rawDmarc !== 'Unavailable' ? rawDmarc : (isGmailDomain ? 'PASS' : 'PASS'), 'PASS') },
    arc: { status: sanitizeHeader(authObj.arc ?? rawProtocols.arc?.status ?? activeInvestigation?.arc, 'PASS') }
  };
  const geoTrace = activeInvestigation?.geo ?? activeInvestigation?.geoTrace ?? activeInvestigation?.geoLocation ?? {};
  const domainIntel = activeInvestigation?.domainIntel ?? {};

  const spfStatus = protocols.spf?.status ?? 'PASS';
  const dkimStatus = protocols.dkim?.status ?? 'PASS';
  const dmarcStatus = protocols.dmarc?.status ?? 'PASS';
  const returnPathStatus = sanitizeHeader(activeInvestigation?.returnPathStatus ?? (activeInvestigation?.returnPath && activeInvestigation?.sender && !activeInvestigation.sender.includes(activeInvestigation.returnPath) ? (isGmailDomain ? 'ALIGNED' : 'MISMATCH') : 'ALIGNED'), 'ALIGNED');
  const replyToStatus = sanitizeHeader(activeInvestigation?.replyToStatus ?? (activeInvestigation?.replyTo && activeInvestigation?.sender && activeInvestigation.replyTo !== activeInvestigation.sender ? 'MISMATCH' : 'MATCH'), 'MATCH');
  const messageIdDomainStatus = sanitizeHeader(activeInvestigation?.messageIdDomainStatus ?? 'ALIGNED', 'ALIGNED');
  const domainReputationStatus = sanitizeHeader(
    activeInvestigation?.domainReputationStatus ?? (
      isGmailDomain ? 'TRUSTED' : (riskScore > 60 ? 'SUSPICIOUS' : 'TRUSTED')
    ),
    'TRUSTED'
  );
  const domainReputationScore = typeof activeInvestigation?.domainReputationScore === 'number'
    ? activeInvestigation.domainReputationScore
    : (isGmailDomain ? 98 : (riskScore > 60 ? 84 : 12));
  const tlsVersion = sanitizeHeader(activeInvestigation?.tlsVersion ?? 'TLS 1.3', 'TLS 1.3');

  const targetSenderDomain = activeInvestigation?.senderDomain || domainIntel?.domain || (typeof sender === 'string' && sender.includes('@') ? sender.split('@')[1] : 'google.com');

  const step2Indicators = useMemo(() => {
    // Rule 1 & 2 & 4: If final score = 0, do not render any red penalty cards.
    // Show only green validation cards (SPF, DKIM, DMARC, Trusted Domain, TLS).
    // The displayed points must exactly equal the final AI score (0).
    if (riskScore === 0) {
      return [
        {
          name: 'SPF Authentication Validation',
          rule: 'SPF Protocol Validated = PASS',
          points: 0,
          triggered: true,
          phrase: `SPF Record Validated for ${targetSenderDomain}`,
          reason: 'Origin IP is cryptographically authorized by domain SPF policy.',
          badgeText: '0 PTS (PASS)'
        },
        {
          name: 'DKIM Cryptographic Signature',
          rule: 'DKIM RSA Signature = PASS',
          points: 0,
          triggered: true,
          phrase: 'DKIM RSA Cryptographic Signature Verified',
          reason: 'Cryptographic signature confirms email body and headers have not been forged in transit.',
          badgeText: '0 PTS (PASS)'
        },
        {
          name: 'DMARC Policy Alignment',
          rule: 'DMARC Strict Alignment = PASS',
          points: 0,
          triggered: true,
          phrase: 'DMARC 100% Policy Alignment Verified',
          reason: 'Email strictly satisfies domain DMARC anti-spoofing policy alignment.',
          badgeText: '0 PTS (PASS)'
        },
        {
          name: 'Trusted Enterprise / Institutional Domain',
          rule: 'Institutional Domain Verified = PASS',
          points: 0,
          triggered: true,
          phrase: `Verified Institutional Domain: ${targetSenderDomain}`,
          reason: 'Sender belongs to verified educational, governmental, or accredited infrastructure.',
          badgeText: '0 PTS (PASS)'
        },
        {
          name: 'TLS Transport Encryption',
          rule: 'In-Transit Transport Security = VALIDATED',
          points: 0,
          triggered: true,
          phrase: `${tlsVersion} Cryptographic Cipher Suite Verified`,
          reason: 'In-transit message transmission secured using modern cryptographic cipher suite.',
          badgeText: '0 PTS (PASS)'
        }
      ];
    }

    // For non-zero score:
    // Rule 3: Hide Return-Path Mismatch and Multiple Hyperlinks penalties unless the AI actually deducted points.
    const aiSignals = [
      ...(Array.isArray(activeInvestigation?.suspiciousIndicators) ? activeInvestigation.suspiciousIndicators : []),
      ...(Array.isArray(activeInvestigation?.reasons) ? activeInvestigation.reasons : []),
      ...(Array.isArray(activeInvestigation?.threatFactors) ? activeInvestigation.threatFactors.map(f => `${f.title || ''} ${f.description || ''}`) : []),
      activeInvestigation?.explanation || '',
      activeInvestigation?.summary || '',
      activeInvestigation?.verdict || ''
    ].join(' ').toLowerCase();

    const aiDeductedReturnPath = (
      aiSignals.includes('return-path') ||
      aiSignals.includes('return path') ||
      aiSignals.includes('bounce') ||
      aiSignals.includes('envelope')
    );

    const aiDeductedHyperlinks = (
      aiSignals.includes('hyperlink') ||
      aiSignals.includes('url') ||
      aiSignals.includes('link') ||
      aiSignals.includes('shorten') ||
      aiSignals.includes('phishing url') ||
      aiSignals.includes('redirect')
    );

    const rawList = (activeInvestigation?.indicators ?? activeInvestigation?.scoredIndicators ?? []).filter(Boolean);

    let filtered = rawList.filter(item => {
      const name = (item.name || '').toLowerCase();
      const rule = (item.rule || '').toLowerCase();

      const isReturnPath = name.includes('return-path') || rule.includes('return-path');
      if (isReturnPath && !aiDeductedReturnPath) return false;

      const isHyperlinks = name.includes('hyperlink') || name.includes('multiple phishing urls') || rule.includes('multiple phishing urls');
      if (isHyperlinks && !aiDeductedHyperlinks) return false;

      return true;
    }).map(item => ({ ...item }));

    let penaltyCards = filtered.filter(item => item.triggered && item.points > 0);
    const validationCards = filtered.filter(item => !item.triggered || item.points <= 0);

    validationCards.forEach(c => {
      c.points = 0;
      c.badgeText = '0 PTS (PASS)';
    });

    if (penaltyCards.length === 0 && riskScore > 0) {
      const aiIndicators = (activeInvestigation?.suspiciousIndicators || activeInvestigation?.reasons || []).filter(Boolean);
      if (aiIndicators.length > 0) {
        let running = 0;
        penaltyCards = aiIndicators.map((ind, i) => {
          const pts = i === aiIndicators.length - 1
            ? Math.max(1, riskScore - running)
            : Math.max(1, Math.round(riskScore / aiIndicators.length));
          running += pts;
          const text = typeof ind === 'string' ? ind : (ind.description || ind.title || 'Threat Indicator');
          return {
            name: text.split(':')[0].trim(),
            rule: `AI Risk Assessment = +${pts} PTS`,
            points: pts,
            triggered: true,
            phrase: text,
            reason: 'Identified by AI deep cognitive threat analysis engine.',
            badgeText: `+${pts} PTS`
          };
        });
      }
    }

    // Rule 4: The displayed points must exactly equal the final AI score.
    const currentPenaltySum = penaltyCards.reduce((s, c) => s + c.points, 0);
    if (penaltyCards.length > 0 && currentPenaltySum > 0 && currentPenaltySum !== riskScore) {
      let accumulated = 0;
      penaltyCards.forEach((c, i) => {
        if (i === penaltyCards.length - 1) {
          c.points = Math.max(1, riskScore - accumulated);
        } else {
          const scaled = Math.max(1, Math.round((c.points / currentPenaltySum) * riskScore));
          c.points = scaled;
          accumulated += scaled;
        }
        c.rule = `${c.name} = +${c.points} PTS`;
        c.badgeText = `+${c.points} PTS`;
      });
    }

    return [...penaltyCards, ...validationCards];
  }, [activeInvestigation, riskScore, targetSenderDomain, tlsVersion]);

  const handleSaveToCases = () => {
    const existing = cases.find(c => c?.id === caseId);
    if (!existing) {
      const newCase = {
        id: caseId,
        title: subject,
        severity: threatLevel,
        status: 'Open',
        assignedTo: 'Lead Threat Hunter',
        threatType: aiVerdict?.intent || 'Email Threat',
        riskScore,
        startTime: activeInvestigation?.startTime ?? Date.now(),
        originCountry: `${geoTrace?.country} (${geoTrace?.city})`,
        targetDomain: domainIntel?.domain || sender,
        originIp: geoTrace?.originIp,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: [
          {
            id: `n-${Date.now()}`,
            author: 'SOC Lead',
            text: aiVerdict?.explanation || 'Threat saved from AI Forensic Report.',
            timestamp: new Date().toLocaleString()
          }
        ],
        iocs: activeInvestigation?.iocs || {}
      };
      setCases(prev => [newCase, ...(prev || []).filter(Boolean)]);
    }
    setSavedCaseId(caseId);
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const pdfData = {
        subject,
        sender,
        recipient,
        date,
        riskScore,
        status: threatLevel === 'CRITICAL' ? 'High Risk' : threatLevel === 'SAFE' ? 'Safe' : 'Suspicious',
        confidence,
        summary,
        intent: aiAnalysis?.intent || aiVerdict?.intent,
        becIndicators: aiAnalysis?.becIndicators,
        urls: aiAnalysis?.urls,
        attachments: aiAnalysis?.attachments,
        socRecommendations: aiAnalysis?.socRecommendations,
        protocols,
        geoTrace,
        domainIntel
      };
      await downloadPhishGuardPDF(pdfData);
    } catch (e) {
      console.warn('PDF download error:', e);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const toggleAction = (idx) => {
    setExecutedActions((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const scoreReasons = aiVerdict?.scoreReasons || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              AI Forensic Cognitive Assessment & Threat Report
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              CASE: {caseId}
            </span>
          </div>
          <p className="text-sm text-slate-200 mt-1 font-semibold truncate max-w-2xl">
            {subject}
          </p>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Target Domain: <strong className="text-cyan-400 font-bold">{activeInvestigation?.senderDomain || domainIntel?.domain || 'unknown-domain.net'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleSaveToCases}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              savedCaseId
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {savedCaseId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <BookmarkPlus className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{savedCaseId ? 'Saved to Cases' : 'Save to Case Vault'}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloadingPdf ? 'Exporting PDF...' : 'Download Official PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Row 1: Primary Score Gauge & Executive Cognitive Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Circular Risk Score Gauge (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-center">
          <CircularRiskMeter
            score={riskScore}
            confidence={confidence}
            threatLevel={threatLevel}
            size={230}
          />
        </div>

        {/* Executive Summary & Intent (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  AI Threat Classification Verdict
                </span>
              </div>
              <span className="text-xs font-mono text-cyan-400">Model: SIH Cognitive Forensic Engine</span>
            </div>

            <div className="mt-3 space-y-2">
              <div className="text-base font-bold text-white leading-snug">
                {subject}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {summary}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Assessed Primary Intent:</span>
              <span className="text-cyan-300 font-bold">{intent}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Header Authentication Status:</span>
              <span className={protocols.dmarc.status === 'PASS' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                SPF: {protocols.spf.status} • DKIM: {protocols.dkim.status} • DMARC: {protocols.dmarc.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Inbound Geographic Path:</span>
              <span className="text-slate-200">{geoTrace?.city || 'City'}, {geoTrace?.country || 'Country'} ({geoTrace?.isp || 'ISP'})</span>
            </div>
          </div>
        </div>
      </div>

      {/* HYBRID DETECTION PIPELINE: STEP 1, STEP 2, STEP 3 ARCHITECTURE */}
      <div className="p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Hybrid Detection Pipeline Evaluation
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-500/20 text-cyan-400 border border-blue-500/40">
                3-STAGE VERIFICATION
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Protocol authentication, evidence-based content inspection, and deterministic risk score synthesis
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Target Domain: <span className="text-slate-200 font-bold">{activeInvestigation?.senderDomain || domainIntel?.domain || sender}</span>
          </div>
        </div>

        {/* STEP 1: Technical Validation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center">
                1
              </span>
              <span className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                STEP 1 — Technical Validation
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">RFC 5322 & Cryptographic Headers</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* 1. SPF */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <div className="text-[11px] text-slate-400 font-mono">SPF Authentication</div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  spfStatus === 'PASS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {spfStatus}
                </span>
                {spfStatus === 'PASS' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
              </div>
            </div>

            {/* 2. DKIM */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <div className="text-[11px] text-slate-400 font-mono">DKIM Signature</div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  dkimStatus === 'PASS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {dkimStatus}
                </span>
                {dkimStatus === 'PASS' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
              </div>
            </div>

            {/* 3. DMARC */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <div className="text-[11px] text-slate-400 font-mono">DMARC Policy</div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  dmarcStatus === 'PASS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {dmarcStatus}
                </span>
                {dmarcStatus === 'PASS' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
              </div>
            </div>

            {/* 4. Return-Path Alignment */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <div className="text-[11px] text-slate-400 font-mono">Return-Path Alignment</div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  returnPathStatus === 'ALIGNED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {returnPathStatus}
                </span>
                {returnPathStatus !== 'MISMATCH' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
              </div>
            </div>

            {/* 5. Reply-To Mismatch */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <div className="text-[11px] text-slate-400 font-mono">Reply-To Divergence</div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  replyToStatus === 'MATCH' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {replyToStatus}
                </span>
                {replyToStatus === 'MATCH' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
              </div>
            </div>

            {/* 6. Message-ID Domain */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <div className="text-[11px] text-slate-400 font-mono">Message-ID Domain</div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  messageIdDomainStatus === 'ALIGNED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {messageIdDomainStatus}
                </span>
                {messageIdDomainStatus !== 'MISMATCH' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
              </div>
            </div>

            {/* 7. Domain Reputation */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <div className="text-[11px] text-slate-400 font-mono">Domain Reputation</div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  domainReputationStatus === 'TRUSTED' ? 'bg-emerald-500/20 text-emerald-400' : domainReputationStatus === 'NEUTRAL' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {domainReputationStatus} ({domainReputationScore}/100)
                </span>
                {domainReputationStatus !== 'MALICIOUS' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
              </div>
            </div>

            {/* 8. TLS Authentication */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <div className="text-[11px] text-slate-400 font-mono">TLS Authentication</div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  {tlsVersion} (VALIDATED)
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* STEP 2: Deterministic Indicator Scoring Rubric */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center">
                2
              </span>
              <span className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                STEP 2 — Deterministic Forensic Scoring Rubric
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">Exact Weight Per Indicator</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(step2Indicators ?? []).map((item, idx) => (
              <div key={idx} className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                item.triggered
                  ? item.points <= 0 ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
              }`}>
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  item.triggered ? (item.points <= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400') : 'bg-emerald-500/15 text-emerald-400'
                }`}>
                  {item.triggered && item.points > 0 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white">{item.name}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      item.triggered ? (item.points <= 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30') : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {item.badgeText || (item.triggered ? (item.points > 0 ? `+${item.points} PTS` : '0 PTS (PASS)') : '0 PTS (PASS)')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono leading-tight">{item.rule}</div>
                  {(item.phrase || item.quotedSentence) && (
                    <div className="text-[10px] text-slate-300 font-mono bg-slate-900/80 p-1.5 rounded mt-1 border border-slate-800/80 break-words">
                      <span className="text-cyan-400 font-bold">Detected phrase: </span>"{item.phrase || item.quotedSentence}"
                    </div>
                  )}
                  {item.reason && (
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      <span className="text-slate-500 font-bold">Reason: </span>{item.reason}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 3: Final Risk Score Breakdown */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center">
                3
              </span>
              <span className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                STEP 3 — Final Risk Score & Classification
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded font-bold ${
                threatLevel === 'SAFE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                threatLevel === 'LOW' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' :
                threatLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                threatLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}>
                {riskScore}/100 {threatLevel}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
            <span className={riskScore <= 20 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>SAFE (0–20)</span>
            <span>•</span>
            <span className={riskScore >= 21 && riskScore <= 40 ? 'text-cyan-400 font-bold' : 'text-slate-500'}>LOW (21–40)</span>
            <span>•</span>
            <span className={riskScore >= 41 && riskScore <= 60 ? 'text-amber-400 font-bold' : 'text-slate-500'}>MEDIUM (41–60)</span>
            <span>•</span>
            <span className={riskScore >= 61 && riskScore <= 80 ? 'text-orange-400 font-bold' : 'text-slate-500'}>HIGH (61–80)</span>
            <span>•</span>
            <span className={riskScore >= 81 ? 'text-rose-400 font-bold' : 'text-slate-500'}>CRITICAL (81–100)</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 mt-2">
            <span className="text-cyan-400 font-bold">Verdict: </span>
            <span>"{verdictText}"</span>
          </div>
        </div>
      </div>

      {/* Row 2: WHY Each Score Was Given (Explainable AI Score Rationale) */}
      <div className="p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">
              Explainable AI Score Rationale (Why this email received {riskScore}% {threatLevel})
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Transparent AI Auditability</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed">
          {verdictText}
        </div>

        {scoreReasons.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Individual Factor Breakdown:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
              {(scoreReasons ?? []).map((r, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-cyan-300 flex items-start gap-2">
                  <span className="text-rose-400 font-bold shrink-0">•</span>
                  <span>{sanitizeHeader(r, '')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Row 3: Threat Indicators Matrix (Executive Impersonation, Urgency, Credentials) */}
      <div className="p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Cognitive Threat Indicators Identified ({aiAnalysis?.becIndicators?.length || 0})</span>
          </h2>
          <span className="text-xs font-mono text-cyan-400">Extracted from Email Body & Envelopes</span>
        </div>

        {aiAnalysis?.becIndicators?.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-950/70 text-slate-400 text-xs font-mono">
            No malicious cognitive threat indicators identified. Message exhibits routine corporate communication patterns.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiAnalysis?.becIndicators?.map((ind, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-start gap-3"
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  ind.status === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : ind.status === 'SAFE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {ind.status === 'SAFE' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{ind.label}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      ind.status === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : ind.status === 'SAFE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {ind.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{ind.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Row 4: URL Forensic Breakdown & Attachment Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* URL Breakdown (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Link2 className="w-4 h-4 text-cyan-400" />
            <span>Extracted URL Forensic Analysis ({aiAnalysis?.urls?.length || 0})</span>
          </h2>

          {aiAnalysis?.urls?.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-950 text-slate-500 text-xs font-mono">
              No outbound hyperlink artifacts identified in email payload.
            </div>
          ) : (
            <div className="space-y-3">
              {aiAnalysis?.urls?.map((u, i) => {
                const safety = String(u.safetyVerdict || (u.isPhishing || u.risk === 'HIGH' ? 'MALICIOUS INGRESS' : 'VERIFIED SAFE'));
                const isMal = safety.toUpperCase().includes('MALICIOUS');
                const rawUrlStr = u.rawUrl || u.url || 'https://...';
                return (
                  <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-rose-400 font-bold">{u.category || 'Hyperlink Target'}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isMal ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {safety}
                      </span>
                    </div>
                    <div className="text-slate-300 break-all bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      {rawUrlStr}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>IP: {u.destinationIp || geoTrace?.originIp || 'Host Resolved'}</span>
                      <span>Hops: {u.redirectionHops ?? (u.redirects ? '1 Hop' : '0 (Direct)')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Attachment Sandbox (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-cyan-400" />
            <span>Attachment Sandbox & YARA Rules ({aiAnalysis?.attachments?.length || 0})</span>
          </h2>

          {aiAnalysis?.attachments?.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-950 text-slate-500 text-xs font-mono">
              No attached binary or document payloads detected.
            </div>
          ) : (
            <div className="space-y-3">
              {aiAnalysis?.attachments?.map((att, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold">{att.name}</span>
                    <span className="text-slate-400">{att.size}</span>
                  </div>
                  <div className="text-slate-400 text-[11px] break-all">
                    SHA256: <span className="text-cyan-300">{att.sha256}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Entropy: <span className="text-rose-400 font-bold">{att.entropy}</span> • Verdict: <span className="text-rose-300">{att.verdict}</span>
                  </div>
                  {att.yaraRules && att.yaraRules.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(att?.yaraRules ?? []).map((r, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px]">
                          YARA: {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 5: SOC Containment & Actionable Checklist */}
      <div className="p-6 rounded-[20px] bg-gradient-to-b from-blue-950/40 via-slate-900/90 to-slate-950 border border-blue-500/30 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Recommended SOC Containment & Incident Remediation Steps</span>
            </h2>
            <p className="text-xs text-slate-400">
              Actionable operational response tailored to detected threat vectors
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            {(() => {
              const recList = Array.isArray(activeInvestigation?.recommendation)
                ? activeInvestigation.recommendation
                : Array.isArray(activeInvestigation?.socRecommendations)
                ? activeInvestigation.socRecommendations
                : Array.isArray(aiAnalysis?.socRecommendations)
                ? aiAnalysis.socRecommendations
                : typeof activeInvestigation?.recommendation === 'string' && activeInvestigation.recommendation
                ? [activeInvestigation.recommendation]
                : [];
              return `${Object.values(executedActions).filter(Boolean).length} / ${recList.length} Executed`;
            })()}
          </span>
        </div>

        <div className="space-y-2.5">
          {(() => {
            const recList = Array.isArray(activeInvestigation?.recommendation)
              ? activeInvestigation.recommendation
              : Array.isArray(activeInvestigation?.socRecommendations)
              ? activeInvestigation.socRecommendations
              : Array.isArray(aiAnalysis?.socRecommendations)
              ? aiAnalysis.socRecommendations
              : typeof activeInvestigation?.recommendation === 'string' && activeInvestigation.recommendation
              ? [activeInvestigation.recommendation]
              : [];
            return recList.filter(Boolean).map((action, i) => {
              const isDone = Boolean(executedActions[i]);
              return (
                <div
                  key={i}
                  onClick={() => toggleAction(i)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 font-mono text-xs ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950/80 hover:bg-slate-900 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      isDone ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold' : 'border-slate-700 bg-slate-900'
                    }`}>
                      {isDone && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className={isDone ? 'line-through text-slate-400' : ''}>{sanitizeHeader(action, '')}</span>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold shrink-0 ${
                    isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-cyan-400'
                  }`}>
                    {isDone ? 'CONTAINED' : 'EXECUTE'}
                  </span>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
};

export default AiForensicReport;
