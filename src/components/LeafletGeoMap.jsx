import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Radio,
  Server,
  Clock,
  Globe2,
  AlertTriangle,
  Compass,
  ArrowRight
} from 'lucide-react';

export const LeafletGeoMap = ({
  sender,
  recipient = { lat: 16.5062, lng: 80.6480, city: 'Vijayawada', country: 'India' },
  infoCard,
  hasGeolocation = true,
  onLoadDemo,
  className = ''
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const senderLat = typeof sender?.lat === 'number' ? sender.lat : 28.6139;
  const senderLng = typeof sender?.lng === 'number' ? sender.lng : 77.2090;
  const recipientLat = typeof recipient?.lat === 'number' ? recipient.lat : 16.5062;
  const recipientLng = typeof recipient?.lng === 'number' ? recipient.lng : 80.6480;

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!hasGeolocation) return;

    // Clean up any existing map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      // Initialize Leaflet Map
      const map = L.map(mapContainerRef.current, {
        center: [(senderLat + recipientLat) / 2, (senderLng + recipientLng) / 2],
        zoom: 5,
        zoomControl: false,
        attributionControl: false
      });

      mapInstanceRef.current = map;

      // Dark Matter CartoDB / OpenStreetMap Tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Custom Zoom Control
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomleft', prefix: false })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" style="color: #64748b;">OpenStreetMap</a> &copy; <a href="https://carto.com/" target="_blank" rel="noreferrer" style="color: #64748b;">CARTO</a>')
        .addTo(map);

      // Custom Red Marker for Detected Sender Location
      const redMarkerHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; transform: translate(-50%, -50%);">
          <div style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background: rgba(244, 63, 94, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 20px; height: 20px; border-radius: 9999px; background: #e11d48; border: 2.5px solid #ffffff; box-shadow: 0 0 16px rgba(244,63,94,0.9); display: flex; align-items: center; justify-content: center;">
            <div style="width: 6px; height: 6px; border-radius: 9999px; background: #ffffff;"></div>
          </div>
        </div>
      `;

      const redIcon = L.divIcon({
        html: redMarkerHtml,
        className: 'custom-sender-leaflet-marker',
        iconSize: [32, 32],
        iconAnchor: [0, 0]
      });

      // Custom Cyan Marker for Recipient Demo Location (Vijayawada)
      const cyanMarkerHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; transform: translate(-50%, -50%);">
          <div style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background: rgba(6, 182, 212, 0.4); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 20px; height: 20px; border-radius: 9999px; background: #0891b2; border: 2.5px solid #ffffff; box-shadow: 0 0 16px rgba(6,182,212,0.9); display: flex; align-items: center; justify-content: center;">
            <div style="width: 6px; height: 6px; border-radius: 9999px; background: #ffffff;"></div>
          </div>
        </div>
      `;

      const cyanIcon = L.divIcon({
        html: cyanMarkerHtml,
        className: 'custom-recipient-leaflet-marker',
        iconSize: [32, 32],
        iconAnchor: [0, 0]
      });

      // Add Red Sender Marker with Popup
      const senderPopupContent = `
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; padding: 4px; line-height: 1.5;">
          <div style="color: #f43f5e; font-weight: 800; font-size: 12px; margin-bottom: 4px; border-bottom: 1px solid rgba(244,63,94,0.3); padding-bottom: 2px;">
            DETECTED SENDER ORIGIN
          </div>
          <div><strong style="color: #38bdf8;">IP:</strong> ${sender?.ip || 'Origin IP'}</div>
          <div><strong style="color: #94a3b8;">City:</strong> ${sender?.city || 'Origin City'}</div>
          <div><strong style="color: #94a3b8;">Country:</strong> ${sender?.country || 'Origin Country'}</div>
          <div><strong style="color: #94a3b8;">Coords:</strong> ${senderLat.toFixed(4)}, ${senderLng.toFixed(4)}</div>
          <div><strong style="color: #94a3b8;">Network:</strong> ${sender?.asn || sender?.isp || 'Network Provider'}</div>
        </div>
      `;

      const senderMarker = L.marker([senderLat, senderLng], { icon: redIcon }).addTo(map);
      senderMarker.bindPopup(senderPopupContent, { className: 'leaflet-dark-popup' });

      // Add Cyan Recipient Marker with Popup (Vijayawada)
      const recipientPopupContent = `
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; padding: 4px; line-height: 1.5;">
          <div style="color: #38bdf8; font-weight: 800; font-size: 12px; margin-bottom: 4px; border-bottom: 1px solid rgba(56,189,248,0.3); padding-bottom: 2px;">
            RECIPIENT DEMO LOCATION
          </div>
          <div><strong style="color: #38bdf8;">Destination:</strong> Vijayawada, India</div>
          <div><strong style="color: #94a3b8;">Coords:</strong> ${recipientLat.toFixed(4)}, ${recipientLng.toFixed(4)}</div>
          <div><strong style="color: #94a3b8;">Role:</strong> Ingress Enterprise Mailbox</div>
        </div>
      `;

      const recipientMarker = L.marker([recipientLat, recipientLng], { icon: cyanIcon }).addTo(map);
      recipientMarker.bindPopup(recipientPopupContent, { className: 'leaflet-dark-popup' });

      // Draw Glowing Polyline from Sender to Vijayawada
      // 1. Outer cyan glow line
      L.polyline([[senderLat, senderLng], [recipientLat, recipientLng]], {
        color: '#06b6d4',
        weight: 6,
        opacity: 0.4,
        lineCap: 'round'
      }).addTo(map);

      // 2. Inner animated dash line
      L.polyline([[senderLat, senderLng], [recipientLat, recipientLng]], {
        color: '#38bdf8',
        weight: 2.5,
        dashArray: '8, 8',
        opacity: 0.95,
        className: 'leaflet-glowing-trajectory'
      }).addTo(map);

      // Fit bounds to comfortably display both markers
      const bounds = L.latLngBounds([[senderLat, senderLng], [recipientLat, recipientLng]]);
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 7 });

    } catch (err) {
      console.warn('Leaflet map initialization warning:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [senderLat, senderLng, recipientLat, recipientLng, hasGeolocation, sender]);

  return (
    <div className={`relative w-full rounded-[20px] overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl ${className}`}>
      {/* Cyber Grid Background */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none z-10"
        style={{
          backgroundImage: 'linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #06b6d4 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Map Header Overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-lg">
        <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span className="font-bold tracking-wider uppercase">GEOTRACE MAP (LEAFLET / OSM)</span>
      </div>

      {/* Recipient Target Anchor Overlay */}
      <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-xs font-mono text-slate-300 shadow-lg">
        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-[11px]">
          Target: <strong className="text-white">Vijayawada, India (16.5062° N, 80.6480° E)</strong>
        </span>
      </div>

      {/* Leaflet Map DOM Canvas */}
      {hasGeolocation ? (
        <div
          ref={mapContainerRef}
          className="w-full h-[520px] z-0"
          style={{ background: '#020617' }}
        />
      ) : (
        <div className="w-full h-[420px] flex flex-col items-center justify-center p-6 text-center space-y-4 z-20 relative bg-slate-950/90">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-base font-bold text-white font-mono">
              No geolocation available
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              No public routing IP address could be resolved from the inspected email headers. You can query any IP in the search bar above or load demo coordinates.
            </p>
          </div>
          {onLoadDemo && (
            <button
              onClick={onLoadDemo}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Load Demo Telemetry (New Delhi → Vijayawada)</span>
            </button>
          )}
        </div>
      )}

      {/* Floating Info Card (Requirement 7) */}
      {hasGeolocation && infoCard && (
        <div className="absolute bottom-4 left-4 z-20 p-3.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 shadow-2xl font-mono text-xs max-w-xs sm:max-w-sm space-y-2">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              TRANSMISSION TELEMETRY
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              infoCard.riskLevel === 'CRITICAL' || infoCard.riskScore >= 80 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
              infoCard.riskLevel === 'HIGH' || infoCard.riskScore >= 60 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
              infoCard.riskLevel === 'MEDIUM' || infoCard.riskScore >= 40 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
              infoCard.riskLevel === 'LOW' || infoCard.riskScore >= 20 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' :
              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}>
              {infoCard.riskLevel || 'ANALYZED'} {typeof infoCard.riskScore === 'number' ? `(${infoCard.riskScore}/100)` : ''}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px]">ORIGIN COUNTRY</span>
              <span className="text-slate-200 font-semibold truncate block">
                {infoCard.originCountry || 'India (IN)'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">TIMESTAMP</span>
              <span className="text-cyan-300 font-semibold truncate block">
                {infoCard.timestamp || '2026-09-16 11:20'}
              </span>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-800/80">
            <span className="text-slate-500 block text-[10px]">NETWORK PROVIDER</span>
            <span className="text-white font-medium text-[11px] truncate block" title={infoCard.networkProvider}>
              {infoCard.networkProvider || 'Google LLC'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeafletGeoMap;
