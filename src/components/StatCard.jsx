import React from 'react';

export const StatCard = ({
  title,
  value,
  subtext,
  badge,
  icon: Icon,
  variant = 'blue', // 'blue' | 'rose' | 'amber' | 'emerald'
  className = ''
}) => {
  const variantStyles = {
    blue: {
      border: 'border-slate-800/80 hover:border-slate-700',
      iconBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      valueColor: 'text-white'
    },
    rose: {
      border: 'border-rose-500/30 hover:border-rose-500/50',
      iconBg: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
      valueColor: 'text-rose-400'
    },
    amber: {
      border: 'border-amber-500/30 hover:border-amber-500/50',
      iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
      valueColor: 'text-amber-400'
    },
    emerald: {
      border: 'border-emerald-500/30 hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      valueColor: 'text-emerald-400'
    }
  }[variant] || variantStyles.blue;

  return (
    <div className={`p-5 rounded-[20px] bg-slate-900/60 backdrop-blur-xl shadow-lg transition-all ${variantStyles.border} ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl ${variantStyles.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className={`text-3xl font-extrabold font-mono tracking-tight ${variantStyles.valueColor}`}>
          {value}
        </span>
        {badge && (
          <span className="text-xs font-semibold font-mono">
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <p className="text-[11px] text-slate-400 mt-1 font-mono truncate">
          {subtext}
        </p>
      )}
    </div>
  );
};

export default StatCard;
