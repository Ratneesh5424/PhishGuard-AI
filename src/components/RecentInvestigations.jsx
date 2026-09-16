import React from 'react';
import CaseCard from './CaseCard';

export const RecentInvestigations = ({
  cases = [],
  onSelectCase,
  selectedCaseId,
  className = ''
}) => {
  const uniqueCases = Array.from(
    new Map((cases || []).filter(Boolean).map(c => [c?.id, c])).values()
  ).filter(Boolean);

  return (
    <div className={`space-y-2.5 ${className}`}>
      {uniqueCases.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500 font-mono">
          No investigations recorded yet.
        </div>
      ) : (
        uniqueCases.map((c, index) => (
          <CaseCard
            key={`${c?.id || 'case'}-${index}`}
            case={c}
            onClick={onSelectCase}
            isSelected={selectedCaseId === c?.id}
          />
        ))
      )}
    </div>
  );
};

export default RecentInvestigations;
