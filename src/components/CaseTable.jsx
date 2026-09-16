import React from 'react';
import { ArrowRight, FolderLock } from 'lucide-react';

export const CaseTable = ({
  cases = [],
  onSelectCase,
  selectedCaseId,
  showAction = true,
  className = ''
}) => {
  const uniqueCases = Array.from(
    new Map((cases || []).filter(Boolean).map(c => [c?.id, c])).values()
  ).filter(Boolean);

  return (
    <div className={`space-y-2.5 ${className}`}>
      {uniqueCases.map((c, index) => {
        const isSelected = selectedCaseId === c?.id;
        return (
          <div
            key={`${c?.id || 'case'}-${index}`}
            onClick={() => onSelectCase && onSelectCase(c)}
            className={`p-4 rounded-[18px] border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isSelected
                ? 'bg-slate-900 border-cyan-500/60 shadow-[0_0_25px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/40'
                : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-400">{c.id}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  c.severity === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : c.severity === 'HIGH'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  {c.severity} ({c.riskScore}%)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{c.status}</span>
              </div>

              <div className="text-xs font-bold text-white line-clamp-2">
                {c.title}
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                <span>Domain: <strong className="text-slate-300">{c.targetDomain}</strong></span>
                {c.originCountry && (
                  <>
                    <span>•</span>
                    <span>Origin: <strong className="text-slate-300">{c.originCountry}</strong></span>
                  </>
                )}
              </div>
            </div>

            {showAction && (
              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <div className="text-right font-mono">
                  <div className="text-base font-extrabold text-rose-400">{c.riskScore}%</div>
                  <div className="text-[10px] text-slate-500">Risk Index</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CaseTable;
