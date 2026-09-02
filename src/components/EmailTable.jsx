import React from 'react';
import { motion } from 'framer-motion';
import { Mail, ExternalLink, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import StatusBadge from './StatusBadge';

const defaultEmails = [
  {
    id: 'em-101',
    subject: 'Urgent: Verify Your Microsoft 365 Account Immediately',
    sender: 'support@account-secure-auth.net',
    date: 'Today, 14:22',
    riskScore: 94,
    status: 'phishing',
  },
  {
    id: 'em-102',
    subject: 'Invoice INV-2026-8941 payment confirmation',
    sender: 'billing@trusted-vendor.com',
    date: 'Today, 12:05',
    riskScore: 4,
    status: 'clean',
  },
  {
    id: 'em-103',
    subject: 'Tax filing document attachment: Review required',
    sender: 'irs-online-verification@taxportal-update.org',
    date: 'Yesterday, 19:40',
    riskScore: 88,
    status: 'phishing',
  },
  {
    id: 'em-104',
    subject: 'Password reset request for GitHub Enterprise',
    sender: 'no-reply@github.com',
    date: 'Yesterday, 11:15',
    riskScore: 35,
    status: 'suspicious',
  },
  {
    id: 'em-105',
    subject: 'Weekly SIH Team Standup & Sprint Sync',
    sender: 'team-lead@hackathon2026.org',
    date: 'Aug 29, 09:30',
    riskScore: 2,
    status: 'clean',
  },
];

export const EmailTable = ({
  emails = defaultEmails,
  onSelectEmail,
  className = '',
}) => {
  const displayEmails = emails.length > 0 ? emails : defaultEmails;

  return (
    <div
      className={`overflow-hidden rounded-2xl backdrop-blur-xl bg-slate-900/65 border border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.37)] shadow-blue-950/20 ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800/80 bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-6 py-4">Subject & Details</th>
              <th className="px-6 py-4">Sender Address</th>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Risk Score</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {displayEmails.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                  No email records found.
                </td>
              </tr>
            ) : (
              displayEmails.map((email, index) => {
                const isDanger = email.riskScore >= 70;
                const isWarn = email.riskScore >= 30 && email.riskScore < 70;
                
                return (
                  <motion.tr
                    key={email.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.25 }}
                    onClick={() => onSelectEmail && onSelectEmail(email)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg border ${
                            isDanger
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                              : isWarn
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                              : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                          }`}
                        >
                          {isDanger ? (
                            <ShieldAlert className="w-4 h-4" />
                          ) : isWarn ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <ShieldCheck className="w-4 h-4" />
                          )}
                        </div>
                        <div className="font-medium text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                          {email.subject}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {email.sender}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-mono whitespace-nowrap">
                      {email.date}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold font-mono text-sm ${
                            isDanger
                              ? 'text-rose-400'
                              : isWarn
                              ? 'text-amber-400'
                              : 'text-cyan-400'
                          }`}
                        >
                          {email.riskScore}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={email.status} />
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group/btn"
                      >
                        Inspect
                        <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmailTable;
