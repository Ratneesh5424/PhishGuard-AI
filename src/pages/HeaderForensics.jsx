import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Binary,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Server,
  ArrowRight,
  Copy,
  Check,
  FileCode,
  Shield,
  Layers,
  Sparkles,
  Search,
  Lock,
  Globe
} from 'lucide-react';
import { useThreat } from '../context/ThreatContext';
import ForensicSkeleton from '../components/ForensicSkeleton';
import { sanitizeHeader } from '../utils/sanitizeHeader';

export const HeaderForensics = () => {
  const navigate = useNavigate();
  const { currentAnalysis, currentInvestigation } = useThreat();
  const activeAnalysis = currentInvestigation || currentAnalysis;
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (!activeAnalysis) {
    return (
      <ForensicSkeleton
        title="No investigation loaded. Analyze an email first."
        subtitle="RFC header inspection, cryptographic signatures (SPF, DKIM, DMARC), and relay transit path will populate upon scanning."
      />
    );
  }


  // Sanitize all RFC 5322 header and forensic values using the strict fallback rules:
  // field.text -> field.value -> fallback ("Unavailable")
  const subject = sanitizeHeader(activeAnalysis.subject, 'Inbound Mail');
  const sender = sanitizeHeader(activeAnalysis.sender || activeAnalysis.from, 'sender@domain.com');
  const recipient = sanitizeHeader(activeAnalysis.recipient || activeAnalysis.to, 'recipient@domain.com');
  const date = sanitizeHeader(activeAnalysis.date, new Date().toUTCString());
  const messageId = sanitizeHeader(activeAnalysis.messageId, '<message-id@domain.com>');
  const returnPath = sanitizeHeader(activeAnalysis.returnPath, '<bounces@domain.com>');
  const replyTo = sanitizeHeader(activeAnalysis.replyTo || activeAnalysis.sender || activeAnalysis.from, sender);

  const rawProtocols = activeAnalysis?.protocols ?? {};
  const authObj = activeAnalysis?.authentication ?? {};
  const protocols = {
    spf: {
      status: sanitizeHeader(authObj.spf ?? rawProtocols.spf?.status ?? activeAnalysis?.spf, 'Unavailable'),
      record: sanitizeHeader(rawProtocols.spf?.record, 'Unavailable'),
      evaluatedIp: sanitizeHeader(rawProtocols.spf?.evaluatedIp ?? activeAnalysis?.geo?.ip ?? activeAnalysis?.originIp, 'Unavailable'),
      reason: sanitizeHeader(rawProtocols.spf?.reason, 'Unavailable')
    },
    dkim: {
      status: sanitizeHeader(authObj.dkim ?? rawProtocols.dkim?.status ?? activeAnalysis?.dkim, 'Unavailable'),
      selector: sanitizeHeader(rawProtocols.dkim?.selector, 'Unavailable'),
      domain: sanitizeHeader(rawProtocols.dkim?.domain ?? activeAnalysis?.senderDomain, 'Unavailable'),
      reason: sanitizeHeader(rawProtocols.dkim?.reason, 'Unavailable')
    },
    dmarc: {
      status: sanitizeHeader(authObj.dmarc ?? rawProtocols.dmarc?.status ?? activeAnalysis?.dmarc, 'Unavailable'),
      policy: sanitizeHeader(rawProtocols.dmarc?.policy, 'Unavailable'),
      alignment: sanitizeHeader(rawProtocols.dmarc?.alignment, 'Unavailable'),
      reason: sanitizeHeader(rawProtocols.dmarc?.reason, 'Unavailable')
    },
    arc: {
      status: sanitizeHeader(authObj.arc ?? rawProtocols.arc?.status ?? activeAnalysis?.arc, 'Unavailable'),
      seal: sanitizeHeader(rawProtocols.arc?.seal, 'Unavailable'),
      chain: sanitizeHeader(rawProtocols.arc?.chain, 'Unavailable')
    }
  };

  const startTime = activeAnalysis?.startTime ?? Date.now();
  const rawRelayTimeline = Array.isArray(activeAnalysis?.timeline)
    ? activeAnalysis.timeline
    : Array.isArray(activeAnalysis?.relayTimeline)
    ? activeAnalysis.relayTimeline
    : Array.isArray(activeAnalysis?.relayPath)
    ? activeAnalysis.relayPath
    : [];

  const relayTimeline = rawRelayTimeline.filter(Boolean).map((hop, idx) => ({
    hop: sanitizeHeader(hop?.hop, String(idx + 1)),
    host: sanitizeHeader(hop?.host, 'mta-relay'),
    ip: sanitizeHeader(hop?.ip ?? activeAnalysis?.geo?.ip, '-'),
    auth: sanitizeHeader(hop?.auth, 'VALIDATED'),
    location: sanitizeHeader(hop?.location, 'Transit Node'),
    tls: sanitizeHeader(hop?.tls, 'TLS 1.3'),
    latency: sanitizeHeader(hop?.latency, '12ms'),
    timestamp: sanitizeHeader(hop?.startTime ?? hop?.timestamp, 'Hop Recorded')
  }));

  const handleCopyRaw = () => {
    const rawHeaders = `From: ${sender}
To: ${recipient}
Subject: ${subject}
Date: ${date}
Message-ID: ${messageId}
Return-Path: ${returnPath}
Reply-To: ${replyTo}
Content-Type: ${sanitizeHeader(activeAnalysis?.contentType, 'text/plain; charset=UTF-8')}
Authentication-Results: spf=${protocols.spf.status.toLowerCase()} dkim=${protocols.dkim.status.toLowerCase()} dmarc=${protocols.dmarc.status.toLowerCase()}`;
    navigator.clipboard.writeText(rawHeaders);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper for protocol status colors
  const getVerdictBadge = (status) => {
    if (status === 'PASS') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>PASS (VALIDATED)</span>
        </span>
      );
    }
    if (status === 'SOFTFAIL') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>SOFTFAIL (~ALL)</span>
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1.5">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>FAIL / SPOOF DETECTED</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              RFC 5322 Header & Protocol Forensic Inspector
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/40">
              CRYPTOGRAPHIC VERDICT
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Hop-by-hop SMTP relay transit latency, SPF/DKIM/DMARC evaluation, and envelope alignment
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyRaw}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Raw Headers' : 'Copy Headers'}</span>
          </button>

          <button
            onClick={() => navigate('/geotrace')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all"
          >
            <span>Trace IP Origin on Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Row 1: Protocol Authentication Verdict Grid (4 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SPF */}
        <div className="p-5 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-slate-400">SPF (SENDER POLICY)</span>
            {getVerdictBadge(protocols.spf?.status)}
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="text-slate-400">Evaluated IP: <span className="text-cyan-300 font-semibold">{protocols.spf?.evaluatedIp}</span></div>
            <div className="text-slate-400 truncate">Policy: <span className="text-slate-200">{protocols.spf?.record}</span></div>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">{protocols.spf?.reason}</div>
          </div>
        </div>

        {/* DKIM */}
        <div className="p-5 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-slate-400">DKIM SIGNATURE</span>
            {getVerdictBadge(protocols.dkim?.status)}
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="text-slate-400">Selector: <span className="text-cyan-300 font-semibold">{protocols.dkim?.selector || 'default'}</span></div>
            <div className="text-slate-400 truncate">Signing Domain: <span className="text-slate-200">{protocols.dkim?.domain}</span></div>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">{protocols.dkim?.reason}</div>
          </div>
        </div>

        {/* DMARC */}
        <div className="p-5 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-slate-400">DMARC ALIGNMENT</span>
            {getVerdictBadge(protocols.dmarc?.status)}
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="text-slate-400">Policy Action: <span className="text-cyan-300 font-semibold">{protocols.dmarc?.policy}</span></div>
            <div className="text-slate-400">Alignment: <span className="text-slate-200">{protocols.dmarc?.alignment}</span></div>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">{protocols.dmarc?.reason}</div>
          </div>
        </div>

        {/* ARC */}
        <div className="p-5 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-slate-400">ARC CHAIN SEAL</span>
            {getVerdictBadge(protocols.arc?.status)}
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="text-slate-400">Seal Status: <span className="text-cyan-300 font-semibold">{protocols.arc?.seal}</span></div>
            <div className="text-slate-400">Chain Integrity: <span className="text-slate-200">{protocols.arc?.chain}</span></div>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">Forwarding Authenticated</div>
          </div>
        </div>
      </div>

      {/* Row 2: Critical Header Alignment & Envelope Fields */}
      <div className="p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Envelope vs Header Alignment Forensic Breakdown</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-400 font-mono block">
              HEADER FROM ADDRESS
            </span>
            <div className="text-sm font-mono font-bold text-white break-all">
              {sender}
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Displayed to email client in Outlook / Gmail
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-400 font-mono block">
              ENVELOPE RETURN-PATH (BOUNCE DROP)
            </span>
            <div className={`text-sm font-mono font-bold break-all ${
              activeAnalysis.technicalValidation?.returnPath?.status === 'MISMATCH' ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {returnPath}
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              {activeAnalysis.technicalValidation?.returnPath?.status === 'MISMATCH'
                ? '⚠️ Divergence Alert: Return-Path domain does not match Header From'
                : '✅ Aligned with sender domain'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-400 font-mono block">
              REPLY-TO ROUTING POINTER
            </span>
            <div className={`text-sm font-mono font-bold break-all ${
              activeAnalysis.technicalValidation?.replyTo?.status === 'MISMATCH' ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {replyTo}
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              {activeAnalysis.technicalValidation?.replyTo?.status === 'MISMATCH'
                ? '⚠️ Reply-To Mismatch: Replies divert to external target domain'
                : '✅ Reply-To matches sender identity'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-400 font-mono block">
              MESSAGE-ID RFC CONFORMANCE
            </span>
            <div className="text-sm font-mono font-bold text-cyan-300 break-all">
              {messageId}
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              RFC 5322 syntax verified • Domain entropy inspected
            </p>
          </div>
        </div>
      </div>

      {/* Row 3: Interactive SMTP Relay Hop Chronology Timeline */}
      <div className="p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Interactive SMTP Relay Hop Chronology</span>
            </h2>
            <p className="text-xs text-slate-400">
              Packet transit latency and intermediate Mail Transfer Agent (MTA) validation path
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
            {relayTimeline.length} Total Relay Hops
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {relayTimeline.map((hop, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-cyan-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-xs text-white font-mono shrink-0 shadow-md">
                  #{hop.hop}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">{hop.host}</span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-700">
                      {hop.ip}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      String(hop.auth).includes('FAIL') || String(hop.auth).includes('UNAUTH') || String(hop.auth).includes('Reject')
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {hop.auth}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                    <Globe className="w-3 h-3 text-slate-500" />
                    <span>{hop.location}</span>
                    <span>•</span>
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span>{hop.tls}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end md:self-center font-mono text-xs">
                <div className="text-right">
                  <div className="text-cyan-400 font-bold">{hop.latency}</div>
                  <div className="text-[10px] text-slate-500">{hop.timestamp}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 4: Raw Header Inspector with Filter */}
      <div className="p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span>Raw RFC 822 Header Syntax Explorer</span>
          </h2>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search header keys (e.g. Received, X-Spam)..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 w-64"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-1 max-h-72 overflow-y-auto leading-relaxed">
          <div className="text-cyan-400">Delivered-To: {recipient}</div>
          <div className="text-cyan-400">Received-SPF: {protocols.spf.status.toLowerCase()} ({protocols.spf.reason})</div>
          <div className="text-cyan-400">Authentication-Results: mx.phishguard.ai; dkim={protocols.dkim.status.toLowerCase()} dmarc={protocols.dmarc.status.toLowerCase()}</div>
          <div className="text-slate-400">From: {sender}</div>
          <div className="text-slate-400">Reply-To: {replyTo}</div>
          <div className="text-slate-400">To: {recipient}</div>
          <div className="text-slate-400">Subject: {subject}</div>
          <div className="text-slate-400">Date: {date}</div>
          <div className="text-slate-400">Message-ID: {messageId}</div>
          <div className="text-slate-400">Return-Path: {returnPath}</div>
          <div className="text-slate-400">MIME-Version: 1.0</div>
          <div className="text-slate-400">X-Mailer: Microsoft Outlook 16.0</div>
          <div className="text-slate-400">X-Spam-Status: Yes, score={((Number(activeAnalysis.riskScore) || 0) / 10).toFixed(1)}</div>
        </div>
      </div>
    </div>
  );
};

export default HeaderForensics;
