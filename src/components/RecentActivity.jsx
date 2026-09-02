import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Ban, FileText, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const defaultActivityData = [
  {
    id: 1,
    type: 'phishing',
    title: 'Phishing Attack Detected',
    description: 'Urgent account suspension lure targeting credentials',
    time: '4 mins ago',
    icon: ShieldAlert,
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/10 border-rose-500/30',
    badge: 'Critical Threat',
    badgeClass: 'text-rose-300 bg-rose-950/60 border-rose-500/40',
  },
  {
    id: 2,
    type: 'blocked',
    title: 'Suspicious Email Quarantined',
    description: 'Domain impersonation and unverified sender detected',
    time: '28 mins ago',
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/30',
    badge: 'Suspicious',
    badgeClass: 'text-amber-300 bg-amber-950/60 border-amber-500/40',
  },
  {
    id: 3,
    type: 'report',
    title: 'AI Threat Assessment Logged',
    description: 'Deep NLP heuristics and header verification completed',
    time: '1 hour ago',
    icon: FileText,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10 border-cyan-500/30',
    badge: 'Supabase Record',
    badgeClass: 'text-cyan-300 bg-cyan-950/60 border-cyan-500/40',
  },
  {
    id: 4,
    type: 'clean',
    title: 'Clean Verification Pass',
    description: 'Verified official domain and passed cryptographic signatures',
    time: '2 hours ago',
    icon: CheckCircle2,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/30',
    badge: 'Verified Clean',
    badgeClass: 'text-emerald-300 bg-emerald-950/60 border-emerald-500/40',
  },
];

export const RecentActivity = ({ activities, className = '' }) => {
  const displayActivities = activities && activities.length > 0 ? activities : defaultActivityData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`p-6 rounded-2xl backdrop-blur-xl bg-slate-900/60 border border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.37)] shadow-blue-950/10 ${className}`}
    >
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800/70">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h3 className="text-base font-semibold text-white tracking-wide">Recent Activity</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">Live Stream</span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-cyan-500/40 before:via-indigo-500/30 before:to-transparent">
        {displayActivities.slice(0, 5).map((item, idx) => {
          const Icon = item.icon || (item.type === 'phishing' ? ShieldAlert : item.type === 'suspicious' ? AlertTriangle : CheckCircle2);
          const iconColor = item.iconColor || (item.type === 'phishing' ? 'text-rose-400' : item.type === 'suspicious' ? 'text-amber-400' : 'text-emerald-400');
          const iconBg = item.iconBg || (item.type === 'phishing' ? 'bg-rose-500/10 border-rose-500/30' : item.type === 'suspicious' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30');

          return (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.35 }}
              className="relative group"
            >
              {/* Marker dot */}
              <div
                className={`absolute -left-6 top-1 p-1.5 rounded-full border backdrop-blur-md transition-transform duration-300 group-hover:scale-110 ${iconBg}`}
              >
                <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
              </div>

              {/* Activity content */}
              <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-800/60 group-hover:border-slate-700/80 group-hover:bg-slate-800/50 transition-all duration-200">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors truncate max-w-[190px]">
                    {item.title}
                  </h4>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border shrink-0 ${item.badgeClass || 'text-slate-300 bg-slate-900 border-slate-700'}`}>
                    {item.badge || item.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {item.description || item.subject}
                </p>
                <div className="flex items-center justify-between mt-2 text-[11px] font-mono text-slate-500">
                  <span className="truncate max-w-[140px] text-slate-400">{item.sender || 'System Engine'}</span>
                  <span>{item.time}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default RecentActivity;
