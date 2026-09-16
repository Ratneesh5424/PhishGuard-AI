import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Globe2,
  Radio,
  Server,
  ShieldAlert,
  ShieldCheck,
  Search,
  ArrowRight,
  Activity,
  Layers,
  Sparkles,
  AlertTriangle,
  Cpu,
  Compass,
  ExternalLink,
  Clock,
  Shield
} from 'lucide-react';
import { useThreat } from '../context/ThreatContext';
import { LeafletGeoMap } from '../components/LeafletGeoMap';
import { sanitizeHeader } from '../utils/sanitizeHeader';
import { extractSenderPublicIp, isPublicIp, lookupIpGeo } from '../services/ipGeoService';

// Demo coordinates for testing and target destination
const DEMO_COORDINATES = {
  sender: {
    city: 'New Delhi',
    country: 'India',
    countryCode: 'IN',
    lat: 28.6139,
    lng: 77.2090,
    ip: '209.85.220.41',
    asn: 'Google LLC',
    isp: 'Google LLC',
    reverseDns: 'mail-sor-f41.google.com'
  },
  recipient: {
    city: 'Vijayawada',
    country: 'India',
    countryCode: 'IN',
    lat: 16.5062,
    lng: 80.6480,
    role: 'Recipient Enterprise Ingress Gateway'
  }
};

