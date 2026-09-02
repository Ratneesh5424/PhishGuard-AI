import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export const RiskMeter = ({
  score = 15,
  level = 'Low Risk',
  className = '',
}) => {
  // SVG gauge geometry
  const size = 200;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Normalized score
  const clampedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Determine threat theme based on score
  const isHighRisk = clampedScore >= 60;
  const isMediumRisk = clampedScore >= 30 && clampedScore < 60;

  const gradientId = `risk-gradient-${score}`;
  const strokeStart = isHighRisk ? '#f43f5e' : isMediumRisk ? '#f59e0b' : '#06b6d4';
  const strokeEnd = isHighRisk ? '#e11d48' : isMediumRisk ? '#d97706' : '#3b82f6';
  const badgeColor = isHighRisk
    ? 'text-rose-400 bg-rose-950/60 border-rose-500/40'
    : isMediumRisk
    ? 'text-amber-400 bg-amber-950/60 border-amber-500/40'
    : 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40';

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`relative p-6 rounded-2xl backdrop-blur-xl bg-slate-900/65 border border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.37)] shadow-blue-950/20 hover:border-cyan-500/30 transition-all duration-300 flex flex-col items-center justify-between ${className}`}
    >
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800/70 mb-2">
        <h3 className="text-sm font-semibold text-slate-300 tracking-wide">Threat Risk Score</h3>
        <span className="text-[11px] text-slate-400 font-mono">Live Assessment</span>
      </div>

      <div className="relative flex items-center justify-center my-3">
        {/* Ambient background glow */}
        <div
          className="absolute w-36 h-36 rounded-full blur-2xl opacity-30 pointer-events-none"
          style={{ backgroundColor: strokeStart }}
        />

        <svg width={size} height={size} className="rotate-[-90deg]">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={strokeStart} />
              <stop offset="100%" stopColor={strokeEnd} />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background track circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray="4 6"
          />

          {/* Animated active progress arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
            filter="url(#glow)"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl font-black text-white tracking-tight"
          >
            {clampedScore}%
          </motion.span>
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400 mt-0.5">
            Severity
          </span>
        </div>
      </div>

      {/* Status indicator badge */}
      <div className="w-full flex items-center justify-between pt-3 border-t border-slate-800/70 mt-2">
        <div className="flex items-center gap-2">
          {isHighRisk ? (
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          )}
          <span className="text-xs text-slate-300 font-medium">{level}</span>
        </div>
        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${badgeColor}`}>
          {isHighRisk ? 'Critical' : isMediumRisk ? 'Elevated' : 'Secure'}
        </span>
      </div>
    </motion.div>
  );
};

export default RiskMeter;
