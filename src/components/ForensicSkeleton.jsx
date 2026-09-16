import React from 'react';
import { Sparkles, ArrowRight, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ForensicSkeleton = ({
  title = "No investigation loaded. Analyze an email first.",
  subtitle = "Run an email scan or select a scenario in Analyze Email to view real-time cryptographic and domain intelligence.",
  showCards = 4
}) => {

  return (
    <div className="space-y-6 pb-12 animate-pulse">
      {/* Top Banner */}
      <div className="p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-mono font-bold text-cyan-400 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
              STANDBY FOR TELEMETRY
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
          <p className="text-sm text-slate-400 max-w-2xl">{subtitle}</p>
        </div>

        <Link
          to="/analyze"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all shrink-0"
        >
          <Shield className="w-4 h-4" />
          <span>Analyze Email Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid of Skeleton Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: showCards }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-[20px] bg-slate-900/60 border border-slate-800/80 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-slate-800 rounded-md" />
              <div className="w-8 h-8 rounded-xl bg-slate-800/80" />
            </div>
            <div className="h-7 w-32 bg-slate-800/90 rounded-md" />
            <div className="h-3 w-40 bg-slate-800/50 rounded-md" />
          </div>
        ))}
      </div>

      {/* Large Content Skeleton Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div className="h-6 w-48 bg-slate-800 rounded-md" />
          <div className="space-y-3">
            <div className="h-12 w-full bg-slate-800/60 rounded-xl" />
            <div className="h-12 w-full bg-slate-800/40 rounded-xl" />
            <div className="h-12 w-full bg-slate-800/30 rounded-xl" />
            <div className="h-12 w-full bg-slate-800/20 rounded-xl" />
          </div>
        </div>

        <div className="p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 space-y-4 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-44 h-44 rounded-full border-4 border-slate-800 border-t-cyan-500/50 animate-spin" />
          <div className="h-4 w-28 bg-slate-800 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default ForensicSkeleton;