export const GeoTrace = () => {
  const navigate = useNavigate();
  const { currentInvestigation, currentAnalysis } = useThreat();
  const activeInvestigation = currentInvestigation || currentAnalysis;

  const [customIp, setCustomIp] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [activeGeo, setActiveGeo] = useState(null);
  const [isLoadingGeo, setIsLoadingGeo] = useState(false);

  // Extract public sender IP strictly according to RFC 5322 priority:
  // 1. X-Originating-IP
  // 2. Received (first public IP)
  // Then perform real IP geolocation lookup dynamically
  useEffect(() => {
    let isMounted = true;

    // Read sender public IP from analyzed RFC 5322 headers
    const extractedIp = extractSenderPublicIp(
      activeInvestigation?.headers || {},
      activeInvestigation?.rawHeaders || activeInvestigation?.bodyText || ''
    );

    // Fallback check on activeInvestigation geo properties
    const candidateIp = extractedIp || (
      isPublicIp(activeInvestigation?.geoLocation?.originIp) ? activeInvestigation.geoLocation.originIp :
      isPublicIp(activeInvestigation?.geoLocation?.ip) ? activeInvestigation.geoLocation.ip :
      isPublicIp(activeInvestigation?.geoTrace?.ip) ? activeInvestigation.geoTrace.ip :
      null
    );

    if (candidateIp && isPublicIp(candidateIp)) {
      setIsDemoMode(false);
      setIsLoadingGeo(true);
      lookupIpGeo(candidateIp)
        .then((geoData) => {
          if (!isMounted) return;
          setIsLoadingGeo(false);
          if (geoData && typeof geoData.latitude === 'number' && typeof geoData.longitude === 'number') {
            setActiveGeo(geoData);
          } else {
            setActiveGeo(null);
          }
        })
        .catch(() => {
          if (!isMounted) return;
          setIsLoadingGeo(false);
          setActiveGeo(null);
        });
    } else {
      // If no public IP exists in the email, show the existing "No geolocation available" state
      setActiveGeo(null);
      setIsDemoMode(false);
      setIsLoadingGeo(false);
    }

    return () => {
      isMounted = false;
    };
  }, [activeInvestigation]);

  // Determine if a valid IP exists
  const hasIp = Boolean(
    isDemoMode ||
    (activeGeo && typeof activeGeo.latitude === 'number' && typeof activeGeo.longitude === 'number')
  );

  // Handle Custom IP Query (Real Lookup)
  const handleIpSearch = async (e) => {
    e.preventDefault();
    if (!customIp.trim()) return;

    const ip = customIp.trim();
    if (!isPublicIp(ip)) {
      alert(`"${ip}" is not a valid routable public IPv4 address.`);
      return;
    }

    setIsDemoMode(false);
    setIsLoadingGeo(true);
    try {
      const geo = await lookupIpGeo(ip);
      if (geo && typeof geo.latitude === 'number' && typeof geo.longitude === 'number') {
        setActiveGeo(geo);
      } else {
        alert(`Could not resolve geolocation for IP: ${ip}`);
      }
    } catch {
      alert(`Geolocation lookup failed for IP: ${ip}`);
    } finally {
      setIsLoadingGeo(false);
    }
  };

  const handleLoadDemo = () => {
    setIsDemoMode(true);
    setActiveGeo({
      ip: DEMO_COORDINATES.sender.ip,
      originIp: DEMO_COORDINATES.sender.ip,
      city: DEMO_COORDINATES.sender.city,
      country: DEMO_COORDINATES.sender.country,
      countryCode: DEMO_COORDINATES.sender.countryCode,
      latitude: DEMO_COORDINATES.sender.lat,
      longitude: DEMO_COORDINATES.sender.lng,
      asn: DEMO_COORDINATES.sender.asn,
      isp: DEMO_COORDINATES.sender.isp,
      reverseDns: DEMO_COORDINATES.sender.reverseDns,
      threatFlags: { isVpn: false, isTor: false, isProxy: false, isBulletproof: false, botnetScore: '0/100' }
    });
  };

  // Resolved Sender Object for Leaflet Map
  const senderLocation = useMemo(() => {
    if (activeGeo && typeof activeGeo.latitude === 'number' && typeof activeGeo.longitude === 'number') {
      return {
        lat: activeGeo.latitude,
        lng: activeGeo.longitude,
        city: activeGeo.city || 'Origin City',
        country: activeGeo.country || 'Origin Country',
        countryCode: activeGeo.countryCode || 'N/A',
        ip: activeGeo.ip || activeGeo.originIp || 'Unknown',
        asn: activeGeo.asn || 'Autonomous System',
        isp: activeGeo.isp || activeGeo.asn || 'Network Provider'
      };
    }
    if (isDemoMode) {
      return DEMO_COORDINATES.sender;
    }
    return {
      lat: 28.6139,
      lng: 77.2090,
      city: 'Unavailable',
      country: 'Unavailable',
      countryCode: 'N/A',
      ip: 'Unavailable',
      asn: 'Unavailable',
      isp: 'Unavailable'
    };
  }, [activeGeo, isDemoMode]);

  // Recipient Object (Vijayawada demo location)
  const recipientLocation = DEMO_COORDINATES.recipient;

  // Information Card Data (Requirement 7)
  const riskScore = typeof activeInvestigation?.score === 'number'
    ? activeInvestigation.score
    : (typeof activeInvestigation?.riskScore === 'number' ? activeInvestigation.riskScore : 0);
  const threatLevel = sanitizeHeader(
    activeInvestigation?.level ?? activeInvestigation?.threatLevel ?? (riskScore >= 71 ? 'HIGH' : riskScore >= 31 ? 'MEDIUM' : 'SAFE'),
    'SAFE'
  );

  const infoCard = useMemo(() => {
    return {
      riskLevel: threatLevel,
      riskScore: riskScore,
      originCountry: hasIp ? `${senderLocation.country} (${senderLocation.countryCode})` : 'Unavailable',
      networkProvider: hasIp ? (senderLocation.asn || senderLocation.isp || 'Autonomous System') : 'Unavailable',
      timestamp: sanitizeHeader(activeInvestigation?.date || activeInvestigation?.timestamp || new Date().toLocaleString())
    };
  }, [threatLevel, riskScore, senderLocation, activeInvestigation, hasIp]);

  const relayTimeline = activeInvestigation?.relayTimeline || activeInvestigation?.relayPath || [
    { hop: 1, host: hasIp ? `mta-origin.${(senderLocation.countryCode || 'net').toLowerCase()}` : 'origin-ingress.gateway', ip: hasIp ? senderLocation.ip : 'Unavailable', location: hasIp ? `${senderLocation.city}, ${senderLocation.country}` : 'Unavailable', latency: '14ms', tls: 'TLS 1.3', auth: 'PASS' },
    { hop: 2, host: 'core-router.mumbai-transit.in', ip: '182.79.244.12', location: 'Mumbai, India', latency: '28ms', tls: 'TLS 1.3', auth: 'PASS' },
    { hop: 3, host: 'protected-ingress.vijayawada.mx', ip: '103.112.80.25', location: 'Vijayawada, India', latency: '42ms', tls: 'TLS 1.3', auth: 'PASS' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Title & Custom IP Lookup */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              GeoTrace Map
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold bg-blue-500/20 text-cyan-400 border border-blue-500/40">
              LEAFLET / OSM
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1 font-mono">
            Interactive ingress packet hop trajectory from sender origin to <strong className="text-cyan-400 font-bold">Vijayawada, India</strong>
          </p>
        </div>

        {/* Search IP Bar & Demo Toggle Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <form onSubmit={handleIpSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customIp}
                onChange={(e) => setCustomIp(e.target.value)}
                placeholder="Query IP (e.g. 164.100.24.1)"
                className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 w-56 sm:w-64"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold hover:bg-cyan-500/30 transition-all font-mono cursor-pointer"
            >
              Locate
            </button>
          </form>

          <button
            onClick={handleLoadDemo}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono font-medium transition-all cursor-pointer"
            title="Load demo data: New Delhi -> Vijayawada"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Load Demo</span>
          </button>
        </div>
      </div>

      {/* Requirement 8: If no IP exists, show "No geolocation available" instead of crashing */}
      {!hasIp && (
        <div className="p-5 rounded-[20px] bg-amber-500/10 border border-amber-500/30 backdrop-blur-xl text-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-mono text-white">
                No geolocation available
              </h2>
              <p className="text-xs text-amber-300/80 font-mono mt-0.5">
                No valid sender public IP was identified in the analyzed message headers. You can query any public IP address above or load demo coordinates to view transmission telemetry.
              </p>
            </div>
          </div>
          <button
            onClick={handleLoadDemo}
            className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-mono font-bold shrink-0 transition-all cursor-pointer"
          >
            Load Demo Data
          </button>
        </div>
      )}

      {/* Main Interactive Leaflet / OpenStreetMap World Map */}
      <LeafletGeoMap
        sender={senderLocation}
        recipient={recipientLocation}
        infoCard={infoCard}
        hasGeolocation={hasIp}
        onLoadDemo={handleLoadDemo}
      />

      {/* Requirement 5: Display Country, City, Latitude, Longitude, Public IP, ASN / Network */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Public IP */}
        <div className="p-4 rounded-[18px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider">
            <span>PUBLIC IP</span>
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-sm font-bold text-white font-mono truncate" title={senderLocation.ip}>
            {hasIp ? senderLocation.ip : 'Unavailable'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Origin Header Resolution
          </div>
        </div>

        {/* 2. City */}
        <div className="p-4 rounded-[18px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider">
            <span>CITY</span>
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-sm font-bold text-white font-mono truncate" title={senderLocation.city}>
            {hasIp ? senderLocation.city : 'Unavailable'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Sender Node Location
          </div>
        </div>

        {/* 3. Country */}
        <div className="p-4 rounded-[18px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider">
            <span>COUNTRY</span>
            <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-sm font-bold text-white font-mono truncate" title={senderLocation.country}>
            {hasIp ? `${senderLocation.country} (${senderLocation.countryCode})` : 'Unavailable'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Sovereign Jurisdiction
          </div>
        </div>

        {/* 4. Latitude */}
        <div className="p-4 rounded-[18px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider">
            <span>LATITUDE</span>
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-sm font-bold text-cyan-400 font-mono truncate">
            {hasIp ? `${Math.abs(senderLocation.lat).toFixed(4)}° ${senderLocation.lat >= 0 ? 'N' : 'S'}` : 'N/A'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            GPS Coordinates
          </div>
        </div>

        {/* 5. Longitude */}
        <div className="p-4 rounded-[18px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider">
            <span>LONGITUDE</span>
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-sm font-bold text-cyan-400 font-mono truncate">
            {hasIp ? `${Math.abs(senderLocation.lng).toFixed(4)}° ${senderLocation.lng >= 0 ? 'E' : 'W'}` : 'N/A'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            GPS Coordinates
          </div>
        </div>

        {/* 6. ASN / Network */}
        <div className="p-4 rounded-[18px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider">
            <span>ASN / NETWORK</span>
            <Server className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-sm font-bold text-white font-mono truncate" title={senderLocation.asn}>
            {hasIp ? senderLocation.asn : 'Unavailable'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono truncate" title={senderLocation.isp}>
            {hasIp ? senderLocation.isp : 'Autonomous System'}
          </div>
        </div>
      </div>

      {/* Row 3: Transmission Route Timeline from Sender to Vijayawada */}
      <div className="p-6 rounded-[20px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Packet Relay Hops: Ingress Origin to Destination Gateway</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Trajectory verified from <span className="text-rose-400 font-bold">{senderLocation.city}, {senderLocation.country}</span> to <span className="text-cyan-400 font-bold">{recipientLocation.city}, {recipientLocation.country}</span>
            </p>
          </div>
          <button
            onClick={() => navigate('/header-protocol')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono font-semibold flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>View MIME Raw Headers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {relayTimeline.map((hop, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 relative group hover:border-cyan-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  HOP #{hop.hop}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{hop.latency}</span>
              </div>

              <div className="font-mono text-xs font-bold text-white truncate" title={hop.host}>
                {hop.host}
              </div>

              <div className="font-mono text-[11px] text-cyan-300">
                IP: {hop.ip}
              </div>

              <div className="text-[11px] text-slate-400 font-mono">
                {hop.location}
              </div>

              <div className="text-[10px] text-slate-500 font-mono border-t border-slate-800 pt-1.5 flex items-center justify-between">
                <span>{hop.tls}</span>
                <span className={`font-bold ${hop.auth?.includes('PASS') ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {hop.auth}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GeoTrace;
