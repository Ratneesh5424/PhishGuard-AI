import React from 'react';

const statusStyles = {
  safe: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
  clean: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
  phishing: 'bg-rose-950/60 text-rose-300 border-rose-500/40',
  malicious: 'bg-rose-950/60 text-rose-300 border-rose-500/40',
  suspicious: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
  warning: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
  quarantined: 'bg-purple-950/60 text-purple-300 border-purple-500/40',
  processing: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40 animate-pulse',
};

export const StatusBadge = ({
  status = 'safe',
  label,
  className = '',
}) => {
  const normalizedStatus = status.toLowerCase();
  const theme = statusStyles[normalizedStatus] || 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-sm uppercase tracking-wider ${theme} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label || status}
    </span>
  );
};

export default StatusBadge;
