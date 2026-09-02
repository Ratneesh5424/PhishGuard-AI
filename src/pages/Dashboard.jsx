import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Upload,
  ArrowRight,
  Shield,
  Sparkles,
  RefreshCw,
  ShieldAlert,
  Percent,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import RiskMeter from '../components/RiskMeter';
import EmailTable from '../components/EmailTable';
import ThreatTrendChart from '../components/ThreatTrendChart';
import RecentActivity from '../components/RecentActivity';
import Button from '../components/Button';
import { getDeviceId } from '../utils/deviceId';

export const Dashboard = () => {
  const navigate = useNavigate();

  // A brand-new device starts with 0 reports, empty history, and blank charts
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch live records from Supabase email_history table filtered by device_id
  const fetchDashboardData = useCallback(async () => {
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
          // Guarantee newest first ordering (analyzed_at DESC)
          const sorted = [...data.records].sort((a, b) => {
            const timeA = a.analyzed_at ? new Date(a.analyzed_at).getTime() : 0;
            const timeB = b.analyzed_at ? new Date(b.analyzed_at).getTime() : 0;
            return timeB - timeA;
          });
          setRecords(sorted);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend history fetch error, checking local store:', err);
    } finally {
      setIsLoading(false);
    }

    // Fallback: check device-scoped localStorage
    try {
      const stored = localStorage.getItem(`phishguard_history_${deviceId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const formatted = parsed.map((p) => ({
            id: p.id,
            subject: p.subject,
            sender: p.sender,
            risk_score: p.riskScore ?? p.risk_score,
            status: p.status,
            confidence: p.confidence,
            summary: p.summary,
            analyzed_at: p.analyzed_at || p.date,
          })).sort((a, b) => {
            const timeA = a.analyzed_at ? new Date(a.analyzed_at).getTime() : 0;
            const timeB = b.analyzed_at ? new Date(b.analyzed_at).getTime() : 0;
            return timeB - timeA;
          });
          setRecords(formatted);
          return;
        }
      }
    } catch (e) {
      // ignore
    }

    setRecords([]);
  }, []);

  // 2. Auto-refresh dashboard after every completed analysis, on visibility change, or on focus
  useEffect(() => {
    fetchDashboardData();

    const handleNewScan = () => {
      fetchDashboardData();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData();
      }
    };

    window.addEventListener('phishguard_analysis_completed', handleNewScan);
    window.addEventListener('storage', handleNewScan);
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', fetchDashboardData);

    return () => {
      window.removeEventListener('phishguard_analysis_completed', handleNewScan);
      window.removeEventListener('storage', handleNewScan);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', fetchDashboardData);
    };
  }, [fetchDashboardData]);

  // 3. Computed Real Statistics strictly from current device records
  const { totalCount, highRiskCount, suspiciousCount, safeCount, avgRisk } = useMemo(() => {
    const total = records.length;
    let high = 0;
    let susp = 0;
    let safe = 0;
    let sumScore = 0;

    records.forEach((r) => {
      const score = typeof r.risk_score === 'number' ? r.risk_score : (typeof r.riskScore === 'number' ? r.riskScore : 0);
      sumScore += score;

      if (score >= 71) {
        high++;
      } else if (score >= 31) {
        susp++;
      } else {
        safe++;
      }
    });

    const avg = total > 0 ? Math.round(sumScore / total) : 0;

    return {
      totalCount: total,
      highRiskCount: high,
      suspiciousCount: susp,
      safeCount: safe,
      avgRisk: avg,
    };
  }, [records]);

  // 4. Group records by analyzed_at date for the 7-Day Threat Trend Chart (0 for clean device)
  const trendData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const past7Days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      past7Days.push({
        day: days[d.getDay()],
        dateStr: d.toISOString().split('T')[0],
        scanned: 0,
        phishing: 0,
        blocked: 0,
      });
    }

    records.forEach((r) => {
      const recDate = r.analyzed_at ? new Date(r.analyzed_at).toISOString().split('T')[0] : '';
      const target = past7Days.find((p) => p.dateStr === recDate);

      const score = typeof r.risk_score === 'number' ? r.risk_score : (typeof r.riskScore === 'number' ? r.riskScore : 0);
      const isHigh = score >= 71;
      const isSusp = score >= 31 && score <= 70;

      if (target) {
        target.scanned++;
        if (isHigh) target.phishing++;
        if (isHigh || isSusp) target.blocked++;
      }
    });

    return past7Days.map((dayObj) => ({
      day: dayObj.day,
      scanned: dayObj.scanned,
      phishing: dayObj.phishing,
      blocked: dayObj.blocked,
    }));
  }, [records]);

  // 5. Recent Activity: Latest 5 analyses strictly for this device
  const recentActivities = useMemo(() => {
    return records.slice(0, 5).map((r, idx) => {
      const score = typeof r.risk_score === 'number' ? r.risk_score : (typeof r.riskScore === 'number' ? r.riskScore : 0);
      const isHigh = score >= 71;
      const isSusp = score >= 31 && score <= 70;

      const dateObj = r.analyzed_at ? new Date(r.analyzed_at) : new Date();
      const timeDiffMins = Math.max(1, Math.round((Date.now() - dateObj.getTime()) / 60000));
      const timeStr =
        timeDiffMins < 60
          ? `${timeDiffMins} mins ago`
          : timeDiffMins < 1440
          ? `${Math.round(timeDiffMins / 60)} hours ago`
          : dateObj.toLocaleDateString();

      return {
        id: r.id || idx,
        type: isHigh ? 'phishing' : isSusp ? 'suspicious' : 'clean',
        title: isHigh
          ? 'Phishing Threat Detected'
          : isSusp
          ? 'Suspicious Signal Quarantined'
          : 'Clean Email Verified',
        description: r.summary || r.subject || 'Completed heuristic and AI inspection.',
        subject: r.subject,
        sender: r.sender,
        time: timeStr,
        status: isHigh ? 'HIGH RISK' : isSusp ? 'SUSPICIOUS' : 'SAFE',
        badge: isHigh ? 'High Risk' : isSusp ? 'Suspicious' : 'Clean Pass',
        badgeClass: isHigh
          ? 'text-rose-300 bg-rose-950/60 border-rose-500/40'
          : isSusp
          ? 'text-amber-300 bg-amber-950/60 border-amber-500/40'
          : 'text-emerald-300 bg-emerald-950/60 border-emerald-500/40',
        iconColor: isHigh ? 'text-rose-400' : isSusp ? 'text-amber-400' : 'text-emerald-400',
        iconBg: isHigh
          ? 'bg-rose-500/10 border-rose-500/30'
          : isSusp
          ? 'bg-amber-500/10 border-amber-500/30'
          : 'bg-emerald-500/10 border-emerald-500/30',
      };
    });
  }, [records]);

  // Latest 5 Analyzed Emails for the Recent Inspections Table
  const recentEmails = useMemo(() => {
    return records.slice(0, 5).map((r) => {
      const dateObj = r.analyzed_at ? new Date(r.analyzed_at) : new Date();
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const mins = String(dateObj.getMinutes()).padStart(2, '0');
      const isToday = dateObj.toDateString() === new Date().toDateString();

      const score = typeof r.risk_score === 'number' ? r.risk_score : (typeof r.riskScore === 'number' ? r.riskScore : 0);
      const isHigh = score >= 71;
      const isSusp = score >= 31 && score <= 70;

      return {
        id: r.id || `em-${Math.random()}`,
        subject: r.subject || 'Analyzed Email Threat Assessment',
        sender: r.sender || 'unknown@domain.com',
        date: isToday ? `Today, ${hours}:${mins}` : dateObj.toLocaleDateString(),
        riskScore: score,
        status: isHigh ? 'phishing' : isSusp ? 'suspicious' : 'clean',
        rawRecord: r,
      };
    });
  }, [records]);

  // Click row to view stored report on Result page
  const handleSelectEmail = (email) => {
    const raw = email.rawRecord || {};
    const targetId = email.id || raw.id;
    navigate('/result', {
      state: {
        recordId: targetId,
        isHistoryView: true,
        initialRecord: raw,
      },
    });
  };

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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-7xl mx-auto pb-8"
    >
      {/* Top Banner / Header with Gradient CTA */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-indigo-950/40 border border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.35)] shadow-blue-950/20"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Supabase Database Synchronized
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Security Intelligence Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Real-time phishing defense, heuristic email inspection, and telemetry monitoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh button */}
          <button
            type="button"
            onClick={fetchDashboardData}
            title="Refresh Live Telemetry"
            className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-cyan-300 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Blue gradient CTA with hover animation */}
          <Button
            variant="gradient"
            size="lg"
            onClick={() => navigate('/analyze')}
            icon={Upload}
            className="shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)]"
          >
            Upload Email for Analysis
            <ArrowRight className="w-4 h-4 ml-1 opacity-80" />
          </Button>
        </div>
      </motion.div>

      {/* 1. Statistics Cards: Total Reports, High Risk, Suspicious, Safe, Average Risk % */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        {/* Total Reports */}
        <StatCard
          title="Total Reports"
          value={totalCount.toLocaleString()}
          change="All scans"
          isPositive={true}
          icon={Mail}
        />

        {/* High Risk */}
        <StatCard
          title="High Risk"
          value={highRiskCount.toString()}
          change={`${totalCount > 0 ? Math.round((highRiskCount / totalCount) * 100) : 0}% of scans`}
          isPositive={false}
          icon={ShieldAlert}
        />

        {/* Suspicious */}
        <StatCard
          title="Suspicious"
          value={suspiciousCount.toString()}
          change={`${totalCount > 0 ? Math.round((suspiciousCount / totalCount) * 100) : 0}% of scans`}
          isPositive={false}
          icon={AlertTriangle}
        />

        {/* Safe */}
        <StatCard
          title="Safe"
          value={safeCount.toString()}
          change={`${totalCount > 0 ? Math.round((safeCount / totalCount) * 100) : 100}% clean`}
          isPositive={true}
          icon={ShieldCheck}
        />

        {/* Average Risk % */}
        <StatCard
          title="Average Risk"
          value={`${avgRisk}%`}
          change={avgRisk >= 71 ? 'High Threat' : avgRisk >= 31 ? 'Elevated Risk' : 'Low Threat'}
          isPositive={avgRisk <= 30}
          icon={Percent}
        />
      </motion.div>

      {/* 2 & 3. 7-Day Threat Trend Chart (Grouped by Date) + Circular SVG Risk Score Meter */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ThreatTrendChart
            data={trendData}
            totalScanned={totalCount}
            totalThreats={highRiskCount + suspiciousCount}
          />
        </div>
        <div className="flex flex-col">
          <RiskMeter
            score={avgRisk}
            level={avgRisk >= 71 ? 'High Threat State' : avgRisk >= 31 ? 'Elevated Vigilance' : 'Low Threat State'}
            className="h-full justify-between"
          />
        </div>
      </motion.div>

      {/* 4. Recent Scans Table & Recent Activity Timeline */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white tracking-wide">
                Recent Email Inspections
              </h2>
            </div>
            <button
              onClick={() => navigate('/history')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 font-mono"
            >
              View Full History ({totalCount}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <EmailTable emails={recentEmails} onSelectEmail={handleSelectEmail} />
        </div>

        {/* Recent Activity Timeline (Latest 5 Supabase records with sender, subject, status, time) */}
        <div className="space-y-3">
          <RecentActivity activities={recentActivities} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
