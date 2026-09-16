import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import { sanitizeHeader } from '../utils/sanitizeHeader';

export const HeaderStatusCard = ({
  protocol = 'SPF',
  status = 'PASS',
  record = '',
  evaluatedIp = '',
  reason = '',
  className = ''
}) => {
  const cleanProtocol = sanitizeHeader(protocol, 'SPF');
  const cleanStatus = sanitizeHeader(status, 'PASS').toUpperCase();
  const cleanRecord = sanitizeHeader(record, '');
  const cleanEvaluatedIp = sanitizeHeader(evaluatedIp, '');
  const cleanReason = sanitizeHeader(reason, '');

  const isPass = cleanStatus === 'PASS';
  const isSoftFail = cleanStatus === 'SOFTFAIL';

  const badgeConfig = isPass
    ? {
        border: 'border-slate-800/80',
        badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        icon: ShieldCheck,
        label: 'PASS (VALIDATED)'
      }
    : isSoftFail
    ? {
        border: 'border-amber-500/30',
        badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
        icon: AlertTriangle,
        label: 'SOFTFAIL (~ALL)'
      }
    : {
        border: 'border-rose-500/30',
        badge: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
        icon: ShieldAlert,
        label: 'FAIL / SPOOF DETECTED'
      };

  const Icon = badgeConfig.icon;

  return (
    <div className={`p-5 rounded-[20px] bg-slate-900/60 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-3 ${badgeConfig.border} ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold font-mono text-slate-400">{cleanProtocol}</span>
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border flex items-center gap-1.5 ${badgeConfig.badge}`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{badgeConfig.label}</span>
        </span>
      </div>

      <div className="space-y-1.5 text-xs font-mono">
        {cleanEvaluatedIp && (
          <div className="text-slate-400">
            Evaluated IP: <strong className="text-cyan-300">{cleanEvaluatedIp}</strong>
          </div>
        )}
        {cleanRecord && (
          <div className="text-slate-400 truncate" title={cleanRecord}>
            Policy: <span className="text-slate-200">{cleanRecord}</span>
          </div>
        )}
        {cleanReason && (
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            {cleanReason}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderStatusCard;
