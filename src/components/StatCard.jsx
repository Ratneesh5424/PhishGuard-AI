import React from 'react';
import { motion } from 'framer-motion';

export const StatCard = ({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
  className = '',
  accentColor = 'cyan',
}) => {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden p-5 rounded-2xl backdrop-blur-xl bg-slate-900/65 border border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.35)] shadow-blue-950/20 hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.18)] transition-all duration-300 group ${className}`}
    >
      {/* Background soft ambient gradient glow */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all duration-500 pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-cyan-400 group-hover:text-cyan-300 group-hover:border-cyan-500/40 group-hover:scale-105 transition-all duration-300 shadow-inner">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 relative z-10">
        <div className="text-3xl font-extrabold text-white tracking-tight">
          {value}
        </div>
        {change && (
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md ${
                isPositive
                  ? 'text-emerald-300 bg-emerald-950/50 border border-emerald-500/30'
                  : 'text-rose-300 bg-rose-950/50 border border-rose-500/30'
              }`}
            >
              {change}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
