import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  MailSearch,
  Activity,
  ArrowRight,
  TrendingUp,
  Globe2,
  Sparkles,
  Zap,
  FolderLock,
  Binary,
  Radio,
  Clock,
  ExternalLink,
  Flame,
  FileCheck2,
  UploadCloud,
  FileText
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useThreat } from '../context/ThreatContext';
import WorldMap from '../components/WorldMap';
import { sanitizeHeader } from '../utils/sanitizeHeader';
import { api } from '../lib/api';

export const Dashboard = () => {
  const navigate = useNavigate();
  const {
    currentInvestigation,
    presets,
    loadPreset,
    analyzeEmail,
    refreshStats,
    cases = [],
    uniqueCases: ctxUniqueCases,
    metrics,
    trendData,
    recentInvestigations = [],
    uniqueRecentInvestigations: ctxUniqueRecent
  } = useThreat();

  useEffect(() => {
    if (typeof refreshStats === 'function') {
      refreshStats();
    }
  }, [refreshStats]);

  const uniqueCases = ctxUniqueCases || Array.from(
    new Map((cases || []).filter(Boolean).map(c => [c?.id, c])).values()
  ).filter(Boolean);

  const uniqueRecentInvestigations = ctxUniqueRecent || Array.from(
    new Map((recentInvestigations || []).filter(Boolean).map(c => [c?.id, c])).values()
  ).filter(Boolean);

  const [quickScanText, setQuickScanText] = useState('');
  const [quickScanLoading, setQuickScanLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');

  const handleQuickScan = async (e) => {
    e.preventDefault();
    if (!quickScanText.trim()) return;
    setQuickScanLoading(true);
    try {
      await analyzeEmail(quickScanText);
      setQuickScanLoading(false);
      navigate('/ai-report');
    } catch (err) {
      console.error('Quick scan error:', err);
      setQuickScanLoading(false);
      navigate('/ai-report');
    }
  };

  const handlePresetSelect = async (presetId) => {
    try {
      await loadPreset(presetId);
      navigate('/ai-report');
    } catch (err) {
      console.error('Preset select error:', err);
      navigate('/ai-report');
    }
  };

  const chartSeries = trendData[timeRange] || trendData['7d'] || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / SIH 2026 Live Command Ticker */}
      <div className="p-4 rounded-[20px] bg-gradient-to-r from-blue-950/70 via-slate-900/80 to-cyan-950/70 border border-cyan-500/30 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Radio className="w-5 h-5 text-cyan-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">SIH 2026 Threat Operations Center</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                ACTIVE MONITORING
              </span>
            </div>
            <p className="text-xs text-slate-300">
              National threat telemetry active • Zero-day BEC detection models engaged • 6 forensic engines online
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={() => navigate('/analyze')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            <MailSearch className="w-3.5 h-3.5" />
            <span>New Investigation</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Stat Cards (Dynamically updated from metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Processed */}
        <div className="p-5 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-lg hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              TOTAL EMAILS SCANNED
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {metrics.totalScanned.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> {metrics.totalScannedChange}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Across active enterprise MX gateways
          </p>
        </div>

        {/* High Risk Alerts */}
        <div className="p-5 rounded-[20px] bg-slate-900/60 border border-rose-500/30 backdrop-blur-xl shadow-lg hover:border-rose-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider font-mono">
              HIGH RISK / CRITICAL
            </span>
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-400 font-mono">
              {metrics.highRiskAlerts.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-rose-400 font-mono">
              {metrics.highRiskRate}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            BEC wire & credential harvest alerts
          </p>
        </div>

        {/* DMARC / SPF Failures */}
        <div className="p-5 rounded-[20px] bg-slate-900/60 border border-amber-500/30 backdrop-blur-xl shadow-lg hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider font-mono">
              AUTH PROTOCOL FAILS
            </span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">
              {metrics.authProtocolFails.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-amber-400 font-mono">
              {metrics.authFailType}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Quarantined at ingress MTA
          </p>
        </div>

        {/* Safe / Verified Deliveries */}
        <div className="p-5 rounded-[20px] bg-slate-900/60 border border-emerald-500/30 backdrop-blur-xl shadow-lg hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider font-mono">
              VERIFIED CLEAN RATE
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">
              {metrics.cleanVerifiedRate}
            </span>
            <span className="text-xs font-semibold text-emerald-400 font-mono">
              {metrics.cleanVerifiedCount.toLocaleString()} clean
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Cryptographic alignment confirmed
          </p>
        </div>
      </div>

      {/* Active Investigation Card: Real-time Synchronized Status */}
      {currentInvestigation ? (
        <div className="p-5 rounded-[20px] bg-slate-900/80 border border-cyan-500/40 backdrop-blur-xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                ACTIVE INVESTIGATION
              </span>
              <span className="text-xs font-mono text-slate-400">
                {sanitizeHeader(currentInvestigation.caseId || currentInvestigation.id, 'CASE-LIVE')}
              </span>
              {(() => {
                const scoreVal = currentInvestigation?.score ?? currentInvestigation?.riskScore ?? 0;
                const levelVal = sanitizeHeader(currentInvestigation?.level ?? currentInvestigation?.threatLevel, 'SAFE');
                return (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    scoreVal >= 86 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                    scoreVal >= 61 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                    scoreVal >= 41 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                    scoreVal >= 21 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' :
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                    VERDICT: {levelVal} ({scoreVal}/100)
                  </span>
                );
              })()}
            </div>

            <h3 className="text-sm font-bold text-white truncate">
              {sanitizeHeader(currentInvestigation?.subject, 'Inbound Communication')}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
              <span>From: <strong className="text-slate-200">{sanitizeHeader(currentInvestigation?.sender ?? currentInvestigation?.from, 'unknown@domain.com')}</strong></span>
              <span>•</span>
              <span>Domain: <strong className="text-cyan-300">{sanitizeHeader(currentInvestigation?.senderDomain, 'domain.com')}</strong></span>
              <span>•</span>
              <span>Origin: <strong className="text-slate-200">
                {currentInvestigation?.geo?.country && currentInvestigation.geo.country !== 'Origin unavailable from supplied headers'
                  ? `${currentInvestigation.geo.country} (${currentInvestigation?.geo?.ip ?? currentInvestigation?.originIp ?? 'IP'})`
                  : 'Origin Node'}
              </strong></span>
            </div>
          </div>

          {/* Protocols & Navigation */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs">
              <span className="text-slate-400 text-[10px] px-1 font-bold">PROTOCOLS:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                sanitizeHeader(currentInvestigation?.authentication?.spf ?? currentInvestigation?.protocols?.spf?.status ?? currentInvestigation?.spf, 'FAIL') === 'PASS'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}>
                SPF {sanitizeHeader(currentInvestigation?.authentication?.spf ?? currentInvestigation?.protocols?.spf?.status ?? currentInvestigation?.spf, 'FAIL')}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                sanitizeHeader(currentInvestigation?.authentication?.dkim ?? currentInvestigation?.protocols?.dkim?.status ?? currentInvestigation?.dkim, 'FAIL') === 'PASS'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}>
                DKIM {sanitizeHeader(currentInvestigation?.authentication?.dkim ?? currentInvestigation?.protocols?.dkim?.status ?? currentInvestigation?.dkim, 'FAIL')}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                sanitizeHeader(currentInvestigation?.authentication?.dmarc ?? currentInvestigation?.protocols?.dmarc?.status ?? currentInvestigation?.dmarc, 'FAIL') === 'PASS'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}>
                DMARC {sanitizeHeader(currentInvestigation?.authentication?.dmarc ?? currentInvestigation?.protocols?.dmarc?.status ?? currentInvestigation?.dmarc, 'FAIL')}
              </span>
            </div>

            <button
              onClick={() => navigate('/ai-report')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>View Full Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-mono text-slate-300">
              Analyze an email to begin forensic investigation.
            </span>
          </div>
          <button
            onClick={() => navigate('/analyze')}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-semibold hover:bg-cyan-500/30 transition-all cursor-pointer"
          >
            Analyze Email
          </button>
        </div>
      )}

      {/* Row 2: Fraud Trend Chart & Quick Scan Triage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dynamic Fraud Trend Chart (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Enterprise Threat & Fraud Vector Trends</span>
              </h2>
              <p className="text-xs text-slate-400">
                Temporal distribution of BEC, Phishing, and Malware (Dynamically updated with live scans)
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
              {['24h', '7d', '30d'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg font-mono transition-all ${
                    timeRange === t ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-400" />
              <span className="text-slate-300">Phishing URLs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-slate-300">BEC / Wire Fraud</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-slate-300">Trojan Attachments</span>
            </div>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="phishGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="becGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="malwareGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}
                />
                <Area type="monotone" dataKey="phishing" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#phishGrad)" />
                <Area type="monotone" dataKey="bec" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#becGrad)" />
                <Area type="monotone" dataKey="malware" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#malwareGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Scan Triage (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-[20px] bg-gradient-to-b from-slate-900/80 to-slate-950 border border-cyan-500/30 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-base mb-1">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Quick Triage Scan</span>
            </div>
            <p className="text-xs text-slate-400">
              Paste email headers or raw RFC 822 text to run the dynamic investigation engine
            </p>
          </div>

          <form onSubmit={handleQuickScan} className="space-y-3 flex-1 flex flex-col justify-between">
            <textarea
              rows={6}
              value={quickScanText}
              onChange={(e) => setQuickScanText(e.target.value)}
              placeholder="Paste raw email, RFC 822 headers, or body text here..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none"
            />

            <div className="space-y-2">
              <button
                type="submit"
                disabled={quickScanLoading || !quickScanText.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
              >
                {quickScanLoading ? (
                  <span>Running Forensic Engine...</span>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Rapid Dynamic Scan</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/analyze')}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
                <span>Open Full Ingestion Workbench (.eml)</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Row 3: Global Threat Map Preview Widget (Uses currentInvestigation) */}
      <div className="p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-cyan-400" />
              <span>Global Threat GeoTrace Map</span>
            </h2>
            <p className="text-xs text-slate-400">
              {currentInvestigation ? (
                <>
                  Live geographic origin for: <strong className="text-cyan-300 font-mono">{sanitizeHeader(currentInvestigation.senderDomain, 'Target Domain')}</strong> ({sanitizeHeader(currentInvestigation.originIp, 'Origin IP')})
                </>
              ) : (
                <span className="text-slate-400 font-mono">No investigation loaded. Analyze an email first.</span>
              )}
            </p>
          </div>

          <button
            onClick={() => navigate('/geotrace')}
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-mono font-semibold cursor-pointer"
          >
            <span>Open Full GeoTrace Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <WorldMap
          geoTrace={currentInvestigation?.geoTrace || currentInvestigation?.geoLocation}
          relayTimeline={currentInvestigation?.relayTimeline || []}
        />
      </div>


      {/* Row 4: Recent Investigations & SIH Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dynamic Recent Investigations Table (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FolderLock className="w-4 h-4 text-cyan-400" />
                <span>Recent Dynamic Cyber Investigations</span>
              </h2>
              <p className="text-xs text-slate-400">
                Live chronological ledger updated automatically with every scan
              </p>
            </div>

            <button
              onClick={() => navigate('/cases')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View All Cases ({uniqueCases.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {uniqueRecentInvestigations.map((inv, index) => (
              <div
                key={`${inv.id}-${index}`}
                onClick={() => {
                  navigate('/ai-report');
                }}
                className="p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">{sanitizeHeader(inv.id, 'CASE')}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      inv.threatLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                      inv.threatLevel === 'SAFE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                      inv.threatLevel === 'LOW' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}>
                      {sanitizeHeader(inv.threatLevel, 'EVALUATED')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{inv.timestamp}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                    {sanitizeHeader(inv.subject, 'Investigation')}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono flex items-center gap-3">
                    <span>Target: <strong className="text-slate-300">{sanitizeHeader(inv.targetDomain, 'domain.com')}</strong></span>
                    {inv.originCountry && (
                      <>
                        <span>•</span>
                        <span>Origin: {inv.originCountry}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <div className={`text-base font-extrabold font-mono ${
                      inv.threatLevel === 'CRITICAL' ? 'text-rose-400' :
                      inv.threatLevel === 'SAFE' ? 'text-emerald-400' :
                      inv.threatLevel === 'LOW' ? 'text-cyan-400' :
                      'text-amber-400'
                    }`}>
                      {inv.riskScore}%
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">Risk Index</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SIH 2026 Scenario Presets (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>SIH 2026 Scenarios</span>
            </h2>
            <p className="text-xs text-slate-400">
              Inject realistic multi-vector email streams into the dynamic engine
            </p>
          </div>

          <div className="space-y-2">
            {presets.map((p) => (
              <div
                key={p.id}
                onClick={() => handlePresetSelect(p.id)}
                className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors truncate mr-2">
                    {p.name}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                    p.threatLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : p.threatLevel === 'SAFE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {p.badge}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate font-mono">
                  {p.sender}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
