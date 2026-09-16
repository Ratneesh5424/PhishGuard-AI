/**
 * Real IP Geolocation and RFC 5322 Originating IP Extraction Service
 * PhishGuard AI Forensics
 */

// Memory cache for IP Geolocation results
const geoCache = new Map();

/**
 * Checks if an IPv4 address is a legitimate, routable public IP
 * Rejects private, loopback, link-local, carrier-grade NAT, and multicast/reserved ranges.
 */
export function isPublicIp(ip) {
  if (!ip || typeof ip !== 'string') return false;
  const clean = ip.trim().replace(/^\[|\]$/g, '');
  const match = clean.match(/^([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/);
  if (!match) return false;

  const o1 = parseInt(match[1], 10);
  const o2 = parseInt(match[2], 10);
  const o3 = parseInt(match[3], 10);
  const o4 = parseInt(match[4], 10);
  if (o1 > 255 || o2 > 255 || o3 > 255 || o4 > 255) return false;

  // 0.0.0.0/8 (Current network)
  if (o1 === 0) return false;
  // 10.0.0.0/8 (Private)
  if (o1 === 10) return false;
  // 100.64.0.0/10 (Carrier-Grade NAT: 100.64.0.0 - 100.127.255.255)
  if (o1 === 100 && (o2 >= 64 && o2 <= 127)) return false;
  // 127.0.0.0/8 (Loopback)
  if (o1 === 127) return false;
  // 169.254.0.0/16 (Link-Local)
  if (o1 === 169 && o2 === 254) return false;
  // 172.16.0.0/12 (Private: 172.16.0.0 - 172.31.255.255)
  if (o1 === 172 && (o2 >= 16 && o2 <= 31)) return false;
  // 192.168.0.0/16 (Private)
  if (o1 === 192 && o2 === 168) return false;
  // 192.0.2.0/24 (TEST-NET-1)
  if (o1 === 192 && o2 === 0 && o3 === 2) return false;
  // 198.51.100.0/24 (TEST-NET-2)
  if (o1 === 198 && o2 === 51 && o3 === 100) return false;
  // 203.0.113.0/24 (TEST-NET-3)
  if (o1 === 203 && o2 === 0 && o3 === 113) return false;
  // 224.0.0.0/4 (Multicast 224-239) & 240+ (Reserved)
  if (o1 >= 224) return false;

  return true;
}

/**
 * Extracts public sender IP from RFC 5322 headers strictly following priority:
 * 1. X-Originating-IP
 * 2. Received (first public IP)
 *
 * @param {Object} [headers] Key-value pairs of folded headers
 * @param {string} [fullText] Raw email text or MIME header block
 * @returns {string|null} The resolved public sender IP, or null if none exists.
 */
export function extractSenderPublicIp(headers = {}, fullText = '') {
  const normHeaders = {};
  if (headers && typeof headers === 'object') {
    for (const [k, v] of Object.entries(headers)) {
      if (typeof v === 'string') {
        normHeaders[k.toLowerCase()] = v;
      }
    }
  }

  const text = typeof fullText === 'string' ? fullText : '';

  // -------------------------------------------------------------
  // PRIORITY 1: X-Originating-IP
  // -------------------------------------------------------------
  const xOrigVal = normHeaders['x-originating-ip'] ||
    normHeaders['x-sender-ip'] ||
    (text.match(/^X-Originating-IP:\s*(.+)$/im)?.[1] || '') ||
    (text.match(/^X-Sender-IP:\s*(.+)$/im)?.[1] || '');

  if (xOrigVal) {
    const ipMatches = xOrigVal.match(/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g);
    if (ipMatches) {
      for (const cand of ipMatches) {
        if (isPublicIp(cand)) {
          return cand;
        }
      }
    }
  }

  // -------------------------------------------------------------
  // PRIORITY 2: Received (first public IP)
  // Extract all Received header blocks respecting RFC 5322 folding
  // -------------------------------------------------------------
  const receivedBlocks = [];
  const lines = text.split(/\r?\n/);
  let currentBlock = '';
  let inHeaders = true;

  for (const line of lines) {
    if (inHeaders && line.trim() === '') {
      inHeaders = false;
      break;
    }
    if (/^Received:\s*/i.test(line)) {
      if (currentBlock) receivedBlocks.push(currentBlock);
      currentBlock = line;
    } else if (currentBlock && (/^\s+/.test(line))) {
      currentBlock += ' ' + line.trim();
    } else if (currentBlock && !/^\s+/.test(line)) {
      receivedBlocks.push(currentBlock);
      currentBlock = '';
    }
  }
  if (currentBlock) receivedBlocks.push(currentBlock);

  // If no blocks via header scan, fallback to line regexes
  if (receivedBlocks.length === 0) {
    const directMatches = text.match(/^Received:\s*from.*$/gim) || [];
    receivedBlocks.push(...directMatches);
  }

  // Check received blocks in chronological order from sender MTA (bottom-up)
  for (let i = receivedBlocks.length - 1; i >= 0; i--) {
    const block = receivedBlocks[i];
    const ipMatches = block.match(/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g);
    if (ipMatches) {
      for (const cand of ipMatches) {
        if (isPublicIp(cand)) {
          return cand;
        }
      }
    }
  }

  // Also check top-down if bottom-up didn't hit
  for (let i = 0; i < receivedBlocks.length; i++) {
    const block = receivedBlocks[i];
    const ipMatches = block.match(/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g);
    if (ipMatches) {
      for (const cand of ipMatches) {
        if (isPublicIp(cand)) {
          return cand;
        }
      }
    }
  }

  // -------------------------------------------------------------
  // Additional RFC sender IP sources: Authentication-Results / Received-SPF
  // -------------------------------------------------------------
  const authResults = normHeaders['authentication-results'] || normHeaders['received-spf'] || '';
  const authMatches = authResults.match(/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g);
  if (authMatches) {
    for (const cand of authMatches) {
      if (isPublicIp(cand)) {
        return cand;
      }
    }
  }

  return null;
}

/**
 * Performs a real IP geolocation lookup.
 * Tries HTTPS ipwho.is, local Express backend proxy (/api/geolocate), and ip-api.com
 *
 * @param {string} ip - Valid public IP address
 * @returns {Promise<Object|null>} Geolocation object with lat/lng, country, city, ASN, ISP
 */
export async function lookupIpGeo(ip) {
  if (!isPublicIp(ip)) {
    return null;
  }

  const cleanIp = ip.trim();

  // Return cached result if available
  if (geoCache.has(cleanIp)) {
    return geoCache.get(cleanIp);
  }

  // 1. Try ipwho.is (direct client-side HTTPS)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://ipwho.is/${cleanIp}`, { signal: controller.signal });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false && typeof data.latitude === 'number') {
        const result = {
          ip: cleanIp,
          originIp: cleanIp,
          country: data.country || 'Unknown',
          countryCode: data.country_code || 'N/A',
          city: data.city || 'Unknown',
          region: data.region || '',
          latitude: data.latitude,
          longitude: data.longitude,
          asn: data.connection?.asn ? `AS${data.connection.asn} ${data.connection.org || data.connection.isp || ''}`.trim() : 'Unknown ASN',
          isp: data.connection?.isp || data.connection?.org || 'Internet Service Provider',
          reverseDns: data.connection?.domain || `node-${cleanIp.replace(/\./g, '-')}.net`,
          threatFlags: {
            isVpn: false,
            isTor: false,
            isProxy: false,
            isBulletproof: false,
            botnetScore: '0/100'
          }
        };
        geoCache.set(cleanIp, result);
        return result;
      }
    }
  } catch (err) {
    // Continue to next provider
  }

  // 2. Try Backend Geolocation Proxy (/api/geolocate/:ip)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`/api/geolocate/${cleanIp}`, { signal: controller.signal });
    clearTimeout(timer);

    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data && typeof json.data.latitude === 'number') {
        const data = json.data;
        const result = {
          ip: cleanIp,
          originIp: cleanIp,
          country: data.country || 'Unknown',
          countryCode: data.countryCode || 'N/A',
          city: data.city || 'Unknown',
          region: data.region || '',
          latitude: data.latitude,
          longitude: data.longitude,
          asn: data.asn || 'Unknown ASN',
          isp: data.isp || 'Internet Service Provider',
          reverseDns: data.reverseDns || `node-${cleanIp.replace(/\./g, '-')}.net`,
          threatFlags: { isVpn: false, isTor: false, isProxy: false, isBulletproof: false, botnetScore: '0/100' }
        };
        geoCache.set(cleanIp, result);
        return result;
      }
    }
  } catch (err) {
    // Continue to next provider
  }

  // 3. Try ip-api.com
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`http://ip-api.com/json/${cleanIp}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,isp,org,as,query`, {
      signal: controller.signal
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success' && typeof data.lat === 'number') {
        const result = {
          ip: cleanIp,
          originIp: cleanIp,
          country: data.country || 'Unknown',
          countryCode: data.countryCode || 'N/A',
          city: data.city || 'Unknown',
          region: data.regionName || data.region || '',
          latitude: data.lat,
          longitude: data.lon,
          asn: data.as || 'Unknown ASN',
          isp: data.isp || data.org || 'Internet Service Provider',
          reverseDns: `node-${cleanIp.replace(/\./g, '-')}.net`,
          threatFlags: { isVpn: false, isTor: false, isProxy: false, isBulletproof: false, botnetScore: '0/100' }
        };
        geoCache.set(cleanIp, result);
        return result;
      }
    }
  } catch (err) {
    // Lookup failed
  }

  return null;
}
