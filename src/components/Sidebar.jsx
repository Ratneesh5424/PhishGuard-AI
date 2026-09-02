import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MailSearch,
  FileCheck2,
  History,
  Settings,
  ShieldCheck,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Analyze Email', path: '/analyze', icon: MailSearch },
  { name: 'Result', path: '/result', icon: FileCheck2 },
  { name: 'History', path: '/history', icon: History },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-xl flex flex-col justify-between p-4 min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-mono mb-2">
            Navigation Menu
          </p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 hover:border-slate-800 border border-transparent'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Protection status widget */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>AI Shield: Enabled</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            SIH 2026 phishing models active with heuristic spam classification.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
