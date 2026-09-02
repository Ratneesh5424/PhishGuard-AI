import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  History as HistoryIcon,
  Search,
  Filter,
  ArrowUpDown,
  FileText,
  FileDown,
  Trash2,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BarChart3,
  TrendingUp,
  X,
  Database,
  RefreshCw,
} from 'lucide-react';
import Button from '../components/Button';
import { downloadPhishGuardPDF } from '../utils/pdfGenerator';
import { getDeviceId } from '../utils/deviceId';

export const History = () => {
  const navigate = useNavigate();

  // Clean empty state for new devices
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch from Supabase via backend API on mount filtered by device_id
  const fetchSupabaseHistory = async () => {
    setIsLoading(true);
    const deviceId = getDeviceId();

    try {
      const res = await fetch(
        `http://localhost:5000/api/history?deviceId=${encodeURIComponent(deviceId)}`,
        {
          headers: {
            'x-device-id': deviceId,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.records && Array.isArray(data.records)) {
          setIsSupabaseConnected(true);

          // Format Supabase rows (id, sender, subject, risk_score, status, confidence, summary, analyzed_at)
          const formatted = data.records.map((r) => {
            const dateObj = r.analyzed_at ? new Date(r.analyzed_at) : new Date();
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const mins = String(dateObj.getMinutes()).padStart(2, '0');

            const isToday =
              dateObj.toDateString() === new Date().toDateString();

            const score = typeof r.risk_score === 'number' ? r.risk_score : (typeof r.riskScore === 'number' ? r.riskScore : 0);
            const statusLabel = score >= 71 ? 'High Risk' : score >= 31 ? 'Suspicious' : 'Safe';

            return {
              id: r.id || `rep-${Date.now()}`,
              date: `${year}-${month}-${day} ${hours}:${mins}`,
              displayDate: isToday
                ? `Today, ${hours}:${mins}`
                : `${month}/${day}/${year}`,
              subject: r.subject || 'Analyzed Email Threat Assessment',
              sender: r.sender || 'unknown@sender.com',
              riskScore: score,
              status: statusLabel,
              confidence: typeof r.confidence === 'number' ? r.confidence : 97.5,
              summary: r.summary || '',
              analyzed_at: r.analyzed_at,
            };
          });

          // Ensure newest first order (analyzed_at DESC)
          formatted.sort((a, b) => {
            const timeA = a.analyzed_at ? new Date(a.analyzed_at).getTime() : new Date(a.date).getTime();
            const timeB = b.analyzed_at ? new Date(b.analyzed_at).getTime() : new Date(b.date).getTime();
            return timeB - timeA;
          });

          setReports(formatted);
          return;
        }
      }
    } catch (err) {
      console.warn('Could not fetch Supabase history from backend:', err);
    } finally {
      setIsLoading(false);
    }

    // Fallback: check device-scoped localStorage
    try {
      const stored = localStorage.getItem(`phishguard_history_${deviceId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const formatted = parsed.map((p) => {
            const score = typeof p.riskScore === 'number' ? p.riskScore : (typeof p.risk_score === 'number' ? p.risk_score : 0);
            const statusLabel = score >= 71 ? 'High Risk' : score >= 31 ? 'Suspicious' : 'Safe';
            return {
              ...p,
              riskScore: score,
              status: statusLabel,
            };
          }).sort((a, b) => {
            const timeA = a.analyzed_at ? new Date(a.analyzed_at).getTime() : new Date(a.date).getTime();
            const timeB = b.analyzed_at ? new Date(b.analyzed_at).getTime() : new Date(b.date).getTime();
            return timeB - timeA;
          });
          setReports(formatted);
          return;
        }
      }
    } catch (e) {
      // ignore
    }

    setReports([]);
  };

  useEffect(() => {
    fetchSupabaseHistory();
  }, []);

  // Delete row (from state, localStorage, and Supabase)
  const handleDelete = async (id) => {
    const deviceId = getDeviceId();
    setReports((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(`phishguard_history_${deviceId}`, JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });

    try {
      await fetch(`http://localhost:5000/api/history/${id}?deviceId=${encodeURIComponent(deviceId)}`, {
        method: 'DELETE',
        headers: {
          'x-device-id': deviceId,
        },
      });
    } catch (e) {
      // ignore backend delete error
    }
  };

  const handleDownloadReport = async (report) => {
    try {
      await downloadPhishGuardPDF({
        ...report,
        riskLevel: report.status,
        verdict: report.status,
        authentication: {
          spf: report.status === 'Safe' ? 'Passed' : 'Failed',
          dkim: report.status === 'Safe' ? 'Passed' : 'Failed',
          dmarc: report.status === 'Safe' ? 'Passed' : 'Failed',
        },
      });
    } catch (err) {
      console.error('Failed to download forensic PDF:', err);
    }
  };

  // Requirement: Clicking a history item opens the Result page by fetching that exact record ID from Supabase
  const handleViewReport = (report) => {
    navigate('/result', {
      state: {
        recordId: report.id,
        isHistoryView: true,
        initialRecord: report,
      },
    });
  };

  // Filter & Search Logic
  const filteredReports = useMemo(() => {
    return reports
      .filter((item) => {
        if (statusFilter !== 'All' && item.status !== statusFilter) {
          return false;
        }
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchesSubject = item.subject.toLowerCase().includes(q);
          const matchesSender = item.sender.toLowerCase().includes(q);
          return matchesSubject || matchesSender;
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = a.analyzed_at ? new Date(a.analyzed_at).getTime() : new Date(a.date).getTime();
        const timeB = b.analyzed_at ? new Date(b.analyzed_at).getTime() : new Date(b.date).getTime();
        if (sortOrder === 'newest') {
          return timeB - timeA;
        } else {
          return timeA - timeB;
        }
      });
  }, [reports, searchQuery, statusFilter, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage) || 1;
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(start, start + itemsPerPage);
  }, [filteredReports, currentPage]);

  // Statistics calculation
  const totalReportsCount = reports.length;
  const highRiskCount = reports.filter((r) => r.status === 'High Risk' || (typeof r.riskScore === 'number' && r.riskScore >= 71)).length;
  const safeCount = reports.filter((r) => r.status === 'Safe' || (typeof r.riskScore === 'number' && r.riskScore <= 30)).length;
  const avgRisk =
    totalReportsCount > 0
      ? Math.round(reports.reduce((acc, r) => acc + r.riskScore, 0) / totalReportsCount)
      : 0;

  const getStatusBadge = (status) => {
    const s = String(status || '').trim().toLowerCase();
    if (s === 'safe' || s === 'clean' || s === 'clean pass') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Safe
        </span>
      );
    }
    if (s === 'suspicious') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950/70 text-amber-300 border border-amber-500/40 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Suspicious
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950/70 text-rose-300 border border-rose-500/40 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
        High Risk
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-7xl mx-auto pb-16"
    >
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
              <HistoryIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Analysis History
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Access previously analyzed phishing reports and Supabase threat records.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto font-mono text-xs">
          <button
            type="button"
            onClick={fetchSupabaseHistory}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Sync</span>
          </button>

          <span className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            Table: <strong className="text-cyan-400">email_history</strong>
          </span>

          <span className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            Total Records: <strong className="text-cyan-400 font-bold">{totalReportsCount}</strong>
          </span>
        </div>
      </div>

      {/* TOP CONTROL BAR (Search, Filters, Sort) */}
      <div className="p-4 rounded-2xl backdrop-blur-xl bg-slate-900/65 border border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.37)] shadow-blue-950/20 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by sender or subject..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400 hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 text-xs font-semibold focus:outline-none focus:border-cyan-500/50 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Safe">Safe</option>
              <option value="Suspicious">Suspicious</option>
              <option value="High Risk">High Risk</option>
            </select>
          </div>

          {/* Sort By Date */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 text-xs font-semibold focus:outline-none focus:border-cyan-500/50 cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT: 2-COLUMN LAYOUT (Table + Right Panel Statistics) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT / CENTER: MAIN TABLE (Col Span 3) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="overflow-hidden rounded-2xl backdrop-blur-xl bg-slate-900/65 border border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.37)] shadow-blue-950/20">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-slate-800/80 bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                  <tr>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Subject</th>
                    <th className="px-5 py-4">Sender</th>
                    <th className="px-5 py-4">Risk Score</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  <AnimatePresence mode="popLayout">
                    {paginatedReports.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-mono text-xs">
                          No matching analysis records found for current filters.
                        </td>
                      </tr>
                    ) : (
                      paginatedReports.map((report) => {
                        const isHigh = report.riskScore >= 71;
                        const isSusp = report.riskScore >= 31 && report.riskScore <= 70;

                        return (
                          <motion.tr
                            key={report.id}
                            layout
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                            onClick={() => handleViewReport(report)}
                          >
                            {/* Date */}
                            <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-400 font-mono">
                              {report.displayDate}
                            </td>

                            {/* Subject */}
                            <td className="px-5 py-4">
                              <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors max-w-xs truncate">
                                {report.subject}
                              </div>
                            </td>

                            {/* Sender */}
                            <td className="px-5 py-4 text-xs font-mono text-slate-400 max-w-[200px] truncate">
                              {report.sender}
                            </td>

                            {/* Risk Score */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span
                                className={`font-mono font-bold text-sm ${
                                  isHigh
                                    ? 'text-rose-400'
                                    : isSusp
                                    ? 'text-amber-400'
                                    : 'text-emerald-400'
                                }`}
                              >
                                {report.riskScore}%
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              {getStatusBadge(report.status)}
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                {/* View Report */}
                                <button
                                  type="button"
                                  onClick={() => handleViewReport(report)}
                                  title="View Full Report"
                                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-cyan-950/60 border border-slate-700/80 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>

                                {/* Download TXT/PDF */}
                                <button
                                  type="button"
                                  onClick={() => handleDownloadReport(report)}
                                  title="Download Summary Report"
                                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-indigo-950/60 border border-slate-700/80 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-300 transition-all"
                                >
                                  <FileDown className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete */}
                                <button
                                  type="button"
                                  onClick={() => handleDelete(report.id)}
                                  title="Delete Record"
                                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 border border-slate-700/80 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* PAGINATION CONTROLS */}
            <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-mono">
              <div>
                Showing{' '}
                <span className="text-white font-bold">
                  {filteredReports.length === 0
                    ? 0
                    : (currentPage - 1) * itemsPerPage + 1}
                </span>{' '}
                to{' '}
                <span className="text-white font-bold">
                  {Math.min(currentPage * itemsPerPage, filteredReports.length)}
                </span>{' '}
                of <span className="text-cyan-400 font-bold">{filteredReports.length}</span> reports
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl font-bold text-xs transition-all ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)] border border-cyan-400/40'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: STATISTICS CARD (Col Span 1) */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl backdrop-blur-xl bg-slate-900/65 border border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.37)] shadow-blue-950/20 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  History Overview
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Supabase</span>
            </div>

            {/* Stat Item: Total Reports */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-mono">Total Reports</p>
                <p className="text-2xl font-black text-white mt-0.5">{totalReportsCount}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 text-cyan-400">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            {/* Stat Item: High Risk */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-rose-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs text-rose-400 font-mono">High Risk</p>
                <p className="text-2xl font-black text-rose-300 mt-0.5">{highRiskCount}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>

            {/* Stat Item: Safe */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-400 font-mono">Safe Emails</p>
                <p className="text-2xl font-black text-emerald-300 mt-0.5">{safeCount}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            {/* Stat Item: Average Risk */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-indigo-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-400 font-mono">Average Risk</p>
                <p className="text-2xl font-black text-indigo-300 mt-0.5">{avgRisk}%</p>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            {/* Quick Action Button */}
            <Button
              variant="gradient"
              size="md"
              onClick={() => navigate('/analyze')}
              className="w-full text-xs font-bold"
            >
              Analyze New Email
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default History;
