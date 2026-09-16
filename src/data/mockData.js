// PhishGuard AI - Enterprise Cybersecurity & Forensic Intelligence Mock Data Store
// Designed for Smart India Hackathon 2026 (Pure Client-Side Mock Data)

export const MOCK_METRICS = {
  totalScanned: 14892,
  totalScannedChange: '+18.4%',
  highRiskAlerts: 542,
  highRiskRate: '3.6%',
  authProtocolFails: 1208,
  authFailType: 'SPF / DKIM / DMARC',
  cleanVerifiedRate: '91.8%',
  cleanVerifiedCount: 13142
};

export const MOCK_TREND_CHART_DATA = {
  '7d': [
    { time: 'Aug 28', phishing: 142, bec: 48, malware: 26, safe: 820 },
    { time: 'Aug 29', phishing: 165, bec: 52, malware: 34, safe: 890 },
    { time: 'Aug 30', phishing: 188, bec: 61, malware: 29, safe: 940 },
    { time: 'Aug 31', phishing: 240, bec: 84, malware: 58, safe: 1120 },
    { time: 'Sep 01', phishing: 210, bec: 72, malware: 45, safe: 1050 },
    { time: 'Sep 02', phishing: 295, bec: 96, malware: 64, safe: 1280 },
    { time: 'Sep 03 (Today)', phishing: 342, bec: 118, malware: 82, safe: 1460 }
  ],
  '24h': [
    { time: '00:00', phishing: 12, bec: 4, malware: 2, safe: 85 },
    { time: '04:00', phishing: 8, bec: 2, malware: 1, safe: 40 },
    { time: '08:00', phishing: 38, bec: 14, malware: 8, safe: 190 },
    { time: '12:00', phishing: 64, bec: 26, malware: 16, safe: 310 },
    { time: '16:00', phishing: 82, bec: 31, malware: 22, safe: 380 },
    { time: '20:00', phishing: 45, bec: 18, malware: 12, safe: 240 }
  ],
  '30d': [
    { time: 'Week 1', phishing: 780, bec: 240, malware: 160, safe: 4200 },
    { time: 'Week 2', phishing: 940, bec: 310, malware: 210, safe: 4800 },
    { time: 'Week 3', phishing: 1120, bec: 380, malware: 290, safe: 5300 },
    { time: 'Week 4', phishing: 1380, bec: 490, malware: 360, safe: 6100 }
  ]
};

