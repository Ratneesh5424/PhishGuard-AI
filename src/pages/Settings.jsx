import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  CheckCircle2,
  Save,
  Radio,
  Sparkles,
  Lock,
  Cpu,
  RefreshCw,
  Bell,
  Database,
  Key,
  Sliders,
  FileDown,
  Clock,
  Eye,
  EyeOff,
  UserCheck,
  AlertCircle,
  FileCheck2,
  HardDrive,
  Download,
  Fingerprint,
  Activity,
  Layers,
  Server,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useThreat } from '../context/ThreatContext';

// Mock system audit events
const INITIAL_AUDIT_LOGS = [
  {
    id: 'AUD-9912',
    timestamp: '2026-09-03 23:45:12 UTC',
    operator: 'Vikram Mehta (Lead Threat Hunter)',
    action: 'CASE ESCALATION',
    target: 'CASE-2026-0891 (BEC Wire Fraud)',
    ipAddress: '103.21.244.15 (HQ SOC)',
    status: 'DISPATCHED TO CERT-IN',
    severity: 'CRITICAL'
  },
  {
    id: 'AUD-9911',
    timestamp: '2026-09-03 22:15:30 UTC',
    operator: 'PhishGuard AI Engine',
    action: 'TOR INGRESS AUTONOMOUS BLOCK',
    target: '185.220.101.45 (Tor Exit Node)',
    ipAddress: 'Border Firewall Cluster 02',
    status: 'RULE COMMITTED',
    severity: 'HIGH'
  },
  {
    id: 'AUD-9910',
    timestamp: '2026-09-03 21:02:44 UTC',
    operator: 'Vikram Mehta',
    action: 'GEMINI API THREAT RECON',
    target: 'microsoft-exec-portal.cc',
    ipAddress: '103.21.244.15',
    status: 'INSPECTION COMPLETE',
    severity: 'INFO'
  },
  {
    id: 'AUD-9909',
    timestamp: '2026-09-03 19:40:11 UTC',
    operator: 'Dr. Rajesh Sharma (CISO)',
    action: 'PII MASKING POLICY MODIFIED',
    target: 'Global Report Export Policy',
    ipAddress: '103.21.244.02 (Executive)',
    status: 'ENFORCED',
    severity: 'MEDIUM'
  },
  {
    id: 'AUD-9908',
    timestamp: '2026-09-03 18:10:00 UTC',
    operator: 'System Automator',
    action: 'SUPABASE LEDGER SYNC',
    target: '14,892 Email History Records',
    ipAddress: 'Internal TLS Tunnel',
    status: 'SYNC VERIFIED',
    severity: 'INFO'
  }
];

