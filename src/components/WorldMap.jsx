import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Radio, Globe, Navigation, Server, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';

// Simplified high-precision SVG land paths representing world continents
const CONTINENT_PATHS = [
  // North America
  "M 150 120 C 130 90, 80 100, 60 140 C 40 180, 50 240, 90 270 C 120 290, 140 330, 160 380 L 190 350 L 170 280 L 210 240 L 250 260 L 290 200 L 260 140 Z",
  // South America
  "M 210 390 C 230 420, 270 470, 280 520 C 290 570, 260 660, 240 700 C 220 740, 200 710, 190 640 C 180 570, 170 480, 190 420 Z",
  // Europe
  "M 450 140 C 470 120, 520 110, 560 140 C 580 160, 570 210, 530 240 C 490 270, 460 250, 440 220 C 420 190, 430 160, 450 140 Z",
  // Africa
  "M 470 280 C 520 270, 580 300, 600 370 C 620 440, 610 540, 580 610 C 550 670, 510 680, 480 630 C 450 560, 440 450, 440 370 C 440 310, 450 290, 470 280 Z",
  // Asia & Eurasia
  "M 570 120 C 640 90, 750 80, 840 110 C 910 140, 940 210, 920 290 C 890 350, 820 380, 760 380 C 720 380, 680 430, 640 400 C 600 370, 580 310, 570 240 Z",
  // Australia & Oceania
  "M 820 540 C 860 520, 920 540, 940 590 C 950 640, 910 700, 850 710 C 800 710, 780 650, 790 600 C 800 560, 810 550, 820 540 Z"
];

// Helper to convert lat/lng to SVG 1000x800 coordinate plane
function projectCoordinates(lat, lng) {
  const x = (lng + 180) * (1000 / 360);
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  let y = 400 - (mercN * 400) / Math.PI;
  y = Math.max(80, Math.min(720, y));
  return { x, y };
}

