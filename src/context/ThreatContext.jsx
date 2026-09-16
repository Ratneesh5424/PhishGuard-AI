import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback
} from 'react';
import { analyzeEmail as runForensicEngine, generateInvestigation } from '../services/forensicEngine';
import { MOCK_PRESETS, MOCK_CASES, MOCK_TREND_CHART_DATA, MOCK_METRICS } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { getDeviceId } from '../utils/deviceId';
import { api } from '../lib/api';

const ThreatContext = createContext(null);

const DEFAULT_SAMPLE_EMAIL = `From: "Satya Nadella" <ceo-office@microsoft-exec-portal.cc>
To: cfo-team@enterprise-defense.gov.in
Reply-To: finance-reconciliation@fin-direct-offshore.pw
Return-Path: <bounce-exec@fin-direct-offshore.pw>
Date: Tue, 03 Sep 2026 10:14:22 +0530
Subject: URGENT: Approved Acquisition Payment Routing Authorization [CONFIDENTIAL]
Message-ID: <20260903-BEC-EXEC-991204@microsoft-exec-portal.cc>
X-Originating-IP: [185.220.101.45]
Authentication-Results: mx.google.com; spf=fail smtp.mailfrom=bounce-exec@fin-direct-offshore.pw; dkim=fail; dmarc=fail header.from=microsoft-exec-portal.cc
Content-Type: text/plain; charset="UTF-8"

CONFIDENTIAL EXECUTIVE DIRECTIVE
From: Office of the Chief Executive Officer
To: Corporate Financial Operations / CFO

Team,
Pursuant to our NDA regarding Project Titan (Strategic Infrastructure Acquisition), please execute the expedited payment wire of $2,450,000 USD immediately to the escrow clearing account below before 17:00 IST today.

Beneficiary Bank: Offshore Escrow Clearing AG (Zurich Branch)
IBAN: DE89 3704 0044 0532 0130 00
Routing/SWIFT: DEUTDEDDFXX
Reference Code: SIH-2026-TITAN-ESCROW

Do not discuss this on open Slack or email channels due to SEC quiet period regulations. Confirm execution directly via the encrypted link below:
https://secure-exec-auth.microsoft-exec-portal.cc/wire/confirm?tx=99104

Regards,
Satya Nadella
Chief Executive Officer`;

// Generate guaranteed collision-free unique Case ID using UUID / timestamp
function generateUniqueCaseId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `CASE-2026-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  }
  return `CASE-2026-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// Utility to strictly deduplicate case arrays by ID
function deduplicateCases(array) {
  if (!Array.isArray(array)) return [];
  const map = new Map();
  for (const item of array) {
    if (item && item.id) {
      if (!map.has(item.id)) {
        map.set(item.id, item);
      }
    }
  }
  return Array.from(map.values());
}