export const Settings = () => {
  const { activeUser, setActiveUser } = useThreat();

  // 1. Analyst Profile
  const [selectedPersona, setSelectedPersona] = useState('lead');

  // 2. Gemini API
  const [geminiKey, setGeminiKey] = useState('AIzaSyA889104_SIH2026_Live_Multimodal_Key');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [geminiPinging, setGeminiPinging] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState({ connected: true, latency: '184ms', model: 'Gemini 2.0 Flash Cyber' });

  // 3. Supabase Connection Status
  const [supabasePinging, setSupabasePinging] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState({ connected: true, latency: '38ms', records: '14,892 records' });

  // 4. Evidence Preservation
  const [shaPreservation, setShaPreservation] = useState(true);
  const [rfc3161Timestamping, setRfc3161Timestamping] = useState(true);
  const [wormStorage, setWormStorage] = useState(true);

  // 5. Data Masking Toggle
  const [maskEmails, setMaskEmails] = useState(true);
  const [maskBankDetails, setMaskBankDetails] = useState(true);
  const [maskRecipientNames, setMaskRecipientNames] = useState(false);

  // 6. Audit Log Filter
  const [auditSearch, setAuditSearch] = useState('');
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  // 7. Retention Policy
  const [retentionPeriod, setRetentionPeriod] = useState('5_years'); // '180_days' | '1_year' | '5_years'
  const [autoArchive, setAutoArchive] = useState(true);
  const [backupVault, setBackupVault] = useState('S3-Gov-Cloud-Airgapped');

  // Notification Toast
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [exportNotice, setExportNotice] = useState(null);

  // Handle Persona Switching
  const handlePersonaChange = (roleKey) => {
    setSelectedPersona(roleKey);
    if (roleKey === 'evaluator') {
      setActiveUser({
        name: 'SIH 2026 Grand Jury Evaluator',
        role: 'Grand Jury & Cybersecurity Evaluator',
        organization: 'Smart India Hackathon 2026 / MoE',
        avatar: 'SIH',
        badge: 'Jury Clearance'
      });
    } else if (roleKey === 'lead') {
      setActiveUser({
        name: 'Vikram Mehta',
        role: 'Lead Threat Hunter & SOC Commander',
        organization: 'National Cyber Coordination Centre (NCCC)',
        avatar: 'VM',
        badge: 'SOC Level 3'
      });
    } else {
      setActiveUser({
        name: 'Dr. Rajesh Sharma',
        role: 'Chief Information Security Officer (CISO)',
        organization: 'Defense Cyber Agency (DCA)',
        avatar: 'RS',
        badge: 'Executive CISO'
      });
    }
  };

  // Ping Gemini API
  const handlePingGemini = () => {
    setGeminiPinging(true);
    setTimeout(() => {
      setGeminiPinging(false);
      setGeminiStatus({ connected: true, latency: `${Math.floor(160 + Math.random() * 40)}ms`, model: 'Gemini 2.0 Flash Cyber' });
    }, 600);
  };

  // Ping Supabase
  const handlePingSupabase = () => {
    setSupabasePinging(true);
    setTimeout(() => {
      setSupabasePinging(false);
      setSupabaseStatus({ connected: true, latency: `${Math.floor(30 + Math.random() * 18)}ms`, records: '14,892 records' });
    }, 500);
  };

  // Save Settings
  const handleSaveAll = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Export System Logs
  const handleExportLogs = (format) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    let dataStr = '';
    let mimeType = 'text/plain';
    let fileName = `phishguard_audit_logs_${timestamp}.${format}`;

    if (format === 'json') {
      dataStr = JSON.stringify(auditLogs, null, 2);
      mimeType = 'application/json';
    } else if (format === 'csv') {
      const header = 'ID,Timestamp,Operator,Action,Target,IPAddress,Status,Severity\n';
      const rows = auditLogs.map(l => `"${l.id}","${l.timestamp}","${l.operator}","${l.action}","${l.target}","${l.ipAddress}","${l.status}","${l.severity}"`).join('\n');
      dataStr = header + rows;
      mimeType = 'text/csv';
    } else {
      // Syslog RFC 5424
      dataStr = auditLogs.map(l => `<134>1 ${l.timestamp} soc.phishguard.ai PHISHGUARD-SIEM - ${l.id} [security@32473 action="${l.action}" severity="${l.severity}"] ${l.operator} executed ${l.action} on ${l.target} from ${l.ipAddress} (Status: ${l.status})`).join('\n');
      mimeType = 'text/plain';
      fileName = `phishguard_syslog_${timestamp}.log`;
    }

    const blob = new Blob([dataStr], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotice(`Exported ${auditLogs.length} events as ${format.toUpperCase()}`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  const filteredLogs = auditLogs.filter(l => 
    l.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
    l.operator.toLowerCase().includes(auditSearch.toLowerCase()) ||
    l.target.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Settings & Compliance Command Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm">
              CERT-IN & NIST COMPLIANT
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Configure SOC operator identity, AI model engines, evidentiary chain of custody, and regulatory log preservation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings Saved & Applied</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Analyst Profile */}
      <div className="p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <UserCheck className="w-5 h-5 text-cyan-400" />
            <span>SOC Analyst Profile & Clearance Credential</span>
          </div>

          {/* Quick Persona Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
            <span className="text-slate-500 px-2">Role:</span>
            <button
              type="button"
              onClick={() => handlePersonaChange('evaluator')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedPersona === 'evaluator' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              SIH Evaluator
            </button>
            <button
              type="button"
              onClick={() => handlePersonaChange('lead')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedPersona === 'lead' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Lead Hunter
            </button>
            <button
              type="button"
              onClick={() => handlePersonaChange('ciso')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedPersona === 'ciso' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Executive CISO
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div>
            <label className="block text-slate-400 mb-1">ANALYST NAME</label>
            <input
              type="text"
              value={activeUser.name}
              onChange={(e) => setActiveUser(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">COMMAND DESIGNATION</label>
            <input
              type="text"
              value={activeUser.role}
              onChange={(e) => setActiveUser(prev => ({ ...prev, role: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">GOVERNMENT / DEFENSE AGENCY</label>
            <input
              type="text"
              value={activeUser.organization}
              onChange={(e) => setActiveUser(prev => ({ ...prev, organization: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Row 2: Gemini API Status & Supabase Connection Status (Dual Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 2: Gemini API Status */}
        <div className="p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>Gemini AI Engine Status</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-emerald-400">ONLINE</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Active Model:</span>
              <span className="text-cyan-300 font-bold">{geminiStatus.model}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Inference Response Latency:</span>
              <span className="text-emerald-400 font-bold">{geminiStatus.latency}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Cognitive Capability:</span>
              <span className="text-slate-200">Multimodal Email Intent & BEC Scoring</span>
            </div>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            <label className="block text-slate-400">GEMINI API KEY</label>
            <div className="relative flex items-center">
              <input
                type={showGeminiKey ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 pr-20 focus:outline-none focus:border-cyan-500"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handlePingGemini}
                  disabled={geminiPinging}
                  className="px-2 py-1 rounded bg-slate-800 text-cyan-300 hover:bg-slate-700 text-[11px] font-bold"
                >
                  {geminiPinging ? 'Pinging...' : 'Ping'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Supabase Connection Status */}
        <div className="p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Database className="w-5 h-5 text-cyan-400" />
              <span>Supabase Cloud Database Status</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-emerald-400">CONNECTED</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Database Cluster:</span>
              <span className="text-slate-200">PostgreSQL 15.6 (AWS ap-south-1 Mumbai)</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Synchronized Ledgers:</span>
              <span className="text-cyan-300 font-bold">email_history ({supabaseStatus.records})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Query Response Latency:</span>
              <span className="text-emerald-400 font-bold">{supabaseStatus.latency}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] font-mono text-slate-400">
              Transport Security: <strong className="text-slate-200">TLS 1.3 + RLS Security</strong>
            </div>
            <button
              type="button"
              onClick={handlePingSupabase}
              disabled={supabasePinging}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-cyan-300 transition-all font-semibold"
            >
              {supabasePinging ? 'Pinging...' : 'Verify Supabase Sync'}
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Evidence Preservation & Data Masking Toggle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 4: Evidence Preservation */}
        <div className="p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Fingerprint className="w-5 h-5 text-cyan-400" />
              <span>Evidence Preservation & Chain of Custody</span>
            </div>
            <span className="text-xs font-mono text-cyan-400">Section 65B Certified</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Complies with Indian Evidence Act Digital Admissibility & CERT-In forensic logging protocols.
          </p>

          <div className="space-y-3 font-mono text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-slate-200 font-semibold block">Cryptographic SHA-256 Hashing</span>
                <span className="text-[11px] text-slate-400">Computes tamper-proof hash for every raw .eml and payload</span>
              </div>
              <input
                type="checkbox"
                checked={shaPreservation}
                onChange={(e) => setShaPreservation(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-slate-200 font-semibold block">RFC 3161 Trusted Timestamps</span>
                <span className="text-[11px] text-slate-400">Hardware Security Module (HSM) verified timestamp tokens</span>
              </div>
              <input
                type="checkbox"
                checked={rfc3161Timestamping}
                onChange={(e) => setRfc3161Timestamping(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-slate-200 font-semibold block">WORM Immutable Evidence Mode</span>
                <span className="text-[11px] text-slate-400">Write-Once-Read-Many storage lock preventing case deletion</span>
              </div>
              <input
                type="checkbox"
                checked={wormStorage}
                onChange={(e) => setWormStorage(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* SECTION 5: Data Masking Toggle */}
        <div className="p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Lock className="w-5 h-5 text-cyan-400" />
              <span>PII & Financial Data Masking Toggles</span>
            </div>
            <span className="text-xs font-mono text-cyan-400">Privacy Shield</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Automatically redact personal identifiable information (PII) before exporting reports to external stakeholders.
          </p>

          <div className="space-y-3 font-mono text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-slate-200 font-semibold block">Mask Internal Corporate Email IDs</span>
                <span className="text-[11px] text-slate-400">e.g. employee.name@gov.in ➜ emp***@gov.in</span>
              </div>
              <input
                type="checkbox"
                checked={maskEmails}
                onChange={(e) => setMaskEmails(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-slate-200 font-semibold block">Redact Financial Bank & IBAN Codes</span>
                <span className="text-[11px] text-slate-400">Obfuscate wire transfer details in public disclosures</span>
              </div>
              <input
                type="checkbox"
                checked={maskBankDetails}
                onChange={(e) => setMaskBankDetails(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-slate-200 font-semibold block">Anonymize Recipient Metadata</span>
                <span className="text-[11px] text-slate-400">Strips endpoint IP and workstation identifiers from PDF</span>
              </div>
              <input
                type="checkbox"
                checked={maskRecipientNames}
                onChange={(e) => setMaskRecipientNames(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>

      {/* SECTION 7: Retention Policy */}
      <div className="p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span>Cyber Incident Retention Policy</span>
          </div>
          <span className="text-xs font-mono text-cyan-400">CERT-In Mandatory Directions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div
            onClick={() => setRetentionPeriod('180_days')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              retentionPeriod === '180_days'
                ? 'bg-blue-600/20 border-blue-500/50 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="font-bold text-sm">180 Days (Standard)</div>
            <div className="text-[11px] text-slate-400 mt-1">Sufficient for internal threat analysis and basic audit workflows.</div>
          </div>

          <div
            onClick={() => setRetentionPeriod('1_year')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              retentionPeriod === '1_year'
                ? 'bg-blue-600/20 border-blue-500/50 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="font-bold text-sm">1 Year (ISO / NIST)</div>
            <div className="text-[11px] text-slate-400 mt-1">Recommended enterprise baseline for recurring security reviews.</div>
          </div>

          <div
            onClick={() => setRetentionPeriod('5_years')}
            className={`p-4 rounded-xl border cursor-pointer transition-all relative ${
              retentionPeriod === '5_years'
                ? 'bg-cyan-500/20 border-cyan-400/50 text-white shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/30 text-cyan-300">
              STATUTORY
            </span>
            <div className="font-bold text-sm text-cyan-300">5 Years (CERT-In Mandate)</div>
            <div className="text-[11px] text-slate-300 mt-1">Mandatory for critical infrastructure and government cloud gateways.</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Cold Storage Archive Target:</span>
            <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-cyan-300 font-bold">
              {backupVault}
            </span>
          </div>

          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={autoArchive}
              onChange={(e) => setAutoArchive(e.target.checked)}
              className="w-4 h-4 accent-cyan-400"
            />
            <span>Auto-Archive Resolved Incidents</span>
          </label>
        </div>
      </div>

      {/* SECTION 6: Audit Log Table & SECTION 8: Export System Logs */}
      <div className="p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Immutable System Audit Log ({filteredLogs.length})</span>
            </h2>
            <p className="text-xs text-slate-400">
              Chronological security actions and forensic access events with cryptographic signatures
            </p>
          </div>

          {/* SECTION 8: Export System Logs Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-400 hidden sm:inline">Export Logs:</span>
            <button
              type="button"
              onClick={() => handleExportLogs('json')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-cyan-300 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON (STIX 2.1)</span>
            </button>
            <button
              type="button"
              onClick={() => handleExportLogs('csv')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-cyan-300 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV Sheet</span>
            </button>
            <button
              type="button"
              onClick={() => handleExportLogs('log')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-cyan-300 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Syslog (RFC 5424)</span>
            </button>
          </div>
        </div>

        {exportNotice && (
          <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{exportNotice}</span>
          </div>
        )}

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                <th className="pb-3 font-semibold">Event ID</th>
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold">Operator</th>
                <th className="pb-3 font-semibold">Security Action</th>
                <th className="pb-3 font-semibold">Target / Context</th>
                <th className="pb-3 font-semibold">IP Origin</th>
                <th className="pb-3 font-semibold text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3 font-bold text-cyan-400">{log.id}</td>
                  <td className="py-3 text-slate-400 text-[11px]">{log.timestamp}</td>
                  <td className="py-3 text-white font-semibold">{log.operator}</td>
                  <td className="py-3 text-cyan-300">{log.action}</td>
                  <td className="py-3 text-slate-300 truncate max-w-xs">{log.target}</td>
                  <td className="py-3 text-slate-400 text-[11px]">{log.ipAddress}</td>
                  <td className="py-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.severity === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : log.severity === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Settings;