export const MOCK_PRESETS = [
  {
    id: 'preset-ceo-wire',
    name: 'CEO Wire Fraud (Satya Nadella Spoof)',
    badge: 'CRITICAL (96/100)',
    riskScore: 96,
    threatLevel: 'CRITICAL',
    confidence: 99.4,
    subject: 'URGENT: Approved Acquisition Payment Routing Authorization [CONFIDENTIAL]',
    sender: 'Satya Nadella <ceo-office@microsoft-exec-portal.cc>',
    replyTo: 'finance-reconciliation@fin-direct-offshore.pw',
    recipient: 'cfo-team@enterprise-defense.gov.in',
    date: '2026-09-03T10:14:22Z',
    messageId: '<20260903-BEC-EXEC-991204@microsoft-exec-portal.cc>',
    returnPath: '<bounce-exec@fin-direct-offshore.pw>',
    contentType: 'text/plain; charset=UTF-8',
    summary: 'Executive impersonation and wire fraud attack targeting CFO. SPF/DKIM/DMARC failed, Reply-To mismatch, coercive $2.45M wire demand.',
    bodyText: `From: "Satya Nadella" <ceo-office@microsoft-exec-portal.cc>
To: cfo-team@enterprise-defense.gov.in
Reply-To: finance-reconciliation@fin-direct-offshore.pw
Return-Path: <bounce-exec@fin-direct-offshore.pw>
Date: Tue, 03 Sep 2026 10:14:22 +0530
Subject: URGENT: Approved Acquisition Payment Routing Authorization [CONFIDENTIAL]
Message-ID: <20260903-BEC-EXEC-991204@microsoft-exec-portal.cc>
X-Originating-IP: [185.220.101.45]
Authentication-Results: mx.google.com; spf=fail smtp.mailfrom=bounce-exec@fin-direct-offshore.pw; dkim=fail; dmarc=fail header.from=microsoft-exec-portal.cc
Content-Type: text/plain; charset="UTF-8"

CONFIDENTIAL EXECUTIVE DIRECTIVE
From: Office of the Chief Executive Officer
To: Corporate Financial Operations / CFO

Team,
Pursuant to our NDA regarding Project Titan (Strategic Infrastructure Acquisition), please execute the expedited payment wire of $2,450,000 USD immediately to the escrow clearing account below before 17:00 IST today.

Beneficiary Bank: Offshore Escrow Clearing AG (Zurich Branch)
IBAN: DE89 3704 0044 0532 0130 00
Routing/SWIFT: DEUTDEDDFXX
Reference Code: SIH-2026-TITAN-ESCROW

Do not discuss this on open Slack or email channels due to SEC quiet period regulations. Confirm execution directly via the encrypted link below:
https://secure-exec-auth.microsoft-exec-portal.cc/wire/confirm?tx=99104

Regards,
Satya Nadella
Chief Executive Officer`
  },
  {
    id: 'preset-fake-payroll',
    name: 'Fake Payroll Deposit & Tax Update',
    badge: 'CRITICAL (88/100)',
    riskScore: 88,
    threatLevel: 'CRITICAL',
    confidence: 99.1,
    subject: 'URGENT: Action Required - Update Payroll Direct Deposit & Tax Info',
    sender: 'HR Payroll Department <payroll-direct@secure-portal-update.org>',
    replyTo: 'payroll-verify@offshore-drop.net',
    recipient: 'employee@enterprise.com',
    date: '2026-09-03T08:20:10Z',
    messageId: '<20260903-PAYROLL-ALERT-9812@secure-portal-update.org>',
    returnPath: '<bounces@offshore-drop.net>',
    contentType: 'text/plain; charset=UTF-8',
    summary: 'Phishing email targeting employee payroll credentials and banking routing details.',
    bodyText: `From: "HR Payroll Department" <payroll-direct@secure-portal-update.org>
To: employee@enterprise.com
Reply-To: payroll-verify@offshore-drop.net
Return-Path: <bounces@offshore-drop.net>
Date: Tue, 03 Sep 2026 08:20:10 +0000
Subject: URGENT: Action Required - Update Payroll Direct Deposit & Tax Info
X-Originating-IP: [193.106.191.77]
Authentication-Results: mx.google.com; spf=fail smtp.mailfrom=bounces@offshore-drop.net; dkim=fail; dmarc=fail

Attention Staff Member,

Due to the mid-year payroll tax reconciliation, please login immediately to verify your password and banking routing information before the payroll deadline today.

Verification Portal:
https://portal-payroll-update.secure-portal-update.org/login/verify?emp=99120

Failure to authenticate by 18:00 today will result in withheld monthly salary disbursements.

Human Resources & Payroll Operations`
  },
  {
    id: 'preset-fake-ms-login',
    name: 'Fake Microsoft 365 Login Phish',
    badge: 'HIGH (82/100)',
    riskScore: 82,
    threatLevel: 'HIGH',
    confidence: 98.8,
    subject: 'Urgent: Your Microsoft 365 Account is Locked - Immediate Verification Required',
    sender: 'Microsoft Security Desk <support@login-verify-account.cc>',
    replyTo: 'credential-harvest@offshore-gate.pw',
    recipient: 'user@enterprise.com',
    date: '2026-09-03T11:45:00Z',
    messageId: '<20260903-MS-SEC-77812@login-verify-account.cc>',
    returnPath: '<bounces@offshore-gate.pw>',
    contentType: 'text/plain; charset=UTF-8',
    summary: 'Brand impersonation phishing spoofing Microsoft 365 login and harvesting credentials.',
    bodyText: `From: "Microsoft Security Desk" <support@login-verify-account.cc>
To: user@enterprise.com
Reply-To: credential-harvest@offshore-gate.pw
Subject: Urgent: Your Microsoft 365 Account is Locked - Immediate Verification Required
Date: Tue, 03 Sep 2026 11:45:00 +0000
X-Originating-IP: [193.106.191.77]
Authentication-Results: mx.google.com; spf=fail; dkim=fail; dmarc=fail header.from=login-verify-account.cc

Microsoft Security Operations Center

We detected multiple unauthorized password attempts on your Microsoft 365 enterprise account today.

You must immediately login to verify your password and authenticate your identity before the security deadline today.

Access Portal:
https://login.microsoftonline.com.account-verify.cc/login?session=active

Microsoft Entra ID Security Operations`
  },
  {
    id: 'preset-selfstudys-promo',
    name: 'SelfStudys Promo Newsletter',
    badge: 'LOW (28/100)',
    riskScore: 28,
    threatLevel: 'LOW',
    confidence: 98.2,
    subject: 'SelfStudys Flash Sale: 50% Off Engineering & Medical Study Material',
    sender: 'SelfStudys Education <newsletter@selfstudys.com>',
    replyTo: 'newsletter@selfstudys.com',
    recipient: 'student@domain.com',
    date: '2026-09-02T14:00:00Z',
    messageId: '<20260902-promo-88124@selfstudys.com>',
    returnPath: '<bounces@selfstudys.com>',
    contentType: 'text/plain; charset=UTF-8',
    summary: 'Commercial promotional newsletter from SelfStudys with study guide offers.',
    bodyText: `From: "SelfStudys Education" <newsletter@selfstudys.com>
To: student@domain.com
Reply-To: newsletter@selfstudys.com
Return-Path: <bounces@selfstudys.com>
Date: Wed, 02 Sep 2026 14:00:00 +0530
Subject: SelfStudys Flash Sale: 50% Off Engineering & Medical Study Material
Authentication-Results: mx.google.com; spf=pass (google.com: domain of bounces@selfstudys.com designates 104.18.25.40 as permitted sender); dkim=pass; dmarc=pass

Dear Aspirant,

Today is the final day of the SelfStudys Mega Educational Sale!

Access mock test series, NCERT solutions, and handwritten notes at 50% discount today. 
Offer deadline expires at midnight.

Visit the catalog: https://bit.ly/selfstudys-promo-materials

Happy Learning,
The SelfStudys Editorial Team`
  },
  {
    id: 'preset-dsu-admission',
    name: 'DSU Admission Provisional Letter',
    badge: 'SAFE (12/100)',
    riskScore: 12,
    threatLevel: 'SAFE',
    confidence: 99.6,
    subject: 'DSU Admissions 2026: Provisional Selection Letter & Campus Enrollment Notice',
    sender: 'DSU Admissions Directorate <admissions@dsu.edu.in>',
    replyTo: 'admissions@dsu.edu.in',
    recipient: 'candidate@domain.com',
    date: '2026-09-01T09:30:00Z',
    messageId: '<20260901-dsu-admissions-9914@dsu.edu.in>',
    returnPath: '<bounces@dsu.edu.in>',
    contentType: 'text/plain; charset=UTF-8',
    summary: 'Authentic educational admission notification from Dayananda Sagar University (DSU).',
    bodyText: `From: "DSU Admissions Directorate" <admissions@dsu.edu.in>
To: candidate@domain.com
Reply-To: admissions@dsu.edu.in
Return-Path: <bounces@dsu.edu.in>
Date: Tue, 01 Sep 2026 09:30:00 +0530
Subject: DSU Admissions 2026: Provisional Selection Letter & Campus Enrollment Notice
Authentication-Results: mx.google.com; spf=pass (google.com: domain of bounces@dsu.edu.in designates 164.100.158.40 as permitted sender); dkim=pass header.i=@dsu.edu.in; dmarc=pass (p=REJECT) header.from=dsu.edu.in

Dayananda Sagar University (DSU) — Admissions Office
Bengaluru, Karnataka, India

Dear Candidate,

Congratulations on being provisionally selected for the Bachelor of Technology (B.Tech) program at Dayananda Sagar University for Academic Year 2026–27.

Please verify your application details and uploaded academic certificates on the student admission portal:
https://admissions.dsu.edu.in/portal/login

Important Schedule:
- Document verification deadline: September 15, 2026
- Orientation venue: Innovation Center, DSU Main Campus, Bengaluru

For queries, contact admissions@dsu.edu.in.

Warm regards,
Office of the Registrar
Dayananda Sagar University (DSU)`
  },
  {
    id: 'preset-real-openai',
    name: 'Example A: Real OpenAI Authenticated Email',
    badge: 'SAFE (8/100)',
    riskScore: 8,
    threatLevel: 'SAFE',
    confidence: 99.8,
    subject: 'Your OpenAI API Billing Statement & Usage Summary',
    sender: 'OpenAI Team <support@email.openai.com>',
    replyTo: 'support@email.openai.com',
    recipient: 'security-lead@enterprise.com',
    date: '2026-09-04T08:30:00Z',
    messageId: '<20260904-api-statement@email.openai.com>',
    returnPath: '<bounces@email.openai.com>',
    contentType: 'text/plain; charset=UTF-8',
    summary: 'Authenticated email from OpenAI. No spoofing, no credential harvesting, no financial coercion detected.',
    bodyText: `From: OpenAI Team <support@email.openai.com>
To: security-lead@enterprise.com
Subject: Your OpenAI API Billing Statement & Usage Summary
Date: Fri, 04 Sep 2026 08:30:00 +0000
Message-ID: <20260904-api-statement@email.openai.com>
Reply-To: support@email.openai.com
Return-Path: <bounces@email.openai.com>
Authentication-Results: mx.google.com; spf=pass (google.com: domain of bounces@email.openai.com designates 104.18.25.40 as permitted sender) smtp.mailfrom=bounces@email.openai.com; dkim=pass header.i=@email.openai.com; dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=email.openai.com

Hello,

Here is your routine OpenAI API monthly usage statement for the current billing cycle.

You can view your detailed token usage breakdown and past statements directly within your OpenAI platform organization dashboard at https://platform.openai.com/account/usage.

No action is required on your part. Thank you for building with OpenAI.

Best regards,
The OpenAI Team`,
    protocols: {
      spf: { status: 'PASS', record: 'v=spf1 include:_spf.openai.com -all', evaluatedIp: '104.18.25.40', reason: 'Origin IP 104.18.25.40 is cryptographically authorized in domain email.openai.com SPF record.' },
      dkim: { status: 'PASS', selector: 'default', domain: 'email.openai.com', reason: 'DKIM RSA-2048 cryptographic signature validated successfully.' },
      dmarc: { status: 'PASS', policy: 'p=reject', alignment: 'ALIGNED', reason: '100% cryptographic alignment verified with domain DMARC policy.' },
      arc: { status: 'PASS', seal: 'valid', chain: 'Verified' }
    }
  },
  {
    id: 'preset-phish-openai',
    name: 'Example B: Phishing (openai-support-login.cc)',
    badge: 'CRITICAL (96/100)',
    riskScore: 96,
    threatLevel: 'CRITICAL',
    confidence: 99.4,
    subject: 'URGENT: Your OpenAI API Access Has Been Suspended - Password Reset Required',
    sender: 'OpenAI Security Desk <support@openai-support-login.cc>',
    replyTo: 'phish-harvest@external-drop.pw',
    recipient: 'security-lead@enterprise.com',
    date: '2026-09-04T09:15:00Z',
    messageId: '<20260904-alert-99124@openai-support-login.cc>',
    returnPath: '<bounces@external-drop.pw>',
    contentType: 'text/plain; charset=UTF-8',
    summary: 'Critical phishing attack detected from openai-support-login.cc. SPF/DKIM/DMARC failed, Reply-To mismatch, urgent password reset credential harvesting.',
    bodyText: `From: OpenAI Security Desk <support@openai-support-login.cc>
To: security-lead@enterprise.com
Subject: URGENT: Your OpenAI API Access Has Been Suspended - Password Reset Required
Date: Fri, 04 Sep 2026 09:15:00 +0000
Message-ID: <20260904-alert-99124@openai-support-login.cc>
Reply-To: phish-harvest@external-drop.pw
Return-Path: <bounces@external-drop.pw>
Authentication-Results: mx.google.com; spf=fail smtp.mailfrom=bounces@external-drop.pw; dkim=fail; dmarc=fail action=none header.from=openai-support-login.cc

URGENT SECURITY NOTIFICATION:
Your OpenAI API organization access will be permanently terminated within 2 hours due to an unauthorized authentication anomaly.

You must immediately perform an urgent password reset and verify your account credentials via the link below:
https://auth-reset.openai-support-login.cc/login/verify?token=9928104

Failure to complete this immediate action will result in immediate API key revocation.

OpenAI Security Team`,
    protocols: {
      spf: { status: 'FAIL', record: 'v=spf1 ~all', evaluatedIp: '185.220.101.45', reason: 'Sender origin IP 185.220.101.45 is explicitly rejected by domain SPF policy.' },
      dkim: { status: 'FAIL', selector: 'default', domain: 'openai-support-login.cc', reason: 'Cryptographic DKIM RSA-2048 signature verification failed.' },
      dmarc: { status: 'FAIL', policy: 'p=none', alignment: 'UNALIGNED', reason: 'Header From (openai-support-login.cc) failed alignment with SPF/DKIM validation policy.' },
      arc: { status: 'FAIL', seal: 'invalid', chain: 'Broken' }
    }
  },
  {
    id: 'preset-bec-wire',
    name: 'State-Sponsored BEC & Wire Fraud',
    badge: 'Critical BEC',
    riskScore: 96,
    threatLevel: 'CRITICAL',
    confidence: 99.4,
    subject: 'URGENT: Approved Acquisition Payment Routing Authorization [CONFIDENTIAL]',
    sender: 'Satya Nadella <ceo-office@microsoft-exec-portal.cc>',
    replyTo: 'finance-reconciliation@fin-direct-offshore.pw',
    recipient: 'cfo-team@enterprise-defense.gov.in',
    date: '2026-09-03T10:14:22Z',
    messageId: '<20260903-BEC-EXEC-991204@microsoft-exec-portal.cc>',
    returnPath: '<bounce-exec@fin-direct-offshore.pw>',
    contentType: 'text/html; charset=UTF-8',
    summary: 'Executive impersonation utilizing a lookalike domain (microsoft-exec-portal.cc) targeting corporate CFO. Contains coerced wire transfer instructions to an offshore banking routing code.',
    bodyText: `CONFIDENTIAL EXECUTIVE DIRECTIVE
From: Office of the Chief Executive Officer
To: Corporate Financial Operations / CFO

Team,
Pursuant to our NDA regarding Project Titan (Strategic Infrastructure Acquisition), please execute the expedited payment wire of $2,450,000 USD immediately to the escrow clearing account below before 17:00 IST today.

Beneficiary Bank: Offshore Escrow Clearing AG (Zurich Branch)
IBAN: DE89 3704 0044 0532 0130 00
Routing/SWIFT: DEUTDEDDFXX
Reference Code: SIH-2026-TITAN-ESCROW

Do not discuss this on open Slack or email channels due to SEC quiet period regulations. Confirm execution directly via the encrypted link below.

Verification Portal: https://secure-exec-auth.microsoft-exec-portal.cc/wire/confirm?tx=99104

Regards,
Satya Nadella
Chief Executive Officer`,
    protocols: {
      spf: { status: 'FAIL', record: 'v=spf1 include:_spf.microsoft.com -all', evaluatedIp: '185.220.101.45', reason: 'Sender IP 185.220.101.45 is not authorized by domain SPF policy' },
      dkim: { status: 'FAIL', selector: 'selector1', domain: 'microsoft-exec-portal.cc', reason: 'RSA Signature validation mismatch. Domain does not hold valid private key' },
      dmarc: { status: 'FAIL', policy: 'p=reject', alignment: 'UNALIGNED', reason: 'Header From (microsoft-exec-portal.cc) failed alignment with SPF/DKIM' },
      arc: { status: 'FAIL', seal: 'invalid', chain: 'Broken at hop 2' }
    },
    relayTimeline: [
      { hop: 1, host: 'tor-exit-node-04.kyiv-relay.net', ip: '185.220.101.45', location: 'Offshore Relay Network', latency: '42ms', tls: 'TLS 1.3 (AES_256_GCM)', timestamp: '10:14:22 UTC', auth: 'UNAUTHENTICATED' },
      { hop: 2, host: 'vps-offshore.bulletproof-mta.cc', ip: '45.154.255.89', location: 'Bucharest, Romania', latency: '68ms', tls: 'TLS 1.2 (ECDHE-RSA)', timestamp: '10:14:25 UTC', auth: 'SPF=Fail' },
      { hop: 3, host: 'smtp-out-cluster.relay-shield.io', ip: '194.26.29.112', location: 'Bucharest, Romania', latency: '35ms', tls: 'TLS 1.3', timestamp: '10:14:27 UTC', auth: 'DKIM=Invalid' },
      { hop: 4, host: 'mx1.enterprise-defense.gov.in', ip: '203.115.112.50', location: 'New Delhi, India', latency: '120ms', tls: 'TLS 1.3 (Enforced)', timestamp: '10:14:31 UTC', auth: 'DMARC=Reject Action' }
    ],
    geoTrace: {
      originIp: '185.220.101.45',
      reverseDns: 'tor-exit45.relays.privacy-routing.net',
      country: 'Romania',
      countryCode: 'RO',
      city: 'Bucharest',
      region: 'Ilfov',
      latitude: 44.4268,
      longitude: 26.1025,
      isp: 'M247 Europe Host AS',
      asn: 'AS9009 M247 Ltd',
      threatFlags: {
        isVpn: true,
        isTor: true,
        isProxy: true,
        isBulletproof: true,
        botnetScore: '94/100 (Known Threat Actor Cluster)'
      }
    },
    domainIntel: {
      domain: 'microsoft-exec-portal.cc',
      lookalikeTarget: 'microsoft.com',
      typosquatScore: '98% Typosquatting Similarity (Homoglyph & Brand Abuse)',
      registrar: 'Porkbun LLC / Anonymous Proxy Registrar',
      domainAge: '3 days old (Registered Aug 31, 2026)',
      createdDate: '2026-08-31T14:20:00Z',
      expiryDate: '2027-08-31T14:20:00Z',
      whoisPrivacy: 'Redacted for Privacy (Withheld Identity)',
      reputationScore: '9/100 (Critical Malicious Reputation)',
      blacklists: [
        { name: 'Spamhaus SBL/XBL', listed: true, details: 'Listed in malicious sender blocklist' },
        { name: 'VirusTotal Intelligence', listed: true, details: '18/92 Security Vendors flagged domain as Malicious' },
        { name: 'SURBL Threat DB', listed: true, details: 'Active phishing URL domain' },
        { name: 'Google Safe Browsing', listed: true, details: 'Deceptive site ahead warning' }
      ],
      dnsRecords: {
        a: ['185.220.101.45', '45.154.255.89'],
        mx: ['10 mail.microsoft-exec-portal.cc'],
        txt: ['v=spf1 ~all'],
        ns: ['ns1.anonymous-dns-node.org', 'ns2.anonymous-dns-node.org']
      },
      sslCert: {
        issuer: "Let's Encrypt Authority X3 (Free Automated SSL)",
        validUntil: '2026-11-29',
        subject: 'CN=microsoft-exec-portal.cc',
        san: ['microsoft-exec-portal.cc', 'secure-exec-auth.microsoft-exec-portal.cc']
      }
    },
    aiAnalysis: {
      intent: 'Business Email Compromise (BEC) & Unauthorized Wire Transfer Routing',
      becIndicators: [
        { label: 'Executive Impersonation', status: 'CRITICAL', desc: 'Pretends to be Chief Executive Officer Satya Nadella' },
        { label: 'Financial Wire Coercion', status: 'CRITICAL', desc: 'Demands expedited $2.45M transfer with strict timeline' },
        { label: 'Secrecy & Anti-Verification Mandate', status: 'HIGH', desc: 'Directs victim not to verify over Slack/internal channels' },
        { label: 'Reply-To Divergence', status: 'CRITICAL', desc: 'Responses routed to unrelated offshore drop domain (fin-direct-offshore.pw)' }
      ],
      urls: [
        {
          rawUrl: 'https://secure-exec-auth.microsoft-exec-portal.cc/wire/confirm?tx=99104',
          destinationDomain: 'microsoft-exec-portal.cc',
          destinationIp: '185.220.101.45',
          category: 'Phishing Credential Harvester',
          safetyVerdict: 'MALICIOUS',
          redirectionHops: 2,
          pageTitle: 'Microsoft Identity Single Sign-On Fake Clone'
        }
      ],
      attachments: [
        {
          name: 'Project_Titan_Wire_Authorization.pdf',
          size: '142 KB',
          sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          mimeType: 'application/pdf',
          entropy: 7.82,
          verdict: 'Suspicious Embedded JavaScript & Fake Form Actions',
          yaraRules: ['Detect_PhishPDF_URI_Exploit', 'Suspicious_External_Form_Submit']
        }
      ],
      socRecommendations: [
        'Block sender IP 185.220.101.45 and ASN AS9009 at corporate border firewalls immediately.',
        'Sinkhole domain microsoft-exec-portal.cc and fin-direct-offshore.pw across enterprise DNS resolvers.',
        'Trigger automated M365 session token revocation for recipient account.',
        'Notify corporate treasury to freeze reference code SIH-2026-TITAN-ESCROW in payment systems.',
        'Escalate incident report to CERT-In and National Cyber Crime Reporting Portal (NCRP).'
      ]
    }
  },
  {
    id: 'preset-m365-oauth',
    name: 'M365 OAuth Token Hijack & Device Phish',
    badge: 'Token Hijack',
    riskScore: 92,
    threatLevel: 'CRITICAL',
    confidence: 98.7,
    subject: 'Action Required: Microsoft 365 Security Certificate Revocation & Mandatory Re-Authentication',
    sender: 'Microsoft Security Command <no-reply@auth-update-m365.online>',
    replyTo: 'identity-sec@auth-update-m365.online',
    recipient: 'it-admin@enterprise.in',
    date: '2026-09-03T11:45:00Z',
    messageId: '<20260903-MS-SEC-77812@auth-update-m365.online>',
    returnPath: '<bounces@auth-update-m365.online>',
    contentType: 'text/html; charset=UTF-8',
    summary: 'OAuth device phishing campaign spoofing Microsoft 365 Identity Security. Attempts to harvest enterprise session tokens bypassing Multi-Factor Authentication (MFA).',
    bodyText: `From: "Microsoft Security Command" <no-reply@auth-update-m365.online>
To: it-admin@enterprise.in
Reply-To: identity-sec@auth-update-m365.online
Return-Path: <bounces@auth-update-m365.online>
Date: Thu, 03 Sep 2026 11:45:00 +0000
Subject: Action Required: Microsoft 365 Security Certificate Revocation & Mandatory Re-Authentication
Message-ID: <20260903-MS-SEC-77812@auth-update-m365.online>
X-Originating-IP: [193.106.191.77]
Authentication-Results: mx.google.com; spf=fail smtp.mailfrom=bounces@auth-update-m365.online; dkim=fail; dmarc=fail header.from=auth-update-m365.online
Content-Type: text/plain; charset="UTF-8"

Microsoft Security Center Alert
Tenant ID: MS-TENANT-99120

Attention Enterprise Administrator,
A TLS certificate mismatch was detected on your Microsoft Entra ID tenant. Your enterprise federated SSO tokens will expire within 120 minutes.

To prevent disruption to Microsoft Teams, Exchange Online, and OneDrive services, authenticate via the Microsoft Identity Protection portal:
https://login-microsoft365-verify.auth-update-m365.online/sso/v2?device=session-sync

Alternatively, approve the device login prompt from your Authenticator app using pairing code: 884-219.

Microsoft Security Operations Center
Redmond, WA`,
    protocols: {
      spf: { status: 'SOFTFAIL', record: 'v=spf1 ip4:193.106.191.0/24 ~all', evaluatedIp: '193.106.191.77', reason: 'IP in range but domain has unauthenticated origin' },
      dkim: { status: 'FAIL', selector: 'default', domain: 'auth-update-m365.online', reason: 'Selector key missing in DNS TXT lookup' },
      dmarc: { status: 'FAIL', policy: 'p=none', alignment: 'UNALIGNED', reason: 'Domain lacks strict DMARC rejection policy (Vulnerable)' },
      arc: { status: 'NONE', seal: 'none', chain: 'No ARC signatures present' }
    },
    relayTimeline: [
      { hop: 1, host: 'node77.cloud-vps-russia.org', ip: '193.106.191.77', location: 'Saint Petersburg, Russia', latency: '51ms', tls: 'TLS 1.2', timestamp: '11:45:00 UTC', auth: 'UNAUTHENTICATED' },
      { hop: 2, host: 'mx-gateway.transit-nl.net', ip: '89.208.107.12', location: 'Haarlem, Netherlands', latency: '40ms', tls: 'TLS 1.3', timestamp: '11:45:02 UTC', auth: 'SPF=SoftFail' },
      { hop: 3, host: 'ingress-filter.enterprise.in', ip: '103.24.120.5', location: 'Bengaluru, India', latency: '95ms', tls: 'TLS 1.3 (Enforced)', timestamp: '11:45:06 UTC', auth: 'DMARC=Flagged' }
    ],
    geoTrace: {
      originIp: '193.106.191.77',
      reverseDns: 'host77.bulletproof-servers-spb.ru',
      country: 'Russia',
      countryCode: 'RU',
      city: 'Saint Petersburg',
      region: 'Northwestern Federal District',
      latitude: 59.9343,
      longitude: 30.3351,
      isp: 'Selectel Network / Offshore Hosting AS',
      asn: 'AS49505 Selectel',
      threatFlags: {
        isVpn: false,
        isTor: false,
        isProxy: true,
        isBulletproof: true,
        botnetScore: '88/100 (Hostile C2 Infrastructure)'
      }
    },
    domainIntel: {
      domain: 'auth-update-m365.online',
      lookalikeTarget: 'login.microsoftonline.com',
      typosquatScore: '94% Brand Infringement',
      registrar: 'Hostinger Operations, UAB',
      domainAge: '1 day old (Registered Sep 02, 2026)',
      createdDate: '2026-09-02T08:11:00Z',
      expiryDate: '2027-09-02T08:11:00Z',
      whoisPrivacy: 'Privacy Protected by Withheld for Privacy ehf',
      reputationScore: '4/100 (Active Phishing Campaign)',
      blacklists: [
        { name: 'Spamhaus DBL', listed: true, details: 'Phishing domain blacklist' },
        { name: 'PhishTank', listed: true, details: 'Verified credential harvester' },
        { name: 'Google Safe Browsing', listed: true, details: 'Flagged as deceptive OAuth portal' }
      ],
      dnsRecords: {
        a: ['193.106.191.77'],
        mx: ['10 mail.auth-update-m365.online'],
        txt: ['v=spf1 ~all'],
        ns: ['ns1.hostinger.com', 'ns2.hostinger.com']
      },
      sslCert: {
        issuer: 'ZeroSSL RSA Domain Secure CA',
        validUntil: '2026-12-02',
        subject: 'CN=auth-update-m365.online',
        san: ['auth-update-m365.online', '*.auth-update-m365.online']
      }
    },
    aiAnalysis: {
      intent: 'Adversary-in-the-Middle (AiTM) Reverse Proxy & Session Token Exfiltration',
      becIndicators: [
        { label: 'Brand Spoofing', status: 'CRITICAL', desc: 'Mimics Microsoft Entra ID Security branding and messaging format' },
        { label: 'Time Pressure Urgency', status: 'HIGH', desc: '120-minute countdown pressure to force panic click' },
        { label: 'MFA Bypass Architecture', status: 'CRITICAL', desc: 'Uses Evilginx2 reverse proxy to capture session cookies and PRT tokens' }
      ],
      urls: [
        {
          rawUrl: 'https://login-microsoft365-verify.auth-update-m365.online/sso/v2?device=session-sync',
          destinationDomain: 'auth-update-m365.online',
          destinationIp: '193.106.191.77',
          category: 'AiTM Phishing Proxy',
          safetyVerdict: 'MALICIOUS',
          redirectionHops: 3,
          pageTitle: 'Sign in to your account - Microsoft Entra ID'
        }
      ],
      attachments: [],
      socRecommendations: [
        'Enforce FIDO2 WebAuthn / Passkey phishing-resistant hardware MFA keys immediately.',
        'Invalidate all active Azure AD / Entra ID refresh tokens across IT administrator accounts.',
        'Add auth-update-m365.online to Defender for Office 365 Tenant Allow/Block Lists (TABL).'
      ]
    }
  },
  {
    id: 'preset-clean-payroll',
    name: 'Verified Clean Corporate Payroll Notice',
    badge: 'Legitimate',
    riskScore: 4,
    threatLevel: 'SAFE',
    confidence: 99.8,
    subject: 'Your Monthly Payslip & Form 16 Tax Computation - August 2026',
    sender: 'Enterprise HR Operations <payroll@defense-organization.com>',
    replyTo: 'payroll@defense-organization.com',
    recipient: 'employee@defense-organization.com',
    date: '2026-09-01T06:00:00Z',
    messageId: '<20260901-PAYROLL-DEF-10029@defense-organization.com>',
    returnPath: '<bounces@defense-organization.com>',
    contentType: 'text/html; charset=UTF-8',
    summary: 'Standard corporate HR payroll and tax advisory. All cryptographic email authentication protocols (SPF, DKIM 2048-bit, DMARC p=reject) passed with 100% domain alignment.',
    bodyText: `From: "Enterprise HR Operations" <payroll@defense-organization.com>
To: employee@defense-organization.com
Reply-To: payroll@defense-organization.com
Return-Path: <bounces@defense-organization.com>
Date: Tue, 01 Sep 2026 06:00:00 +0000
Subject: Your Monthly Payslip & Form 16 Tax Computation - August 2026
Authentication-Results: mx.google.com; spf=pass (google.com: domain of bounces@defense-organization.com designates 52.96.112.45 as permitted sender); dkim=pass header.i=@defense-organization.com; dmarc=pass (p=REJECT) header.from=defense-organization.com
Content-Type: text/plain; charset="UTF-8"

Defense Organization HR Portal
Monthly Payroll Confirmation

Dear Team Member,

Your compensation statement and tax deductions for August 2026 have been credited to your registered corporate bank account.

You may download your password-protected monthly payslip via the internal Workday employee portal:
https://portal.defense-organization.com/ess/payslips/aug2026

Password hint: First 4 letters of PAN (Uppercase) + Birth Year (YYYY).

Regards,
Corporate Payroll & Benefits Team
Defense Organization India`,
    protocols: {
      spf: { status: 'PASS', record: 'v=spf1 ip4:52.96.112.45 include:spf.protection.outlook.com -all', evaluatedIp: '52.96.112.45', reason: 'Origin IP is fully authorized in SPF record' },
      dkim: { status: 'PASS', selector: 'corp2026', domain: 'defense-organization.com', reason: 'Cryptographic signature verified with 2048-bit RSA key' },
      dmarc: { status: 'PASS', policy: 'p=reject', alignment: 'ALIGNED (100%)', reason: 'Both SPF and DKIM passed and aligned with From domain' },
      arc: { status: 'PASS', seal: 'valid', chain: 'Verified End-to-End' }
    },
    relayTimeline: [
      { hop: 1, host: 'mail-m365-sg.protection.outlook.com', ip: '52.96.112.45', location: 'Singapore', latency: '22ms', tls: 'TLS 1.3 (Enforced)', timestamp: '06:00:00 UTC', auth: 'PASS' },
      { hop: 2, host: 'inbound-mx.defense-organization.com', ip: '103.21.244.10', location: 'Bengaluru, India', latency: '31ms', tls: 'TLS 1.3 (Strict)', timestamp: '06:00:02 UTC', auth: 'PASS' }
    ],
    geoTrace: {
      originIp: '52.96.112.45',
      reverseDns: 'mail-sg2.protection.outlook.com',
      country: 'Singapore',
      countryCode: 'SG',
      city: 'Singapore',
      region: 'Central Singapore',
      latitude: 1.3521,
      longitude: 103.8198,
      isp: 'Microsoft Corporation / Azure Cloud Infrastructure',
      asn: 'AS8075 Microsoft Corporation',
      threatFlags: {
        isVpn: false,
        isTor: false,
        isProxy: false,
        isBulletproof: false,
        botnetScore: '0/100 (Legitimate Enterprise Infrastructure)'
      }
    },
    domainIntel: {
      domain: 'defense-organization.com',
      lookalikeTarget: 'None',
      typosquatScore: '0% (Verified Enterprise Domain)',
      registrar: 'MarkMonitor, Inc. (Enterprise Registrar)',
      domainAge: '14 years old (Registered Feb 2012)',
      createdDate: '2012-02-14T00:00:00Z',
      expiryDate: '2028-02-14T00:00:00Z',
      whoisPrivacy: 'Enterprise Corporate Ownership Verified',
      reputationScore: '99/100 (Clean & Trusted Enterprise)',
      blacklists: [
        { name: 'Spamhaus SBL', listed: false, details: 'Clean' },
        { name: 'SURBL', listed: false, details: 'Clean' },
        { name: 'Cisco Talos', listed: false, details: 'High Reputation' },
        { name: 'Google Safe Browsing', listed: false, details: 'Clean' }
      ],
      dnsRecords: {
        a: ['103.21.244.10'],
        mx: ['10 defenseorganization-com.mail.protection.outlook.com'],
        txt: ['v=spf1 include:spf.protection.outlook.com -all', 'v=DMARC1; p=reject; rua=mailto:dmarc@defense-organization.com'],
        ns: ['ns1.markmonitor.com', 'ns2.markmonitor.com']
      },
      sslCert: {
        issuer: 'DigiCert Global Root CA (Extended Validation EV)',
        validUntil: '2027-05-15',
        subject: 'CN=portal.defense-organization.com',
        san: ['*.defense-organization.com', 'defense-organization.com']
      }
    },
    aiAnalysis: {
      intent: 'Legitimate Internal Enterprise HR / Payroll Advisory',
      becIndicators: [
        { label: 'Legitimate Internal Communication', status: 'SAFE', desc: 'No urgency coercion, no unusual recipient divergence' },
        { label: 'Domain & Cryptographic Alignment', status: 'SAFE', desc: 'Full SPF/DKIM/DMARC alignment' }
      ],
      urls: [
        {
          rawUrl: 'https://portal.defense-organization.com/ess/payslips/aug2026',
          destinationDomain: 'defense-organization.com',
          destinationIp: '103.21.244.10',
          category: 'Verified Internal Enterprise Portal',
          safetyVerdict: 'SAFE',
          redirectionHops: 0,
          pageTitle: 'Defense Organization Employee Self Service'
        }
      ],
      attachments: [],
      socRecommendations: [
        'No intervention required. Email passed all automated and cryptographic security controls.'
      ]
    }
  }
];

