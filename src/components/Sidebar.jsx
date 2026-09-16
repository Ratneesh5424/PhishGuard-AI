import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MailSearch,
  Binary,
  MapPin,
  Globe2,
  FileCheck2,
  FolderLock,
  Settings as SettingsIcon,
  ShieldCheck,
  Zap,
  Flame,
  Radio,
  LogIn,
  X
} from 'lucide-react';
import { useThreat } from '../context/ThreatContext';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, badge: 'Live' },
  { name: 'Analyze Email', path: '/analyze', icon: MailSearch, badge: 'Scan' },
  { name: 'Header & Protocol', path: '/header-protocol', icon: Binary, badge: 'Auth' },
  { name: 'GeoTrace Map', path: '/geotrace', icon: MapPin, badge: 'Geo' },
  { name: 'Domain Intel', path: '/domain-intel', icon: Globe2, badge: 'DNS' },
  { name: 'AI Forensic Report', path: '/ai-report', icon: FileCheck2, badge: 'AI' },
  { name: 'Case Management', path: '/cases', icon: FolderLock, badge: 'SOC' },
  { name: 'Settings & Compliance', path: '/settings', icon: SettingsIcon },
  { name: 'Enterprise Login', path: '/login', icon: LogIn, isAuth: true }
];

export const Sidebar = ({ isOpen, onClose }) => {
  const { currentAnalysis, uniqueCases, cases } = useThreat();
  const casesList = uniqueCases || cases || [];
  const openCasesCount = casesList.filter(c => c.status === 'Open' || c.status === 'In Progress').length;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 border-r border-slate-800/80 bg-slate-950/90 md:bg-slate-950/70 backdrop-blur-2xl flex flex-col justify-between p-4 min-h-[calc(100vh-61px)] transition-transform duration-300 select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between md:hidden pb-2 border-b border-slate-800">
            <span className="text-xs font-mono text-cyan-400 font-bold">MENU NAVIGATION</span>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between px-3 mb-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-mono">
                Core Modules
              </p>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                SIH 2026
              </span>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => onClose && onClose()}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                          : 'text-slate-400 hover:bg-slate-900/90 hover:text-slate-200 hover:border-slate-800 border border-transparent'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                      <span>{item.name}</span>
                    </div>

                    {item.path === '/cases' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        {openCasesCount}
                      </span>
                    ) : item.badge ? (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 group-hover:text-slate-300">
                        {item.badge}
                      </span>
                    ) : null}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Active Target Threat Card */}
          {currentAnalysis && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/90 shadow-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  <span>Active Target</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  currentAnalysis.threatLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                  currentAnalysis.threatLevel === 'SAFE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                  'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}>
                  {currentAnalysis.riskScore}% RISK
                </span>
              </div>

              <div className="text-[11px] text-slate-300 font-mono truncate" title={currentAnalysis.subject}>
                {currentAnalysis.subject}
              </div>

              <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span className="text-cyan-400 truncate max-w-[120px]">{currentAnalysis.senderDomain || currentAnalysis.domainIntel?.domain}</span>
                <span className="text-slate-500 shrink-0">{currentAnalysis.geoTrace?.countryCode}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer SOC Status */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/70 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-[11px]">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>SIH 2026 Engine V4.2</span>
            </div>
            <p className="text-slate-400 text-[10px] leading-relaxed">
              Multi-vector NLP, GeoTrace IP hopping, and cryptographic header verification active.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
