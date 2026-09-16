import React from 'react';
import WorldMap from './WorldMap';

export const WorldMapCard = ({
  geoTrace,
  relayTimeline = [],
  title = 'Global Threat GeoTrace Map',
  subtitle = 'Live geographic origin, relay trajectory, and TOR/VPN exit node detection',
  onExplore,
  className = ''
}) => {
  return (
    <div className={`p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>{title}</span>
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        {onExplore && (
          <button
            onClick={onExplore}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono font-semibold"
          >
            Open Full Console →
          </button>
        )}
      </div>

      <WorldMap geoTrace={geoTrace} relayTimeline={relayTimeline} />
    </div>
  );
};

export default WorldMapCard;