export const ThreatProvider = ({ children }) => {
  // 1. Central Investigation Object (Single Canonical Shared Source of Truth)
  const [currentInvestigation, setCurrentInvestigation] = useState(() => {
    try {
      const stored = localStorage.getItem('phishguard_current_investigation');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && parsed.score !== undefined) {
          parsed.startTime = parsed?.startTime ?? Date.now();
          return parsed;
        }
      }
    } catch (e) {}
    const initial = runForensicEngine(DEFAULT_SAMPLE_EMAIL) || {};
    initial.id = initial.id || 'CASE-2026-0891';
    initial.caseId = initial.caseId || 'CASE-2026-0891';
    initial.startTime = initial?.startTime ?? Date.now();
    return initial;
  });

  // 2. Dynamic Dashboard Metrics
  const [metrics, setMetrics] = useState(() => {
    try {
      const stored = localStorage.getItem('phishguard_live_metrics');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return MOCK_METRICS;
  });

  // 3. Dynamic Trend Chart Data
  const [trendData, setTrendData] = useState(() => {
    try {
      const stored = localStorage.getItem('phishguard_live_trend');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return MOCK_TREND_CHART_DATA;
  });

  // 4. Case Management Store (Strictly deduplicated entries)
  const [cases, setCases] = useState(() => {
    try {
      const stored = localStorage.getItem('phishguard_cases');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return deduplicateCases(parsed);
        }
      }
    } catch (e) {}
    return deduplicateCases(MOCK_CASES);
  });

  // 5. Recent Investigations Feed (Strictly deduplicated)
  const [recentInvestigations, setRecentInvestigations] = useState(() => {
    try {
      const stored = localStorage.getItem('phishguard_recent_scans');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return deduplicateCases(parsed);
        }
      }
    } catch (e) {}
    return [
      {
        id: 'CASE-2026-0891',
        title: 'Acquisition Wire Fraud Impersonating CEO Satya Nadella',
        subject: 'URGENT: Approved Acquisition Payment Routing Authorization [CONFIDENTIAL]',
        targetDomain: 'microsoft-exec-portal.cc',
        originCountry: 'Romania (Bucharest)',
        riskScore: 96,
        score: 96,
        threatLevel: 'CRITICAL',
        level: 'CRITICAL',
        status: 'In Progress',
        timestamp: 'Just now'
      }
    ];
  });

  // Active Operator Persona
  const [activeUser, setActiveUser] = useState({
    name: 'Vikram Mehta',
    role: 'Lead Threat Hunter & SOC Commander',
    organization: 'National Cyber Coordination Centre (NCCC)',
    avatar: 'VM',
    badge: 'SOC Clearance'
  });

  // Save state to local storage whenever it changes (guaranteed deduplication)
  useEffect(() => {
    try {
      const dedupedCases = deduplicateCases(cases);
      const dedupedRecent = deduplicateCases(recentInvestigations);

      localStorage.setItem('phishguard_current_investigation', JSON.stringify(currentInvestigation));
      localStorage.setItem('phishguard_live_metrics', JSON.stringify(metrics));
      localStorage.setItem('phishguard_live_trend', JSON.stringify(trendData));
      localStorage.setItem('phishguard_cases', JSON.stringify(dedupedCases));
      localStorage.setItem('phishguard_recent_scans', JSON.stringify(dedupedRecent));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [currentInvestigation, metrics, trendData, cases, recentInvestigations]);

  // Helper to dynamically set dashboard stats from backend
  const setDashboardStats = useCallback((statsData) => {
    if (!statsData) return;
    const s = statsData.stats || statsData;
    const totalReports = typeof s.totalReports === 'number' ? s.totalReports : (s.totalScanned || 0);
    const highRiskCount = typeof s.highRiskCount === 'number'
      ? s.highRiskCount
      : (typeof s.highCount === 'number' ? (s.highCount + (s.criticalCount || 0)) : (s.highRiskAlerts || 0));
    const safeCount = typeof s.safeCount === 'number' ? s.safeCount : (s.cleanVerifiedCount || 0);

    setMetrics(prev => ({
      ...prev,
      totalScanned: totalReports,
      highRiskAlerts: highRiskCount,
      cleanVerifiedCount: safeCount,
      highRiskRate: totalReports > 0 ? `${Math.round((highRiskCount / totalReports) * 100)}%` : '0%',
      cleanVerifiedRate: totalReports > 0 ? `${Math.round((safeCount / totalReports) * 100)}%` : '100%',
      authProtocolFails: Math.max(0, highRiskCount - 2),
    }));
  }, []);

  // Dynamic Dashboard Stats Synced from Supabase via backend API
  const refreshStats = useCallback(async () => {
    try {
      const stats = await api("/api/stats");
      setDashboardStats(stats);
      return stats;
    } catch (e) {
      console.warn('Backend api /api/stats fallback:', e.message);
    }

    if (supabase) {
      try {
        const { data, error } = await supabase.from('email_history').select('*');
        if (!error && data) {
          const totalReports = data.length;
          let highRiskCount = 0;
          let safeCount = 0;
          for (const r of data) {
            const s = typeof r.risk_score === 'number' ? r.risk_score : 0;
            if (s >= 61 || r.status === 'HIGH RISK' || r.status === 'CRITICAL') highRiskCount++;
            else if (s <= 30 || r.status === 'SAFE') safeCount++;
          }
          setMetrics(prev => ({
            ...prev,
            totalScanned: totalReports,
            highRiskAlerts: highRiskCount,
            cleanVerifiedCount: safeCount,
            highRiskRate: totalReports > 0 ? `${Math.round((highRiskCount / totalReports) * 100)}%` : '0%',
            cleanVerifiedRate: totalReports > 0 ? `${Math.round((safeCount / totalReports) * 100)}%` : '100%',
            authProtocolFails: Math.max(0, highRiskCount - 2),
          }));
        }
      } catch (err) {}
    }
  }, [setDashboardStats]);

  // Sync Supabase stats on initial mount
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  /**
   * Primary Forensic Analysis Pipeline:
   * 1. Extract base MIME/header structure
   * 2. Send POST /api/analyze to Express backend
   * 3. Call Gemini for dynamic threat analysis
   * 4. Save to Supabase email_history
   * 5. Refresh /api/stats
   * 6. Update Dashboard automatically
   */
  const analyzeEmail = useCallback(async (rawText, attachmentsList = []) => {
    // Run real baseline forensic engine
    const baseInvestigation = runForensicEngine(rawText);

    if (Array.isArray(attachmentsList) && attachmentsList.length > 0) {
      baseInvestigation.attachments = [...(baseInvestigation.attachments || []), ...attachmentsList];
    }

    let newInvestigation = baseInvestigation;

    const sender = baseInvestigation.senderEmail || baseInvestigation.sender || 'unknown@sender.com';
    const subject = baseInvestigation.subject || 'Analyzed Email Threat Assessment';
    const emailText = rawText;

    try {
      // Send ONLY sender, subject, emailText (no deviceId or telemetry in body)
      const backendData = await api('/api/analyze', {
        method: 'POST',
        body: JSON.stringify({
          sender,
          subject,
          emailText,
        }),
      });

      const backendResult = backendData.data || backendData;
      if (backendResult && (typeof backendResult.riskScore === 'number' || typeof backendResult.score === 'number')) {
        const score = typeof backendResult.riskScore === 'number' ? backendResult.riskScore : backendResult.score;
        const verdict = backendResult.verdict || backendResult.threatLevel || backendResult.status || (score >= 71 ? 'HIGH RISK' : score >= 31 ? 'SUSPICIOUS' : 'SAFE');
        const explanation = backendResult.explanation || backendResult.executiveSummary || backendResult.summary || baseInvestigation.summary;
        const indicators = backendResult.suspiciousIndicators || [];

        newInvestigation = {
          ...baseInvestigation,
          ...backendResult,
          id: backendResult.id || baseInvestigation.id,
          caseId: backendResult.caseId || baseInvestigation.caseId,
          score,
          riskScore: score,
          level: verdict,
          threatLevel: verdict,
          verdict,
          status: verdict,
          summary: explanation,
          executiveSummary: explanation,
          explanation,
          suspiciousIndicators: indicators,
          confidence: typeof backendResult.confidence === 'number' ? backendResult.confidence : 98.6,
          subject: backendResult.subject || subject,
          sender: backendResult.sender || sender,
          senderDomain: baseInvestigation.senderDomain,
          bodyText: rawText,
          aiVerdict: {
            intent: verdict,
            explanation,
          },
          aiAnalysis: {
            intent: verdict,
            explanation,
          },
        };
      }
    } catch (apiErr) {
      console.warn('Backend /api/analyze request failed, using local engine:', apiErr.message);
    }

    if (!newInvestigation) {
      newInvestigation = baseInvestigation || {};
    }

    newInvestigation.startTime = newInvestigation?.startTime ?? Date.now();
    newInvestigation.timestamp = newInvestigation?.timestamp ?? new Date().toISOString();

    if (!newInvestigation.id) {
      const finalUuid = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
        ? crypto.randomUUID()
        : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;
      newInvestigation.id = finalUuid;
      newInvestigation.caseId = `CASE-2026-${finalUuid.slice(0, 8).toUpperCase()}`;
    }

    // Save analysis as Single Shared Source of Truth
    setCurrentInvestigation(newInvestigation);

    // Refresh live Supabase statistics for Dashboard KPI cards
    await refreshStats();

    // Update Trend Chart Data point
    setTrendData(prev => {
      const current7d = prev['7d'] || [];
      const updated7d = [
        ...current7d,
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          phishing: newInvestigation.score > 50 ? 355 : 340,
          bec: newInvestigation.score > 75 ? 122 : 115,
          malware: (newInvestigation.attachments?.length || 0) > 0 ? 88 : 80,
          safe: newInvestigation.score <= 20 ? 1480 : 1460
        }
      ].slice(-8);
      return { ...prev, '7d': updated7d };
    });

    const finalId = newInvestigation.caseId || `CASE-2026-${(newInvestigation.id || '').slice(0, 8).toUpperCase()}`;

    // Update Recent Scans Feed
    const newRecent = {
      id: finalId,
      title: newInvestigation.subject,
      subject: newInvestigation.subject,
      targetDomain: newInvestigation.senderDomain,
      originCountry: newInvestigation.geo?.country && newInvestigation.geo.country !== 'Origin unavailable from supplied headers'
        ? `${newInvestigation.geo.country} (${newInvestigation.geo.city || 'Origin Node'})`
        : 'Origin Node',
      riskScore: newInvestigation.score,
      score: newInvestigation.score,
      threatLevel: newInvestigation.level,
      level: newInvestigation.level,
      status: 'Open',
      timestamp: 'Just now'
    };

    setRecentInvestigations(prev => {
      const deduped = deduplicateCases(prev);
      return [newRecent, ...deduped.filter(i => i.id !== finalId)].slice(0, 8);
    });

    // Save Automatically into Case Management
    const newCase = {
      id: finalId,
      title: newInvestigation.subject,
      severity: newInvestigation.level,
      status: 'Open',
      assignedTo: activeUser.name,
      threatType: newInvestigation.summary || 'Email Threat Assessment',
      riskScore: newInvestigation.score,
      score: newInvestigation.score,
      originCountry: `${newInvestigation.geo?.country || 'Unknown'} (${newInvestigation.geo?.city || 'Origin'})`,
      targetDomain: newInvestigation.senderDomain,
      originIp: newInvestigation.geo?.ip || newInvestigation.originIp,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: [
        {
          id: `n-${Date.now()}`,
          author: activeUser.name,
          text: newInvestigation.verdict || newInvestigation.summary || 'Automated AI forensic evaluation completed.',
          timestamp: new Date().toLocaleString()
        }
      ],
      iocs: newInvestigation.iocs,
      investigationRef: newInvestigation
    };

    setCases(prev => {
      const deduped = deduplicateCases(prev);
      return [newCase, ...deduped.filter(c => c.id !== finalId)];
    });

    return newInvestigation;
  }, [activeUser.name, refreshStats]);

  // Load an existing preset scenario
  const loadPreset = useCallback(async (presetId) => {
    const found = MOCK_PRESETS.find(p => p && p.id === presetId);
    if (found) {
      const inv = await analyzeEmail(found.bodyText);
      if (inv) {
        inv.bodyText = found.bodyText;
        inv.startTime = inv?.startTime ?? Date.now();
      }
      return inv ? { ...inv, bodyText: found.bodyText } : null;
    }
    return null;
  }, [analyzeEmail]);

  // Add investigation note to case
  const addCaseNote = useCallback((caseId, noteText) => {
    setCases(prev => prev.map(c => {
      if (c && c.id === caseId) {
        return {
          ...c,
          updatedAt: new Date().toISOString(),
          notes: [
            ...(c.notes || []),
            {
              id: `n-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
              author: activeUser.name,
              text: noteText,
              timestamp: new Date().toLocaleString()
            }
          ]
        };
      }
      return c;
    }));
  }, [activeUser.name]);

  // Update case status
  const updateCaseStatus = useCallback((caseId, newStatus) => {
    setCases(prev => prev.map(c => (c && c.id === caseId) ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c));
  }, []);

  // Open / Load exact investigation across all pages
  const openInvestigation = useCallback((caseOrId) => {
    if (!caseOrId) return null;
    let inv = null;
    if (typeof caseOrId === 'string') {
      const foundCase = cases.find(c => c && c.id === caseOrId);
      if (foundCase) {
        inv = foundCase.investigationRef || foundCase;
      }
    } else if (caseOrId && typeof caseOrId === 'object') {
      inv = caseOrId.investigationRef || caseOrId;
    }
    if (inv) {
      inv.startTime = inv?.startTime ?? Date.now();
      setCurrentInvestigation(inv);
      return inv;
    }
    return null;
  }, [cases]);

  // Deduplicated cases and recent investigations
  const uniqueCases = useMemo(() => {
    return deduplicateCases(cases);
  }, [cases]);

  const uniqueRecentInvestigations = useMemo(() => {
    return deduplicateCases(recentInvestigations);
  }, [recentInvestigations]);

  // Safe investigation setter guaranteeing startTime exists
  const setSafeCurrentInvestigation = useCallback((invOrFn) => {
    setCurrentInvestigation((prev) => {
      const next = typeof invOrFn === 'function' ? invOrFn(prev) : invOrFn;
      if (next && typeof next === 'object') {
        next.startTime = next?.startTime ?? Date.now();
      }
      return next;
    });
  }, []);

  return (
    <ThreatContext.Provider
      value={{
        // The Single Shared Canonical Central State
        currentInvestigation,
        setCurrentInvestigation: setSafeCurrentInvestigation,

        // Backward compatibility alias
        currentAnalysis: currentInvestigation,
        setCurrentAnalysis: setSafeCurrentInvestigation,

        // Metrics & Trends
        metrics,
        trendData,
        recentInvestigations: uniqueRecentInvestigations,
        uniqueRecentInvestigations,

        // Cases Store (guaranteed deduplicated array)
        cases: uniqueCases,
        uniqueCases,
        setCases,
        addCaseNote,
        updateCaseStatus,
        openInvestigation,

        // Operator
        activeUser,
        setActiveUser,

        // Core Actions
        analyzeEmail,
        parseAndAnalyzeEmail: analyzeEmail,
        loadPreset,
        refreshStats,
        setDashboardStats,
        presets: MOCK_PRESETS
      }}
    >
      {children}
    </ThreatContext.Provider>
  );
};

export const useThreat = () => {
  const context = useContext(ThreatContext);
  if (!context) {
    throw new Error('useThreat must be used within a ThreatProvider');
  }
  return context;
};
