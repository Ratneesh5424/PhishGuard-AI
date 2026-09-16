import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

export const RiskGauge = ({ score = 96, confidence = 99.4, threatLevel = 'CRITICAL', size = 220, className = '' }) => {
  const normalizedScore = Math.min(100, Math.max(0, score));
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  const isSafe = normalizedScore <= 20;
  const isLow = normalizedScore > 20 && normalizedScore <= 40;
  const isMedium = normalizedScore > 40 && normalizedScore <= 60;
  const isHigh = normalizedScore > 60 && normalizedScore <= 80;
  const isCritical = normalizedScore > 80;

  const colorConfig = isCritical
    ? {
        stroke: '#f43f5e',
        glow: 'rgba(244, 63, 94, 0.4)',
        bgGlow: 'from-rose-500/10 to-red-500/5',
        badgeBg: 'bg-rose-500/15 text-rose-400 border-rose-500/40',
        text: 'text-rose-400',
        icon: ShieldAlert,
        level: 'CRITICAL'
      }
    : isHigh
    ? {
        stroke: '#f97316',
        glow: 'rgba(249, 115, 22, 0.4)',
        bgGlow: 'from-orange-500/10 to-amber-500/5',
        badgeBg: 'bg-orange-500/15 text-orange-400 border-orange-500/40',
        text: 'text-orange-400',
        icon: AlertTriangle,
        level: 'HIGH'
      }
    : isMedium
    ? {
        stroke: '#f59e0b',
        glow: 'rgba(245, 158, 11, 0.4)',
        bgGlow: 'from-amber-500/10 to-yellow-500/5',
        badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
        text: 'text-amber-400',
        icon: AlertTriangle,
        level: 'MEDIUM'
      }
    : isLow
    ? {
        stroke: '#06b6d4',
        glow: 'rgba(6, 182, 212, 0.4)',
        bgGlow: 'from-cyan-500/10 to-blue-500/5',
        badgeBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40',
        text: 'text-cyan-400',
        icon: AlertTriangle,
        level: 'LOW'
      }
    : {
        stroke: '#10b981',
        glow: 'rgba(16, 185, 129, 0.4)',
        bgGlow: 'from-emerald-500/10 to-teal-500/5',
        badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
        text: 'text-emerald-400',
        icon: ShieldCheck,
        level: 'SAFE'
      };

  const Icon = colorConfig.icon;

  return (
    <div className={`relative flex flex-col items-center justify-center p-6 rounded-[20px] bg-gradient-to-b ${colorConfig.bgGlow} border border-slate-800/80 backdrop-blur-xl shadow-xl ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <div
          className="absolute inset-4 rounded-full blur-2xl opacity-40 transition-all duration-700"
          style={{ backgroundColor: colorConfig.glow }}
        />

        <svg width={size} height={size} className="rotate-[-90deg] select-none">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={colorConfig.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${colorConfig.glow})` }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <Icon className={`w-8 h-8 mb-1 ${colorConfig.text}`} />
          <div className="flex items-baseline">
            <span className="text-4xl font-extrabold tracking-tight text-white font-mono">
              {normalizedScore}
            </span>
            <span className="text-lg font-bold text-slate-400 font-mono">/100</span>
          </div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 font-mono mt-0.5">
            RISK INDEX
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <div className={`px-3.5 py-1 rounded-full border text-xs font-bold font-mono tracking-wide ${colorConfig.badgeBg}`}>
          {colorConfig.level}
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          AI Confidence: <span className="text-cyan-400 font-semibold">{confidence}%</span>
        </div>
      </div>
    </div>
  );
};

export default RiskGauge;
