import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, ShieldAlert, ShieldCheck } from 'lucide-react';

const defaultTrendData = [
  { day: 'Mon', scanned: 14, phishing: 3, blocked: 2 },
  { day: 'Tue', scanned: 19, phishing: 5, blocked: 4 },
  { day: 'Wed', scanned: 23, phishing: 4, blocked: 3 },
  { day: 'Thu', scanned: 18, phishing: 6, blocked: 5 },
  { day: 'Fri', scanned: 26, phishing: 8, blocked: 7 },
  { day: 'Sat', scanned: 12, phishing: 2, blocked: 1 },
  { day: 'Sun', scanned: 15, phishing: 3, blocked: 2 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl backdrop-blur-md bg-slate-950/90 border border-slate-800 shadow-xl text-xs space-y-1.5">
        <p className="font-semibold text-slate-200 border-b border-slate-800 pb-1 font-mono">
          {label} Overview
        </p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}:
            </span>
            <span className="font-bold text-white font-mono">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const ThreatTrendChart = ({
  data = defaultTrendData,
  totalScanned,
  totalThreats,
  className = '',
}) => {
  const chartData = data && data.length > 0 ? data : defaultTrendData;

  const computedScanned =
    typeof totalScanned === 'number'
      ? totalScanned
      : chartData.reduce((acc, curr) => acc + (curr.scanned || 0), 0);

  const computedThreats =
    typeof totalThreats === 'number'
      ? totalThreats
      : chartData.reduce((acc, curr) => acc + (curr.phishing || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className={`p-6 rounded-2xl backdrop-blur-xl bg-slate-900/65 border border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.37)] shadow-blue-950/20 hover:border-cyan-500/30 transition-all duration-300 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/70">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-semibold text-white tracking-wide">
              7-Day Threat Trend Analysis
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking email inspection volume vs detected phishing & quarantined links
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">
            <ShieldCheck className="w-3.5 h-3.5" /> {computedScanned} Scanned
          </span>
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300">
            <ShieldAlert className="w-3.5 h-3.5" /> {computedThreats} Threats
          </span>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scannedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="phishingGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="blockedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

            <XAxis
              dataKey="day"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              allowDecimals={false}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
            />

            <Area
              type="monotone"
              dataKey="scanned"
              name="Emails Scanned"
              stroke="#06b6d4"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#scannedGrad)"
            />
            <Area
              type="monotone"
              dataKey="phishing"
              name="Phishing Detected"
              stroke="#f43f5e"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#phishingGrad)"
            />
            <Area
              type="monotone"
              dataKey="blocked"
              name="Blocked URLs"
              stroke="#f59e0b"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#blockedGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default ThreatTrendChart;
