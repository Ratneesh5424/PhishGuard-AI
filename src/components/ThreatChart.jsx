import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { MOCK_TREND_CHART_DATA } from '../data/mockData';

export const ThreatChart = ({ className = '' }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const data = MOCK_TREND_CHART_DATA[timeRange] || MOCK_TREND_CHART_DATA['7d'];

  return (
    <div className={`p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Enterprise Threat & Fraud Vector Trends</span>
          </h2>
          <p className="text-xs text-slate-400">
            Temporal breakdown of phishing links, BEC wire coercion, and weaponized Trojans
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          {['24h', '7d', '30d'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg font-mono transition-all ${
                timeRange === t
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span className="text-slate-300">Phishing URLs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-slate-300">BEC / Wire Fraud</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-slate-300">Trojan Payloads</span>
        </div>
      </div>

      <div className="h-[280px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="chartPhish" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="chartBec" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="chartMalware" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={11} fontFamily="monospace" />
            <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '12px',
                fontSize: '12px',
                fontFamily: 'monospace'
              }}
            />
            <Area type="monotone" dataKey="phishing" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#chartPhish)" />
            <Area type="monotone" dataKey="bec" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#chartBec)" />
            <Area type="monotone" dataKey="malware" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#chartMalware)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ThreatChart;