export const MOCK_CASES = [
  {
    id: 'CASE-2026-0891',
    title: 'Acquisition Wire Fraud Impersonating CEO Satya Nadella',
    severity: 'CRITICAL',
    status: 'In Progress',
    assignedTo: 'Vikram Mehta (Lead Threat Hunter)',
    threatType: 'Business Email Compromise (BEC)',
    riskScore: 96,
    originCountry: 'Offshore Proxy Node (Romania / AS9009)',
    targetDomain: 'microsoft-exec-portal.cc',
    createdAt: '2026-09-03T10:20:00Z',
    updatedAt: '2026-09-03T11:05:00Z',
    notes: [
      { id: 'n1', author: 'Vikram Mehta', text: 'Confirmed IP 185.220.101.45 is a known Tor exit node used in recent APT financial fraud campaign.', timestamp: '2026-09-03 10:25 UTC' },
      { id: 'n2', author: 'Priya Sharma (SOC L2)', text: 'CFO notified via telephone. Escrow reference frozen in core banking gateway.', timestamp: '2026-09-03 10:48 UTC' }
    ],
    iocs: {
      ips: ['185.220.101.45', '45.154.255.89', '194.26.29.112'],
      domains: ['microsoft-exec-portal.cc', 'fin-direct-offshore.pw'],
      hashes: ['e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855']
    },
    sampleId: 'preset-bec-wire'
  },
  {
    id: 'CASE-2026-0888',
    title: 'Adversary-in-the-Middle M365 Session Token Exfiltration',
    severity: 'CRITICAL',
    status: 'Mitigated',
    assignedTo: 'Ananya Roy (Senior SOC Analyst)',
    threatType: 'OAuth / AiTM Phishing',
    riskScore: 92,
    originCountry: 'Russia (Saint Petersburg)',
    targetDomain: 'auth-update-m365.online',
    createdAt: '2026-09-02T16:10:00Z',
    updatedAt: '2026-09-03T09:12:00Z',
    notes: [
      { id: 'n1', author: 'Ananya Roy', text: 'Evilginx2 reverse proxy identified on host 193.106.191.77.', timestamp: '2026-09-02 16:30 UTC' }
    ],
    iocs: {
      ips: ['193.106.191.77', '89.208.107.12'],
      domains: ['auth-update-m365.online'],
      hashes: []
    },
    sampleId: 'preset-m365-oauth'
  },
  {
    id: 'CASE-2026-0874',
    title: 'Targeted NIC / MeitY Gov.in Single Sign-On Impersonation',
    severity: 'HIGH',
    status: 'Open',
    assignedTo: 'Rahul Sen (Gov Security Liaison)',
    threatType: 'Government Impersonation / APT',
    riskScore: 91,
    originCountry: 'Singapore (Asia DC)',
    targetDomain: 'nic-gov-in-portal.xyz',
    createdAt: '2026-09-03T08:30:00Z',
    updatedAt: '2026-09-03T08:55:00Z',
    notes: [
      { id: 'n1', author: 'Rahul Sen', text: 'Escalated to National Cyber Coordination Centre (NCCC) & CERT-In for emergency DNS sinkholing.', timestamp: '2026-09-03 08:55 UTC' }
    ],
    iocs: {
      ips: ['45.134.144.18'],
      domains: ['nic-gov-in-portal.xyz'],
      hashes: []
    },
    sampleId: 'preset-nic-gov'
  }
];
