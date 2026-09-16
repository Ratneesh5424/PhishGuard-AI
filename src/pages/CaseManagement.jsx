import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FolderLock,
  Search,
  Filter,
  Download,
  Plus,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  UserCheck,
  Tag,
  FileText,
  Trash2,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Layers,
  X,
  Send,
  ExternalLink
} from 'lucide-react';
import { useThreat } from '../context/ThreatContext';
import { downloadPhishGuardPDF } from '../utils/pdfGenerator';
import { CaseCard } from '../components/CaseCard';
import { api } from '../lib/api';

export const CaseManagement = () => {
  const navigate = useNavigate();
  const { cases = [], uniqueCases: ctxUniqueCases, setCases, addCaseNote, updateCaseStatus, loadPreset, activeUser, setCurrentInvestigation } = useThreat();

  const uniqueCases = ctxUniqueCases || Array.from(
    new Map((cases || []).filter(Boolean).map(c => [c?.id, c])).values()
  ).filter(Boolean);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedCase, setSelectedCase] = useState(uniqueCases[0] || null);
  const [newNoteText, setNewNoteText] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Synchronize selected case across all pages
  const handleSelectCase = (c) => {
    if (!c) return;
    setSelectedCase(c);
    const investigationToLoad = c.investigationRef || {
      caseId: c.id,
      id: c.id,
      startTime: c?.startTime ?? (c?.createdAt ? new Date(c.createdAt).getTime() : Date.now()),
      score: c.score ?? c.riskScore ?? 0,
      riskScore: c.score ?? c.riskScore ?? 0,
      level: c.level ?? c.severity ?? 'SAFE',
      threatLevel: c.level ?? c.severity ?? 'SAFE',
      subject: c.title || c.subject,
      sender: c.sender || `operator@${c.targetDomain || 'enterprise.com'}`,
      senderDomain: c.targetDomain || 'domain.com',
      recipient: 'soc-team@enterprise.gov.in',
      date: c.createdAt || new Date().toLocaleString(),
      verdict: c.severity,
      confidence: 99.2,
      originIp: c.originIp || '185.220.101.45',
      summary: c.notes?.[0]?.text || `Archived incident record for ${c.id}.`,
      explanation: c.notes?.[0]?.text || `Archived incident record for ${c.id}.`,
      authentication: {
        spf: c.riskScore > 60 ? 'FAIL' : 'PASS',
        dkim: c.riskScore > 60 ? 'FAIL' : 'PASS',
        dmarc: c.riskScore > 60 ? 'FAIL' : 'PASS',
        arc: 'PASS'
      },
      protocols: {
        spf: { status: c.riskScore > 60 ? 'FAIL' : 'PASS' },
        dkim: { status: c.riskScore > 60 ? 'FAIL' : 'PASS' },
        dmarc: { status: c.riskScore > 60 ? 'FAIL' : 'PASS' },
        arc: { status: 'PASS' }
      },
      geo: {
        ip: c.originIp || '185.220.101.45',
        originIp: c.originIp || '185.220.101.45',
        country: c.originCountry?.split(' ')[0] || 'Origin Node',
        city: c.originCountry?.split('(')[1]?.replace(')', '') || 'Node',
        latitude: 50.1109,
        longitude: 8.6821,
        isp: 'Telecommunications Provider',
        threatFlags: { isVpn: false, isTor: false, isProxy: false, isBulletproof: false, botnetScore: '0/100' }
      },
      geoLocation: {
        ip: c.originIp || '185.220.101.45',
        originIp: c.originIp || '185.220.101.45',
        country: c.originCountry?.split(' ')[0] || 'Origin Node',
        city: c.originCountry?.split('(')[1]?.replace(')', '') || 'Node',
        latitude: 50.1109,
        longitude: 8.6821
      },
      domainIntel: {
        domain: c.targetDomain,
        isLookalike: c.riskScore > 70,
        lookalikeBrand: c.riskScore > 70 ? 'Suspicious Entity' : 'None',
        domainAge: c.riskScore > 70 ? '4 Days Old (NRD)' : '3650 Days Old',
        registrar: c.riskScore > 70 ? 'Porkbun LLC / Anonymous Proxy' : 'ICANN Accredited Registrar',
      },
      indicators: (c.notes || []).map((n) => ({
        name: n.text?.slice(0, 40) || 'Incident Flag',
        rule: 'Incident record observation',
        points: c.riskScore > 60 ? 20 : -10,
        triggered: true,
        description: n.text,
      })),
      timeline: [
        { hop: 1, host: `ingress-node.${c.targetDomain || 'net'}`, ip: c.originIp || '185.220.101.45', location: 'Origin Node', tls: 'TLS 1.3', latency: '24ms', timestamp: c.createdAt || new Date().toUTCString(), auth: 'VALIDATED' }
      ],
      recommendation: [
        `Monitor traffic associated with ${c.targetDomain || 'domain'}`,
        'Verify user authorization credentials.'
      ],
      iocs: c.iocs || { ips: [c.originIp].filter(Boolean), domains: [c.targetDomain].filter(Boolean) },
    };
    setCurrentInvestigation(investigationToLoad);
  };

  // Filtered cases list (Search by domain, IP, subject, or Case ID)
  const filteredCases = (uniqueCases || []).filter(Boolean).filter((c) => {
    const term = (searchTerm || '').toLowerCase();
    const hasMatchingIp = (c?.originIp && c.originIp.toLowerCase().includes(term)) ||
      (c?.iocs?.ips && Array.isArray(c.iocs.ips) && c.iocs.ips.some(ip => ip && ip.toLowerCase().includes(term)));
    const matchesSearch =
      !searchTerm.trim() ||
      (c?.title && c.title.toLowerCase().includes(term)) ||
      (c?.subject && c.subject.toLowerCase().includes(term)) ||
      (c?.id && c.id.toLowerCase().includes(term)) ||
      (c?.targetDomain && c.targetDomain.toLowerCase().includes(term)) ||
      hasMatchingIp;
    const matchesSeverity = filterSeverity === 'ALL' || c?.severity === filterSeverity;
    const matchesStatus = filterStatus === 'ALL' || c?.status === filterStatus;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedCase) return;
    addCaseNote(selectedCase.id, newNoteText.trim());
    // Refresh selectedCase from updated store
    setSelectedCase((prev) => ({
      ...prev,
      notes: [
        ...prev.notes,
        {
          id: `n-${Date.now()}`,
          author: activeUser.name,
          text: newNoteText.trim(),
          timestamp: new Date().toLocaleString()
        }
      ]
    }));
    setNewNoteText('');
  };

  const handleDownloadCasePdf = async (caseObj) => {
    setDownloadingPdf(true);
    try {
      await downloadPhishGuardPDF({
        subject: caseObj.title,
        sender: `Case Lead: ${caseObj.assignedTo}`,
        recipient: 'Internal Enterprise Defense Incident Log',
        date: caseObj.createdAt,
        riskScore: caseObj.riskScore,
        status: caseObj.severity === 'CRITICAL' ? 'High Risk' : 'Suspicious',
        confidence: 99.2,
        summary: `Official Incident Record for ${caseObj.id}. Threat Type: ${caseObj.threatType}. Origin: ${caseObj.originCountry}. Domain: ${caseObj.targetDomain}.`,
        socRecommendations: caseObj.notes.map((n) => `[${n.author}] ${n.text}`)
      });
    } catch (e) {
      console.warn('PDF Export failed:', e);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Enterprise Cyber Incident & Case Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/40">
              SOC EVIDENCE VAULT
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Track forensic threat investigations, IOC indicators of compromise, analyst notes, and CERT-In disclosures
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (selectedCase) {
                handleSelectCase(selectedCase);
                navigate('/ai-report');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            <span>Open in AI Forensic Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by domain, IP, subject, or Case ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Facet Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs font-mono text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Severity:</span>
          </div>
          {['ALL', 'CRITICAL', 'HIGH', 'SAFE'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all ${
                filterSeverity === sev
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          <div className="flex items-center gap-1 text-xs font-mono text-slate-400">
            <span>Status:</span>
          </div>
          {['ALL', 'Open', 'In Progress', 'Mitigated'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all ${
                filterStatus === st
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 font-bold'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split View: Left Case List (5 cols) | Right Detail & Notes (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Case Incident Catalog (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono text-slate-400 font-semibold px-1">
            Displaying {filteredCases.length} Incidents
          </div>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {filteredCases.map((c, index) => (
              <CaseCard
                key={`${c.id}-${index}`}
                case={c}
                isSelected={selectedCase?.id === c.id}
                onClick={handleSelectCase}
              />
            ))}
          </div>

        </div>

        {/* Right: Selected Case Investigation Drawer (7 cols) */}
        <div className="lg:col-span-7">
          {selectedCase ? (
            <div className="p-6 rounded-[20px] bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-cyan-400">{selectedCase.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400">
                      {selectedCase.threatType}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-1">
                    {selectedCase.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedCase.status}
                    onChange={(e) => {
                      updateCaseStatus(selectedCase.id, e.target.value);
                      setSelectedCase((prev) => ({ ...prev, status: e.target.value }));
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Mitigated">Mitigated</option>
                    <option value="Archived">Archived</option>
                  </select>

                  <button
                    onClick={() => {
                      handleSelectCase(selectedCase);
                      navigate('/ai-report');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Open Exact Investigation"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDownloadCasePdf(selectedCase)}
                    disabled={downloadingPdf}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Export PDF Report"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>


              {/* Metadata Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">LEAD INVESTIGATOR</span>
                  <span className="text-slate-200 font-bold">{selectedCase.assignedTo}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">ORIGIN JURISDICTION</span>
                  <span className="text-slate-200 font-bold truncate block">{selectedCase.originCountry}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">TARGET DOMAIN</span>
                  <span className="text-cyan-400 font-bold truncate block">{selectedCase.targetDomain}</span>
                </div>
              </div>

              {/* Evidence Vault (IOCs) */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FolderLock className="w-4 h-4 text-cyan-400" />
                  <span>Indicators of Compromise (IOCs Vault)</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">MALICIOUS IP ADDRESSES:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedCase.iocs?.ips?.map((ip, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[11px]">
                        {ip}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">MALICIOUS DOMAINS:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedCase.iocs?.domains?.map((d, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[11px]">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedCase.iocs?.hashes?.length > 0 && (
                  <div>
                    <span className="text-slate-500 block text-[10px]">PAYLOAD SHA-256 HASHES:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedCase.iocs.hashes.map((h, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] break-all">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Investigation Notes Feed */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>Chronological Investigation Log ({selectedCase.notes?.length || 0})</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedCase.notes?.map((n) => (
                    <div key={n.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 font-mono text-xs">
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span className="font-bold text-cyan-400">{n.author}</span>
                        <span>{n.timestamp}</span>
                      </div>
                      <p className="text-slate-200 text-xs font-sans">{n.text}</p>
                    </div>
                  ))}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Log analyst observation, firewall ticket, or CERT-In report..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={!newNoteText.trim()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-xs transition-all disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Log</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 font-mono text-xs">
              Select an incident from the catalog to inspect case evidence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseManagement;