export const WorldMap = ({ geoTrace, relayTimeline = [], interactive = true, className = "" }) => {
  const [hoveredNode, setHoveredNode] = useState(null);

  const hasOriginGeo = typeof geoTrace?.latitude === 'number' && typeof geoTrace?.longitude === 'number' && geoTrace?.country !== 'Origin unavailable from supplied headers';
  const originLat = hasOriginGeo ? geoTrace.latitude : 28.6139;
  const originLng = hasOriginGeo ? geoTrace.longitude : 77.2090;
  const originPos = projectCoordinates(originLat, originLng);

  // Target destination (New Delhi SOC Ingress: Lat 28.6139, Lng 77.2090)
  const destPos = projectCoordinates(28.6139, 77.2090);

  // Calculate curve control point
  const midX = (originPos.x + destPos.x) / 2;
  const midY = Math.min(originPos.y, destPos.y) - 80;
  const flightPathD = hasOriginGeo
    ? `M ${originPos.x} ${originPos.y} Q ${midX} ${midY} ${destPos.x} ${destPos.y}`
    : '';

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80 shadow-2xl ${className}`}>
      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Map Header Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-lg">
        <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span>GEOTRACE THREAT TELEMETRY MATRIX</span>
      </div>

      {/* Live Origin Badge */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-xs text-slate-300">
        <div className={`w-2.5 h-2.5 rounded-full ${geoTrace?.threatFlags?.isTor || geoTrace?.threatFlags?.isVpn ? 'bg-rose-500 animate-ping' : hasOriginGeo ? 'bg-emerald-400' : 'bg-slate-500'}`} />
        <span className="font-mono text-[11px]">
          {hasOriginGeo
            ? `Origin: ${geoTrace?.city || 'Origin'}, ${geoTrace?.countryCode || ''} (${geoTrace?.originIp || ''})`
            : `Origin: Origin could not be determined`}
        </span>
      </div>

      {/* SVG Canvas */}
      <svg
        viewBox="0 0 1000 750"
        className="w-full h-auto max-h-[560px] select-none"
        style={{ filter: 'drop-shadow(0 0 15px rgba(6, 182, 212, 0.05))' }}
      >
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* World Map Continents */}
        <g fill="#1e293b" stroke="#334155" strokeWidth="1.2" opacity="0.65">
          {CONTINENT_PATHS.map((path, idx) => (
            <path
              key={idx}
              d={path}
              className="transition-colors duration-300 hover:fill-slate-700/80"
            />
          ))}
        </g>

        {/* Global Reference Lat/Long Rings */}
        <circle cx="500" cy="375" r="320" fill="none" stroke="#1e293b" strokeDasharray="4 6" strokeWidth="1" opacity="0.4" />
        <line x1="0" y1="375" x2="1000" y2="375" stroke="#1e293b" strokeDasharray="3 5" strokeWidth="0.8" opacity="0.5" />
        <line x1="500" y1="0" x2="500" y2="750" stroke="#1e293b" strokeDasharray="3 5" strokeWidth="0.8" opacity="0.5" />

        {/* Animated Flight Path Arcs */}
        <path
          d={flightPathD}
          fill="none"
          stroke="url(#routeGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="8 6"
          filter="url(#glow)"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="200"
            to="0"
            dur="4s"
            repeatCount="indefinite"
          />
        </path>

        {/* Origin Threat Node */}
        <g transform={`translate(${originPos.x}, ${originPos.y})`} className="cursor-pointer" onMouseEnter={() => setHoveredNode('origin')} onMouseLeave={() => setHoveredNode(null)}>
          {/* Pulsing Radar Ring */}
          <circle r="22" fill="none" stroke="#f43f5e" strokeWidth="2" opacity="0.7">
            <animate attributeName="r" from="8" to="34" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.9" to="0" dur="2s" repeatCount="indefinite" />
          </circle>
          
          <circle r="12" fill="#881337" stroke="#f43f5e" strokeWidth="2.5" />
          <circle r="5" fill="#ffffff" />

          {/* Node Label */}
          <text
            x="18"
            y="5"
            fill="#fda4af"
            fontSize="12"
            fontWeight="bold"
            fontFamily="monospace"
            className="select-none pointer-events-none drop-shadow"
          >
            ORIGIN IP: {geoTrace?.originIp || '185.220.101.45'}
          </text>
        </g>

        {/* Destination Ingress Node (New Delhi SOC) */}
        <g transform={`translate(${destPos.x}, ${destPos.y})`} className="cursor-pointer" onMouseEnter={() => setHoveredNode('dest')} onMouseLeave={() => setHoveredNode(null)}>
          <circle r="18" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.6">
            <animate attributeName="r" from="6" to="28" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.8" to="0" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle r="10" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
          <circle r="4" fill="#6ee7b7" />
          <text
            x="16"
            y="5"
            fill="#a7f3d0"
            fontSize="12"
            fontWeight="bold"
            fontFamily="monospace"
            className="select-none pointer-events-none drop-shadow"
          >
            INGRESS MX: NEW DELHI (SOC)
          </text>
        </g>

        {/* Intermediate Relay Nodes if provided */}
        {relayTimeline.map((relay, idx) => {
          // Compute pseudo intermediate coordinates
          const fraction = (idx + 1) / (relayTimeline.length + 1);
          const rX = originPos.x + (destPos.x - originPos.x) * fraction;
          const rY = originPos.y + (destPos.y - originPos.y) * fraction - Math.sin(fraction * Math.PI) * 60;

          return (
            <g key={idx} transform={`translate(${rX}, ${rY})`} className="cursor-pointer">
              <circle r="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
              <text
                x="10"
                y="-6"
                fill="#7dd3fc"
                fontSize="10"
                fontFamily="monospace"
                className="select-none pointer-events-none"
              >
                Hop {idx + 1}: {relay.location?.split(',')[0]}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Footer Threat Intel Strip */}
      <div className="p-4 bg-slate-950/90 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
        <div>
          <span className="text-slate-500 block">ISP & ASN</span>
          <span className="text-slate-200 font-semibold truncate block">{geoTrace?.isp || 'Origin unavailable from supplied headers'}</span>
        </div>
        <div>
          <span className="text-slate-500 block">TOR / VPN EXIT</span>
          <span className={`font-semibold ${geoTrace?.threatFlags?.isTor ? 'text-rose-400' : 'text-emerald-400'}`}>
            {geoTrace?.threatFlags?.isTor ? 'CONFIRMED TOR EXIT NODE' : 'CLEAR INFRASTRUCTURE'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">COORDINATES</span>
          <span className="text-cyan-400 font-semibold">
            {hasOriginGeo ? `${originLat.toFixed(4)}° N, ${originLng.toFixed(4)}° E` : 'Origin unavailable from supplied headers'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">BOTNET CLUSTER</span>
          <span className="text-amber-400 font-semibold">{geoTrace?.threatFlags?.botnetScore || '0/100'}</span>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
