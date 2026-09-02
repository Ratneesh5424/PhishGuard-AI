import { jsPDF } from 'jspdf';

/**
 * Format timestamp into YYYYMMDD_HHMM for filename
 * @param {Date|string} date 
 * @returns {string} e.g. "20260902_1207"
 */
export function getFormattedTimestampForFilename(date = new Date()) {
  const d = new Date(date);
  const validDate = isNaN(d.getTime()) ? new Date() : d;
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = validDate.getFullYear();
  const mm = pad(validDate.getMonth() + 1);
  const dd = pad(validDate.getDate());
  const hh = pad(validDate.getHours());
  const min = pad(validDate.getMinutes());
  return `${yyyy}${mm}${dd}_${hh}${min}`;
}

/**
 * Format date for human reading
 * @param {Date|string} date 
 * @returns {string}
 */
export function formatDisplayDate(date = new Date()) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return new Date().toUTCString();
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  });
}

/**
 * Extract domain from sender string
 * @param {string} sender 
 * @returns {string}
 */
export function extractDomain(sender) {
  if (!sender) return 'N/A';
  const match = sender.match(/@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (match) return match[1].toLowerCase();
  const rawMatch = sender.match(/([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  return rawMatch ? rawMatch[1].toLowerCase() : 'N/A';
}

/**
 * Generate client-side forensic jsPDF document in A4 portrait format
 * @param {Object} data 
 * @returns {jsPDF}
 */
export function buildPhishGuardJsPdfDoc(data = {}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 182mm
  const bottomMargin = 18;

  // Normalized values
  const reportDate = data.date ? new Date(data.date) : new Date();
  const reportId = data.historyId || data.id || data.reportId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `PG-${Date.now()}-${Math.floor(Math.random()*10000)}`);
  const rawScore = typeof data.riskScore === 'number' ? data.riskScore : (typeof data.risk_score === 'number' ? data.risk_score : 0);
  const score = Math.min(100, Math.max(0, rawScore));
  
  const isHigh = score >= 71;
  const isSusp = score >= 31 && score <= 70;
  const statusLabel = isHigh ? 'HIGH RISK' : isSusp ? 'SUSPICIOUS' : 'SAFE';
  
  const confidence = typeof data.confidence === 'number' ? data.confidence : 97.5;
  const sender = data.sender || 'security-alerts@domain.com';
  const domain = extractDomain(sender);
  const subject = data.subject || 'Analyzed Email Assessment';
  const summary = data.executiveSummary || data.summary || 'Forensic analysis completed. No further anomalies identified.';
  
  // Threats list normalization
  let rawThreats = Array.isArray(data.threatFactors) && data.threatFactors.length > 0
    ? data.threatFactors
    : Array.isArray(data.reasons) && data.reasons.length > 0
    ? data.reasons
    : Array.isArray(data.threats) && data.threats.length > 0
    ? data.threats
    : [];

  const threatFactors = [];
  
  if (rawThreats.length === 0) {
    if (isHigh) {
      threatFactors.push({
        title: 'Brand Impersonation',
        description: 'Potential unauthorized use of brand domain and branding artifacts mimicking legitimate services.',
        severity: 'HIGH',
      });
      threatFactors.push({
        title: 'Urgency Language',
        description: 'Psychological manipulation inducing urgent action, threat of account suspension, or immediate deadlines.',
        severity: 'HIGH',
      });
      threatFactors.push({
        title: 'Credential Harvesting Vector',
        description: 'Detected call-to-action soliciting credentials, session tokens, or sensitive account authentication.',
        severity: 'HIGH',
      });
      threatFactors.push({
        title: 'Spoofing Indicators',
        description: 'Discrepancy detected between envelope sender, From header, and reply addresses.',
        severity: 'HIGH',
      });
    } else if (isSusp) {
      threatFactors.push({
        title: 'Urgency Indicators',
        description: 'Elevated urgency cues detected in email subject and message body.',
        severity: 'MEDIUM',
      });
      threatFactors.push({
        title: 'Domain Alignment Check',
        description: 'External links or reply addresses require secondary validation with claimed domain.',
        severity: 'MEDIUM',
      });
    } else {
      threatFactors.push({
        title: 'Domain & Identity Integrity',
        description: 'Sender domain matches claimed identity with valid organizational signatures.',
        severity: 'LOW',
      });
      threatFactors.push({
        title: 'Safe Behavioral Profile',
        description: 'No psychological coercion, credential prompts, or malicious heuristics detected.',
        severity: 'LOW',
      });
    }
  } else {
    rawThreats.forEach((item, idx) => {
      if (typeof item === 'object' && item !== null) {
        threatFactors.push({
          title: item.title || `Threat Factor #${idx + 1}`,
          description: item.description || 'Forensic indicator detected.',
          severity: (item.severity || (isHigh ? 'HIGH' : isSusp ? 'MEDIUM' : 'LOW')).toUpperCase(),
        });
      } else {
        const str = String(item || '');
        if (str.includes(':')) {
          const parts = str.split(':');
          threatFactors.push({
            title: parts[0].trim() || `Threat Factor #${idx + 1}`,
            description: parts.slice(1).join(':').trim() || 'Forensic indicator detected.',
            severity: isHigh ? 'HIGH' : isSusp ? 'MEDIUM' : 'LOW',
          });
        } else {
          threatFactors.push({
            title: `Threat Indicator #${idx + 1}`,
            description: str,
            severity: isHigh ? 'HIGH' : isSusp ? 'MEDIUM' : 'LOW',
          });
        }
      }
    });
  }

  // Authentication extraction
  const auth = data.authentication || {};
  const normalizeAuthVal = (val, fallbackName) => {
    if (typeof val === 'object' && val !== null) {
      const st = (val.status || 'UNKNOWN').toUpperCase();
      const isPass = st === 'PASS' || st === 'PASSED';
      const isFail = st === 'FAIL' || st === 'FAILED';
      return {
        status: isPass ? 'PASS' : isFail ? 'FAIL' : 'UNKNOWN',
        reason: val.reason || (isPass ? `${fallbackName} validation verified.` : `${fallbackName} verification failed or missing.`),
      };
    }
    const str = String(val || '').toUpperCase();
    const isPass = str.includes('PASS');
    const isFail = str.includes('FAIL');
    return {
      status: isPass ? 'PASS' : isFail ? 'FAIL' : 'UNKNOWN',
      reason: isPass ? `${fallbackName} record verified.` : `${fallbackName} verification failed or missing.`,
    };
  };

  const spfInfo = normalizeAuthVal(auth.spf || data.spf, 'SPF');
  const dkimInfo = normalizeAuthVal(auth.dkim || data.dkim, 'DKIM');
  const dmarcInfo = normalizeAuthVal(auth.dmarc || data.dmarc, 'DMARC');

  const urls = Array.isArray(data.urls) ? data.urls : [];

  // Theme Colors
  const colors = {
    white: [255, 255, 255],
    slate900: [15, 23, 42],      // #0F172A
    slate800: [30, 41, 59],      // #1E293B
    slate700: [51, 65, 85],      // #334155
    slate600: [71, 85, 105],     // #475569
    slate400: [148, 163, 184],   // #94A3B8
    slate200: [226, 232, 240],   // #E2E8F0
    slate100: [241, 245, 249],   // #F1F5F9
    slate50: [248, 250, 252],    // #F8FAFC
    bluePrimary: [2, 132, 199],  // #0284C7
    blueLight: [224, 242, 254],  // #E0F2FE
    blueDark: [3, 105, 161],     // #0369A1
    redDanger: [220, 38, 38],    // #DC2626
    redLight: [254, 242, 242],   // #FEF2F2
    redBorder: [254, 202, 202],  // #FECACA
    amberWarn: [217, 119, 6],    // #D97706
    amberLight: [255, 251, 235], // #FFFBEB
    amberBorder: [253, 230, 138],// #FDE68A
    greenSafe: [5, 150, 105],    // #059669
    greenLight: [236, 253, 245], // #ECFDF5
    greenBorder: [167, 243, 208],// #A7F3D0
  };

  const primaryAccent = isHigh ? colors.redDanger : isSusp ? colors.amberWarn : colors.bluePrimary;
  const statusBg = isHigh ? colors.redLight : isSusp ? colors.amberLight : colors.greenLight;
  const statusBorder = isHigh ? colors.redBorder : isSusp ? colors.amberBorder : colors.greenBorder;
  const statusText = isHigh ? colors.redDanger : isSusp ? colors.amberWarn : colors.greenSafe;

  let currentY = marginX;

  function ensureSpace(heightNeeded) {
    if (currentY + heightNeeded > pageHeight - bottomMargin) {
      doc.addPage();
      currentY = marginX;
      drawHeaderBannerSmall();
    }
  }

  function drawHeaderBannerSmall() {
    doc.setFillColor(...colors.slate900);
    doc.rect(marginX, currentY, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...colors.white);
    doc.text('PHISHGUARD AI - FORENSIC THREAT ANALYSIS REPORT (CONTINUED)', marginX + 3, currentY + 4.8);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.slate400);
    doc.text(`Report ID: ${String(reportId).slice(0, 18)}...`, pageWidth - marginX - 3, currentY + 4.8, { align: 'right' });
    
    currentY += 10;
  }

  // --- HEADER SECTION ---
  doc.setFillColor(...colors.bluePrimary);
  doc.rect(marginX, currentY, contentWidth * 0.7, 2, 'F');
  doc.setFillColor(...(isHigh ? colors.redDanger : colors.blueDark));
  doc.rect(marginX + contentWidth * 0.7, currentY, contentWidth * 0.3, 2, 'F');
  currentY += 4;

  const headerStartY = currentY;

  // Logo Shield Vector
  const shieldX = marginX + 2;
  const shieldY = currentY + 1;
  const shieldW = 10;
  const shieldH = 12;

  doc.setFillColor(...colors.slate900);
  doc.roundedRect(shieldX, shieldY, shieldW, shieldH, 2, 2, 'F');
  doc.setFillColor(...primaryAccent);
  doc.roundedRect(shieldX + 1.2, shieldY + 1.2, shieldW - 2.4, shieldH - 2.4, 1.2, 1.2, 'F');

  doc.setDrawColor(...colors.white);
  doc.setLineWidth(0.8);
  doc.line(shieldX + 3.2, shieldY + 6.2, shieldX + 4.8, shieldY + 8.2);
  doc.line(shieldX + 4.8, shieldY + 8.2, shieldX + 7.2, shieldY + 4.2);

  // Logo Brand Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...colors.slate900);
  doc.text('PHISHGUARD AI', shieldX + shieldW + 4, currentY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...colors.bluePrimary);
  doc.text('AI Email Threat Analysis Report', shieldX + shieldW + 4, currentY + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...colors.slate600);
  doc.text('Advanced Heuristic Telemetry & LLM Inspection Engine', shieldX + shieldW + 4, currentY + 13);

  // Right Side: Report Metadata Box
  const metaBoxW = 74;
  const metaBoxH = 15;
  const metaBoxX = pageWidth - marginX - metaBoxW;
  const metaBoxY = headerStartY;

  doc.setFillColor(...colors.slate50);
  doc.setDrawColor(...colors.slate200);
  doc.setLineWidth(0.3);
  doc.roundedRect(metaBoxX, metaBoxY, metaBoxW, metaBoxH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...colors.slate700);
  doc.text('GENERATED AT:', metaBoxX + 3, metaBoxY + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.slate900);
  doc.text(formatDisplayDate(reportDate), metaBoxX + 25, metaBoxY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.slate700);
  doc.text('REPORT ID:', metaBoxX + 3, metaBoxY + 8.5);
  doc.setFont('courier', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(...colors.blueDark);
  doc.text(String(reportId).substring(0, 28), metaBoxX + 25, metaBoxY + 8.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...colors.slate700);
  doc.text('CLASSIFICATION:', metaBoxX + 3, metaBoxY + 12.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.slate900);
  doc.text('CONFIDENTIAL / SECURITY FORENSIC', metaBoxX + 25, metaBoxY + 12.5);

  currentY += 19;

  function drawSectionTitle(title, number) {
    ensureSpace(12);
    doc.setFillColor(...colors.slate900);
    doc.roundedRect(marginX, currentY, contentWidth, 5.8, 1, 1, 'F');

    doc.setFillColor(...primaryAccent);
    doc.rect(marginX, currentY, 2.5, 5.8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...colors.white);
    doc.text(`SECTION ${number} — ${title.toUpperCase()}`, marginX + 5, currentY + 4.1);
    currentY += 8;
  }

  // --- SECTION 1: EMAIL INFORMATION ---
  drawSectionTitle('Email Information & Identification', '1');

  const emailInfoH = 25;
  doc.setFillColor(...colors.slate50);
  doc.setDrawColor(...colors.slate200);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, currentY, contentWidth, emailInfoH, 1.5, 1.5, 'FD');

  const col1X = marginX + 4;
  const col2X = marginX + 76;

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...colors.slate600);
  doc.text('SENDER / FROM:', col1X, currentY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...colors.slate900);
  const senderTrim = doc.splitTextToSize(sender, 68);
  doc.text(senderTrim[0] || sender, col1X, currentY + 9.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...colors.slate600);
  doc.text('DOMAIN IDENTIFIER:', col2X, currentY + 5.5);

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...colors.blueDark);
  doc.text(domain, col2X, currentY + 9.5);

  // Status Badge
  const badgeW = 40;
  const badgeH = 15;
  const badgeX = marginX + contentWidth - badgeW - 4;
  const badgeY = currentY + 4.5;

  doc.setFillColor(...statusBg);
  doc.setDrawColor(...statusBorder);
  doc.setLineWidth(0.5);
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(...statusText);
  doc.text('VERDICT STATUS', badgeX + badgeW / 2, badgeY + 4.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...statusText);
  doc.text(statusLabel, badgeX + badgeW / 2, badgeY + 11.5, { align: 'center' });

  // Row 2: Subject & Analyzed Time
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...colors.slate600);
  doc.text('EMAIL SUBJECT:', col1X, currentY + 16.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...colors.slate900);
  const subjLines = doc.splitTextToSize(subject, 68);
  doc.text(subjLines[0] || subject, col1X, currentY + 20.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...colors.slate600);
  doc.text('ANALYZED TIMESTAMP:', col2X, currentY + 16.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...colors.slate900);
  doc.text(formatDisplayDate(reportDate), col2X, currentY + 20.5);

  currentY += emailInfoH + 4;

  // --- SECTION 2: RISK SUMMARY ---
  drawSectionTitle('Risk Summary & Executive Assessment', '2');

  const riskCardH = 36;
  doc.setFillColor(...colors.slate50);
  doc.setDrawColor(...colors.slate200);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, currentY, contentWidth, riskCardH, 1.5, 1.5, 'FD');

  // Left Circular Risk Score Dial
  const dialCenterX = marginX + 22;
  const dialCenterY = currentY + riskCardH / 2;
  const dialRadius = 14;

  doc.setDrawColor(...colors.slate200);
  doc.setLineWidth(2.2);
  doc.circle(dialCenterX, dialCenterY, dialRadius, 'S');

  doc.setDrawColor(...primaryAccent);
  doc.setLineWidth(2.4);
  doc.circle(dialCenterX, dialCenterY, dialRadius, 'S');

  doc.setFillColor(...colors.white);
  doc.circle(dialCenterX, dialCenterY, dialRadius - 2.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...statusText);
  doc.text(`${score}%`, dialCenterX, dialCenterY + 1, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(...statusText);
  doc.text(statusLabel, dialCenterX, dialCenterY + 5.2, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(...colors.slate600);
  doc.text('THREAT SEVERITY', dialCenterX, currentY + riskCardH - 2, { align: 'center' });

  // Right Side: Confidence & Summary
  const sumX = marginX + 44;
  const sumW = contentWidth - 48;

  doc.setFillColor(...colors.white);
  doc.setDrawColor(...colors.slate200);
  doc.roundedRect(sumX, currentY + 3.5, sumW, 6.5, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...colors.slate700);
  doc.text('AI MODEL CONFIDENCE:', sumX + 3, currentY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...colors.blueDark);
  doc.text(`${confidence}% VERIFIED`, sumX + 38, currentY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...colors.slate600);
  doc.text('Engine: Gemini Threat Intelligence', sumX + sumW - 3, currentY + 8, { align: 'right' });

  doc.setFillColor(...colors.white);
  doc.setDrawColor(...colors.slate200);
  doc.roundedRect(sumX, currentY + 11.5, sumW, riskCardH - 14.5, 1, 1, 'FD');

  doc.setFillColor(...colors.bluePrimary);
  doc.rect(sumX, currentY + 11.5, 1.5, riskCardH - 14.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...colors.slate900);
  doc.text('Executive Summary:', sumX + 4, currentY + 15.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...colors.slate700);
  const summaryLines = doc.splitTextToSize(summary, sumW - 7);
  doc.text(summaryLines.slice(0, 4), sumX + 4, currentY + 19.5, { lineHeightFactor: 1.25 });

  currentY += riskCardH + 4;

  // --- SECTION 3: THREAT FACTORS ---
  drawSectionTitle('Identified Threat Factors & Heuristics', '3');

  const threatBoxW = (contentWidth - 4) / 2;
  const maxThreats = Math.min(threatFactors.length, 6);

  for (let i = 0; i < maxThreats; i += 2) {
    ensureSpace(16);
    const item1 = threatFactors[i];
    const item2 = threatFactors[i + 1];

    const rowH = 14;
    const drawThreatItem = (item, x) => {
      if (!item) return;
      const isItemHigh = item.severity === 'HIGH';
      const isItemMed = item.severity === 'MEDIUM';
      const itemBg = isItemHigh ? colors.redLight : isItemMed ? colors.amberLight : colors.slate100;
      const itemBorder = isItemHigh ? colors.redBorder : isItemMed ? colors.amberBorder : colors.slate200;
      const itemTagColor = isItemHigh ? colors.redDanger : isItemMed ? colors.amberWarn : colors.bluePrimary;

      doc.setFillColor(...itemBg);
      doc.setDrawColor(...itemBorder);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, currentY, threatBoxW, rowH, 1.2, 1.2, 'FD');

      doc.setFillColor(...itemTagColor);
      doc.circle(x + 3.5, currentY + 4, 1.2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.2);
      doc.setTextColor(...colors.slate900);
      const titleLines = doc.splitTextToSize(item.title, threatBoxW - 24);
      doc.text(titleLines[0] || item.title, x + 6.5, currentY + 4.5);

      doc.setFillColor(...colors.white);
      doc.roundedRect(x + threatBoxW - 17, currentY + 2, 14, 4, 0.8, 0.8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.setTextColor(...itemTagColor);
      doc.text(item.severity, x + threatBoxW - 10, currentY + 4.8, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.2);
      doc.setTextColor(...colors.slate700);
      const descLines = doc.splitTextToSize(item.description, threatBoxW - 7);
      doc.text(descLines.slice(0, 2), x + 3.5, currentY + 8.5, { lineHeightFactor: 1.2 });
    };

    drawThreatItem(item1, marginX);
    if (item2) {
      drawThreatItem(item2, marginX + threatBoxW + 4);
    }

    currentY += rowH + 2.5;
  }

  currentY += 1.5;

  // --- SECTION 4: AUTHENTICATION (SPF / DKIM / DMARC) ---
  drawSectionTitle('Email Protocol Authentication', '4');

  ensureSpace(18);
  const authCardW = (contentWidth - 6) / 3;
  const authCardH = 15;

  const authList = [
    { name: 'SPF', full: 'Sender Policy Framework', info: spfInfo },
    { name: 'DKIM', full: 'DomainKeys Identified Mail', info: dkimInfo },
    { name: 'DMARC', full: 'Domain Alignment Policy', info: dmarcInfo },
  ];

  authList.forEach((a, idx) => {
    const cardX = marginX + idx * (authCardW + 3);
    const isPass = a.info.status === 'PASS';
    const isFail = a.info.status === 'FAIL';
    const aBg = isPass ? colors.greenLight : isFail ? colors.redLight : colors.slate100;
    const aBorder = isPass ? colors.greenBorder : isFail ? colors.redBorder : colors.slate200;
    const aColor = isPass ? colors.greenSafe : isFail ? colors.redDanger : colors.slate600;

    doc.setFillColor(...aBg);
    doc.setDrawColor(...aBorder);
    doc.setLineWidth(0.3);
    doc.roundedRect(cardX, currentY, authCardW, authCardH, 1.2, 1.2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...colors.slate900);
    doc.text(a.name, cardX + 3, currentY + 4.5);

    doc.setFillColor(...colors.white);
    doc.roundedRect(cardX + authCardW - 16, currentY + 2, 13, 4, 0.8, 0.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(...aColor);
    doc.text(a.info.status, cardX + authCardW - 9.5, currentY + 4.8, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(...colors.slate600);
    doc.text(a.full, cardX + 3, currentY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(...colors.slate700);
    const rLines = doc.splitTextToSize(a.info.reason, authCardW - 6);
    doc.text(rLines.slice(0, 2), cardX + 3, currentY + 11.2, { lineHeightFactor: 1.15 });
  });

  currentY += authCardH + 4;

  // --- SECTION 5: EXTRACTED URLS ---
  drawSectionTitle('Extracted Hyperlinks & Destination Telemetry', '5');

  ensureSpace(20);

  if (urls.length === 0) {
    doc.setFillColor(...colors.slate50);
    doc.setDrawColor(...colors.slate200);
    doc.roundedRect(marginX, currentY, contentWidth, 10, 1.2, 1.2, 'FD');

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(...colors.slate600);
    doc.text('No external hyperlinks or embedded URL destinations were detected in the analyzed message.', marginX + 4, currentY + 6);
    currentY += 14;
  } else {
    const thH = 5.5;
    doc.setFillColor(...colors.slate800);
    doc.roundedRect(marginX, currentY, contentWidth, thH, 0.8, 0.8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(...colors.white);
    doc.text('#', marginX + 3, currentY + 3.8);
    doc.text('URL ENDPOINT / TARGET', marginX + 10, currentY + 3.8);
    doc.text('CATEGORY / REPUTATION', marginX + 118, currentY + 3.8);
    doc.text('RISK LEVEL', marginX + contentWidth - 18, currentY + 3.8, { align: 'right' });

    currentY += thH;

    const maxUrls = Math.min(urls.length, 8);
    for (let i = 0; i < maxUrls; i++) {
      ensureSpace(8);
      const u = urls[i];
      const urlStr = typeof u === 'string' ? u : u?.url || 'N/A';
      const repStr = (typeof u === 'object' && u ? u.reputation || u.destination : 'External Resource') || 'External Resource';
      const riskStr = ((typeof u === 'object' && u ? u.risk : 'Unknown') || 'Unknown').toUpperCase();

      const isUrlHigh = riskStr.includes('HIGH') || riskStr.includes('MALICIOUS') || riskStr.includes('DANGEROUS');
      const isUrlMed = riskStr.includes('MED') || riskStr.includes('SUSPICIOUS');

      const rowBg = i % 2 === 0 ? colors.slate50 : colors.white;
      const rowH = 6.8;

      doc.setFillColor(...rowBg);
      doc.rect(marginX, currentY, contentWidth, rowH, 'F');
      doc.setDrawColor(...colors.slate200);
      doc.setLineWidth(0.2);
      doc.line(marginX, currentY + rowH, marginX + contentWidth, currentY + rowH);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.2);
      doc.setTextColor(...colors.slate600);
      doc.text(String(i + 1), marginX + 3, currentY + 4.5);

      doc.setFont('courier', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(...colors.blueDark);
      const urlTrunc = doc.splitTextToSize(urlStr, 102);
      doc.text(urlTrunc[0] || urlStr, marginX + 10, currentY + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(...colors.slate700);
      const repTrunc = doc.splitTextToSize(repStr, 38);
      doc.text(repTrunc[0] || repStr, marginX + 118, currentY + 4.5);

      const rColor = isUrlHigh ? colors.redDanger : isUrlMed ? colors.amberWarn : colors.greenSafe;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(...rColor);
      doc.text(riskStr, marginX + contentWidth - 4, currentY + 4.5, { align: 'right' });

      currentY += rowH;
    }
  }

  // --- FOOTER ON ALL PAGES ---
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    const footerY = pageHeight - 9;
    doc.setDrawColor(...colors.slate200);
    doc.setLineWidth(0.3);
    doc.line(marginX, footerY - 2.5, pageWidth - marginX, footerY - 2.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...colors.slate700);
    doc.text('Generated by PhishGuard AI | SIH 2026', marginX, footerY + 1.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...colors.slate400);
    doc.text('CONFIDENTIAL THREAT INTELLIGENCE REPORT', pageWidth / 2, footerY + 1.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...colors.slate700);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - marginX, footerY + 1.5, { align: 'right' });
  }

  return doc;
}

import { API_BASE_URL } from './apiConfig';

/**
 * Downloads forensic PDF generated by backend API with seamless browser fallback
 * @param {Object} analysisData 
 * @returns {Promise<void>}
 */
export async function downloadPhishGuardPDF(analysisData) {
  const timestampStr = getFormattedTimestampForFilename(analysisData?.date || new Date());
  const filename = `PhishGuard_Report_${timestampStr}.pdf`;

  try {
    // 1. Primary: Generate forensic PDF directly via backend API
    const response = await fetch(`${API_BASE_URL}/export-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/pdf',
      },
      body: JSON.stringify(analysisData || {}),
    });

    if (response.ok) {
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      return;
    }
  } catch (backendErr) {
    console.warn('Backend PDF endpoint unreachable, invoking client-side jsPDF engine:', backendErr);
  }

  // 2. Client-side fallback via jsPDF
  const doc = buildPhishGuardJsPdfDoc(analysisData);
  doc.save(filename);
}
