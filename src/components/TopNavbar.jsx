import React, { useState } from 'react';
import { Shield, Sparkles, Bell, Search, ChevronDown, Radio, Menu, X } from 'lucide-react';
import { useThreat } from '../context/ThreatContext';
import { useNavigate } from 'react-router-dom';

export const TopNavbar = ({ onToggleSidebar }) => {
  const { currentAnalysis, presets, loadPreset, activeUser } = useThreat();
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const navigate = useNavigate();

  const handleSelectPreset = (presetId) => {
    loadPreset(presetId);
    setShowPresetsMenu(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-lg shadow-black/20">
      {/* Brand Identity & Mobile Menu Toggle */}
      <div className="flex items-center gap-3 sm:gap-6">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-blue-600/30 to-cyan-400/20 border border-cyan-500/40 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:scale-105 transition-transform duration-200">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                PhishGuard
              </span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-mono uppercase tracking-wider shadow-sm">
                AI SOC
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-wide -mt-0.5 hidden sm:block">
              SIH 2026 Cyber Threat Platform
            </p>
          </div>
        </div>

        {/* Quick Threat Sample Selector */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setShowPresetsMenu(!showPresetsMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-all shadow-inner"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Target:</span>
            <span className="font-semibold text-cyan-300 max-w-[180px] truncate">
              {currentAnalysis?.senderDomain || currentAnalysis?.domainIntel?.domain || currentAnalysis?.subject?.slice(0, 24) || 'Live Target'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showPresetsMenu && (
            <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-mono uppercase text-slate-400 font-semibold border-b border-slate-800 mb-1">
                Load Realistic SIH 2026 Test Scenarios
              </div>
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {presets.map((p) => {
                  const isSelected = currentAnalysis?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPreset(p.id)}
                      className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <div className="font-semibold truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Risk: {p.riskScore}% • {p.threatLevel}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        p.threatLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : p.threatLevel === 'SAFE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {p.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* System Online Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] text-slate-300">CERT-In Engine: Online</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700 shadow-2xl p-3 z-50">
              <div className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                <span>Threat Alerts (3)</span>
                <span className="text-[10px] font-mono text-cyan-400">Live</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
                  <div className="font-semibold text-rose-200">Critical BEC Outbreak</div>
                  <div className="text-[10px] text-slate-400">Domain microsoft-exec-portal.cc detected in 4 corporate inboxes.</div>
                </div>
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  <div className="font-semibold text-amber-200">Gov.in Impersonation Spurt</div>
                  <div className="text-[10px] text-slate-400">Host 45.134.144.18 flagged by CERT-In feed.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-xs text-white shadow-md">
            {activeUser.avatar}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              {activeUser.name}
            </div>
            <div className="text-[10px] text-cyan-400 font-mono">
              {activeUser.badge}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
