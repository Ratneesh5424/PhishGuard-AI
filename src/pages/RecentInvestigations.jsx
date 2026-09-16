import React from 'react';
import { useThreat } from '../context/ThreatContext';
import { useNavigate } from 'react-router-dom';
import CaseCard from '../components/CaseCard';

export const RecentInvestigations = () => {
  const navigate = useNavigate();
  const { cases = [], uniqueCases: ctxUniqueCases, setCurrentInvestigation } = useThreat();

  const uniqueCases = (ctxUniqueCases || Array.from(
    new Map((cases || []).filter(Boolean).map(c => [c?.id, c])).values()
  )).filter(Boolean);

  const handleSelectCase = (c) => {
    if (!c) return;
    if (c.investigationRef) {
      c.investigationRef.startTime = c.investigationRef?.startTime ?? Date.now();
      setCurrentInvestigation(c.investigationRef);
    } else {
      c.startTime = c?.startTime ?? Date.now();
      setCurrentInvestigation(c);
    }
    navigate('/ai-report');
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
        <h2 className="text-xl font-bold text-white mb-2">Recent Forensic Investigations</h2>
        <p className="text-xs text-slate-400 font-mono mb-6">
          Real-time incident ledger deduplicated across all forensic engines.
        </p>
        <div className="space-y-3">
          {uniqueCases.map((c, index) => (
            <CaseCard
              key={`${c?.id || 'case'}-${index}`}
              case={c}
              onClick={handleSelectCase}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentInvestigations;
