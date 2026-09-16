import React from 'react';
import { ArrowRight } from 'lucide-react';

export const CaseCard = ({
  case: c,
  onClick,
  isSelected = false,
  className = ''
}) => {
  if (!c) return null;

  const severity = c.severity || c.threatLevel || 'SUSPICIOUS';
  const riskScore = typeof c.riskScore === 'number' ? c.riskScore : 0;
  const title = c.title || c.subject || 'Threat Investigation';
  const domain = c.targetDomain || c.senderDomain || 'domain.com';
  const origin = c.originCountry || (c.geo?.country ? `${c.geo.country} (${c.geo.city || 'Node'})` : null);

  const getSeverityBadgeClass = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-400 border border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/40';
      case 'SAFE':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
      case 'LOW':
        return 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40';
      default:
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/40';
    }
  };

  return (
    <div
      onClick={() => onClick && onClick(c)}
      className={`p-4 rounded-[18px] border transition-all cursor-pointer space-y-2 ${
        isSelected
          ? 'bg-slate-900 border-cyan-500/60 shadow-[0_0_25px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/40'
          : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-bold text-cyan-400">{c.id}</span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${getSeverityBadgeClass(severity)}`}>
          {severity} ({riskScore}%)
        </span>
      </div>

      <div className="text-xs font-bold text-white line-clamp-2">
        {title}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800">
        <span className="truncate max-w-[200px]">{domain}</span>
        <span className="text-slate-300 font-semibold shrink-0">{c.status || 'Open'}</span>
      </div>
    </div>
  );
};

export default CaseCard;
