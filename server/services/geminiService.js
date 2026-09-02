const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

/**
 * Parses raw .eml / MIME text and extracts comprehensive email metadata.
 *
 * @param {string} rawContent - Raw email or .eml MIME text
 * @returns {Object} Structured email components
 */
function parseEmlFile(rawContent) {
  const text = rawContent || "";
  const lines = text.split(/\r?\n/);

  let inHeaders = true;
  const headerLines = [];
  const bodyLines = [];

  for (const line of lines) {
    if (inHeaders) {
      if (line.trim() === "") {
        inHeaders = false;
      } else {
        headerLines.push(line);
      }
    } else {
      bodyLines.push(line);
    }
  }

  const rawHeaders = headerLines.join("\n");
  const rawBody = bodyLines.join("\n").trim();

  // Extract primary headers
  const getHeader = (name) => {
    const regex = new RegExp(`^${name}:\\s*(.+)`, "im");
    const match = rawHeaders.match(regex);
    return match ? match[1].trim() : "";
  };

  const fromHeader = getHeader("From") || (text.match(/From:\s*(.+)/i) ? text.match(/From:\s*(.+)/i)[1].trim() : "Unknown Sender");
  const replyTo = getHeader("Reply-To") || "";
  const returnPath = getHeader("Return-Path") || "";
  const subject = getHeader("Subject") || (text.match(/Subject:\s*(.+)/i) ? text.match(/Subject:\s*(.+)/i)[1].trim() : "Analyzed Email Assessment");
  const messageId = getHeader("Message-ID") || "";

  // Extract Received headers
  const receivedHeaders = [];
  const receivedRegex = /^Received:\s*(.+?)(?=\n[^\t\s]|\n*$)/gims;
  let receivedMatch;
  while ((receivedMatch = receivedRegex.exec(rawHeaders)) !== null) {
    receivedHeaders.push(receivedMatch[1].replace(/\s+/g, " ").trim());
  }

  // Extract Authentication headers (SPF, DKIM, DMARC)
  const authResults = getHeader("Authentication-Results");
  const receivedSpf = getHeader("Received-SPF");
  const dkimSignature = getHeader("DKIM-Signature");

  const spfHeaderCombined = `${receivedSpf} ${authResults}`.trim();
  const dkimHeaderCombined = `${dkimSignature ? "DKIM-Signature present" : ""} ${authResults}`.trim();
  const dmarcHeaderCombined = authResults;

  // Extract all URLs
  const urlRegex = /(https?:\/\/[^\s"'<>]+)/gi;
  const allUrls = text.match(urlRegex) || [];
  const uniqueUrls = [...new Set(allUrls)];

  // Parse sender email & display name
  let senderEmail = "";
  let displayName = "";
  const emailMatch = fromHeader.match(/<([^>]+)>/);
  if (emailMatch) {
    senderEmail = emailMatch[1].trim().toLowerCase();
    displayName = fromHeader.replace(emailMatch[0], "").replace(/["']/g, "").trim();
  } else {
    const rawEmail = fromHeader.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    senderEmail = rawEmail ? rawEmail[0].toLowerCase() : fromHeader.toLowerCase();
    displayName = fromHeader.replace(senderEmail, "").replace(/["':<>]/g, "").trim();
  }

  return {
    from: fromHeader,
    senderEmail,
    displayName,
    replyTo,
    returnPath,
    subject,
    messageId,
    receivedHeaders,
    rawHeaders,
    spfHeader: spfHeaderCombined,
    dkimHeader: dkimHeaderCombined,
    dmarcHeader: dmarcHeaderCombined,
    urls: uniqueUrls,
    body: rawBody || text,
  };
}

/**
 * Strict JSON Schema definition for Gemini 3.5 Flash Lite.
 */
const phishGuardSchema = {
  type: SchemaType.OBJECT,
  properties: {
    riskScore: {
      type: SchemaType.INTEGER,
      description: "Calculated risk score between 0 and 100 based on forensic evidence",
    },
    confidence: {
      type: SchemaType.NUMBER,
      description: "Confidence percentage between 0 and 100",
    },
    verdict: {
      type: SchemaType.STRING,
      description: "Threat status verdict: SAFE, SUSPICIOUS, or HIGH RISK",
    },
    executiveSummary: {
      type: SchemaType.STRING,
      description: "Concise summary under 60 words explaining the findings",
    },
    threatFactors: {
      type: SchemaType.ARRAY,
      description: "List of identified threat factors",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          severity: { type: SchemaType.STRING },
        },
        required: ["title", "description", "severity"],
      },
    },
    authentication: {
      type: SchemaType.OBJECT,
      properties: {
        spf: {
          type: SchemaType.OBJECT,
          properties: {
            status: { type: SchemaType.STRING },
            reason: { type: SchemaType.STRING },
          },
          required: ["status", "reason"],
        },
        dkim: {
          type: SchemaType.OBJECT,
          properties: {
            status: { type: SchemaType.STRING },
            reason: { type: SchemaType.STRING },
          },
          required: ["status", "reason"],
        },
        dmarc: {
          type: SchemaType.OBJECT,
          properties: {
            status: { type: SchemaType.STRING },
            reason: { type: SchemaType.STRING },
          },
          required: ["status", "reason"],
        },
      },
      required: ["spf", "dkim", "dmarc"],
    },
    urls: {
      type: SchemaType.ARRAY,
      description: "List of analyzed extracted URLs",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          url: { type: SchemaType.STRING },
          reputation: { type: SchemaType.STRING },
          risk: { type: SchemaType.STRING },
        },
        required: ["url", "reputation", "risk"],
      },
    },
    recommendation: {
      type: SchemaType.STRING,
      description: "Actionable defense recommendation",
    },
  },
  required: [
    "riskScore",
    "confidence",
    "verdict",
    "executiveSummary",
    "threatFactors",
    "authentication",
    "urls",
    "recommendation",
  ],
};

/**
 * Helper to determine if an error from Gemini is retryable (429 rate limit/quota or 503 temporary overload).
 */
function isRetryableError(err) {
  if (!err) return false;
  const status = err.status || err.statusCode || (err.response && err.response.status);
  if (status === 429 || status === 503) return true;

  const msg = String(err.message || "").toLowerCase();
  return (
    msg.includes("429") ||
    msg.includes("503") ||
    msg.includes("resourceexhausted") ||
    msg.includes("resource_exhausted") ||
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("too many requests") ||
    msg.includes("overload") ||
    msg.includes("temporarily unavailable") ||
    msg.includes("high demand") ||
    msg.includes("service unavailable") ||
    msg.includes("fetch failed") ||
    msg.includes("econnreset") ||
    msg.includes("etimedout")
  );
}

/**
 * Helper to extract server-suggested retry delay from Google API error response.
 * Example error message: "Please retry in 14.911972662s" or "retryDelay":"14s"
 */
function getRetryDelayMs(err, attemptIndex) {
  const fallbackDelays = [2000, 4000, 8000, 16000, 20000];
  const defaultDelay = fallbackDelays[Math.min(attemptIndex - 1, fallbackDelays.length - 1)] || 2000;

  if (!err) return defaultDelay;
  const msg = String(err.message || "");

  // Match "Please retry in 14.91s" or similar
  const matchSeconds = msg.match(/Please retry in ([0-9]+(?:\.[0-9]+)?)s/i);
  if (matchSeconds && matchSeconds[1]) {
    const sec = parseFloat(matchSeconds[1]);
    if (!isNaN(sec) && sec > 0) {
      // Add a 500ms safety buffer, cap at 30 seconds
      return Math.min(Math.ceil(sec * 1000) + 500, 30000);
    }
  }

  // Match "retryDelay":"14s"
  const matchJsonDelay = msg.match(/"retryDelay"\s*:\s*"([0-9]+)s"/i);
  if (matchJsonDelay && matchJsonDelay[1]) {
    const sec = parseInt(matchJsonDelay[1], 10);
    if (!isNaN(sec) && sec > 0) {
      return Math.min((sec + 1) * 1000, 30000);
    }
  }

  return defaultDelay;
}

/**
 * Sends parsed email data to Gemini 3.5 Flash Lite with up to 5 automatic retries for 429/503.
 *
 * @param {string} emailContent - Raw email or .eml MIME text
 * @returns {Promise<Object>} Pure AI-evaluated threat report
 */
async function analyzeEmailWithGemini(emailContent) {
  const parsedEmail = parseEmlFile(emailContent);
  const apiKey = (process.env.GEMINI_API_KEY || "").trim().replace(/^["']|["']$/g, "");

  if (!apiKey) {
    const keyErr = new Error("GEMINI_API_KEY is missing or empty in server/.env. Please configure your API key.");
    keyErr.statusCode = 500;
    throw keyErr;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const forensicPrompt = `
You are an advanced cybersecurity threat intelligence AI performing an in-depth forensic email inspection.

Analyze the parsed email components below and calculate an accurate risk score.

EMAIL FORENSIC DATA:
- From: ${parsedEmail.from}
- Sender Address: ${parsedEmail.senderEmail}
- Display Name: ${parsedEmail.displayName || "None"}
- Reply-To: ${parsedEmail.replyTo || "None"}
- Return-Path: ${parsedEmail.returnPath || "None"}
- Subject: ${parsedEmail.subject}
- Message-ID: ${parsedEmail.messageId || "None"}
- SPF Header Record: ${parsedEmail.spfHeader || "No SPF record in header"}
- DKIM Header Record: ${parsedEmail.dkimHeader || "No DKIM signature in header"}
- DMARC Header Record: ${parsedEmail.dmarcHeader || "No DMARC record in header"}
- Received Headers: ${parsedEmail.receivedHeaders.length > 0 ? parsedEmail.receivedHeaders.slice(0, 3).join(" | ") : "None"}
- Extracted URLs (${parsedEmail.urls.length}): ${parsedEmail.urls.length > 0 ? parsedEmail.urls.join(", ") : "None"}

EMAIL BODY:
"""
${parsedEmail.body.substring(0, 6000)}
"""

CRITICAL FORENSIC SCORING & DECISION RULES:
1. AUTHENTICATION IS NOT A GUARANTEE OF SAFETY:
   - SPF, DKIM, and DMARC passing ONLY proves the email originated from the domain in the envelope. Attackers regularly register domains or use compromised infrastructure where SPF/DKIM/DMARC pass.
   - A phishing email, scam, or impersonation attack MUST NEVER be marked SAFE (0–30) simply because SPF, DKIM, or DMARC passed. Treat SPF/DKIM/DMARC as supporting technical evidence only, NOT the primary verdict driver.

2. BRAND & INSTITUTION IMPERSONATION (HEAVILY INCREASES RISK):
   - Heavily increase risk if the message claims to represent a recognized brand, bank (e.g. SBI, HDFC, ICICI, Chase, Bank of America), educational/certifying body (e.g. NPTEL, APSCHE, colleges, universities, Coursera, Automation Anywhere), government agency (e.g. IRS, Tax portal, EPFO), or tech company (e.g. Microsoft 365, Google, GitHub, PayPal, Netflix), but the sender domain is NOT the verified official domain of that organization (e.g. using free webmail like @gmail.com, @outlook.com, lookalike typosquat domains, or unrelated third-party servers).
   - Impersonation of trusted entities with mismatched sender domains MUST be assigned HIGH RISK (71–100).

3. URGENCY & PSYCHOLOGICAL MANIPULATION (INCREASES RISK):
   - The presence of artificial urgency cues (e.g. "today", "immediate action required", "verify your account", "final notice", "payment required within 24 hours", "suspended if not updated", "claim your refund now") increases risk into SUSPICIOUS (31–70) or HIGH RISK (71–100).

4. CREDENTIAL HARVESTING & PAYMENT SOLICITATION (CRITICAL RISK):
   - Any links directing users to login portals, password resets, KYC verification forms, credit card entry, invoice wire payments, or gift card requests MUST be scored as HIGH RISK (71–100).

5. RISK BANDS & THRESHOLDS:
   - 0–30 = SAFE: Legitimate sender from verified official domain, no urgency manipulation, no credential/financial requests, clean links.
   - 31–70 = SUSPICIOUS: Unrecognized external sender, moderate urgency language, unusual attachment or link, ambiguous context requiring verification.
   - 71–100 = HIGH RISK: Brand impersonation, deceptive sender address, credential solicitation, financial fraud, phishing links, or high-pressure threats.

6. CONSISTENCY:
   - Be completely objective and deterministic. The exact same email content must always receive the same risk score and classification.
`;

  // Use Gemini 3.5 Flash Lite as the primary model
  const MODEL_NAME = "gemini-3.5-flash-lite";
  let lastError = null;

  const maxRetries = 5; // Up to 5 retry attempts
  const totalAttempts = 1 + maxRetries; // 6 attempts total (1 initial + 5 retries)

  for (let attempt = 1; attempt <= totalAttempts; attempt++) {
    try {
      const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: {
          temperature: 0.0,
          responseMimeType: "application/json",
          responseSchema: phishGuardSchema,
        },
      });

      const result = await model.generateContent(forensicPrompt);
      const responseText = result.response.text();

      // Sanitize JSON text in case of markdown wrapping
      let cleanedText = responseText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      let parsed;
      try {
        parsed = JSON.parse(cleanedText);
      } catch (parseErr) {
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw parseErr;
        }
      }

      const formattedThreats = Array.isArray(parsed.threatFactors) ? parsed.threatFactors : [];
      const flatReasons = formattedThreats.map((t) => (typeof t === "object" ? `${t.title}: ${t.description}` : t));

      const rawScore = typeof parsed.riskScore === "number" ? parsed.riskScore : 0;
      const score = Math.min(100, Math.max(0, Math.round(rawScore)));

      const verdict = score >= 71 ? "HIGH RISK" : score >= 31 ? "SUSPICIOUS" : "SAFE";
      const riskLevel = score >= 71 ? "High Risk" : score >= 31 ? "Suspicious" : "Safe";
      const execSummary = parsed.executiveSummary || "Forensic analysis completed.";

      const spfStatus = parsed.authentication?.spf?.status === "PASS" ? "Passed" : parsed.authentication?.spf?.status === "FAIL" ? "Failed" : "Unknown";
      const dkimStatus = parsed.authentication?.dkim?.status === "PASS" ? "Passed" : parsed.authentication?.dkim?.status === "FAIL" ? "Failed" : "Unknown";
      const dmarcStatus = parsed.authentication?.dmarc?.status === "PASS" ? "Passed" : parsed.authentication?.dmarc?.status === "FAIL" ? "Failed" : "Unknown";

      // If successful, immediately return the result
      return {
        riskScore: score,
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 98.0,
        verdict,
        executiveSummary: execSummary,
        threatFactors: formattedThreats,
        authentication: parsed.authentication || {
          spf: { status: spfStatus.toUpperCase(), reason: "Evaluated from header records." },
          dkim: { status: dkimStatus.toUpperCase(), reason: "Evaluated from header records." },
          dmarc: { status: dmarcStatus.toUpperCase(), reason: "Evaluated from header records." },
        },
        urls: Array.isArray(parsed.urls) ? parsed.urls : [],
        recommendation: parsed.recommendation || (score >= 71 ? "Quarantine this email immediately." : score >= 31 ? "Verify sender authenticity directly with the claimed organization." : "Standard digital hygiene recommended."),

        // Frontend & Supabase Schema Compatibility
        status: verdict,
        riskLevel: riskLevel,
        summary: execSummary,
        reasons: flatReasons.length > 0 ? flatReasons : ["No threat factors detected."],
        threats: flatReasons,
        subject: parsedEmail.subject,
        sender: parsedEmail.senderEmail,
        spf: spfStatus,
        dkim: dkimStatus,
        dmarc: dmarcStatus,
      };
    } catch (err) {
      lastError = err;
      const retryable = isRetryableError(err);

      if (attempt < totalAttempts && retryable) {
        const retryIndex = attempt; // 1 to 5
        const delayMs = getRetryDelayMs(err, retryIndex);
        console.warn(`[PhishGuard AI] Retry ${retryIndex} of ${maxRetries} (${MODEL_NAME} temporary error: ${err.message}). Retrying in ${(delayMs / 1000).toFixed(1)}s...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else if (!retryable) {
        // Non-retryable error, fail immediately without waiting
        break;
      }
    }
  }

  // All retries exhausted: return specific error message based on error type
  const is429 =
    lastError &&
    (lastError.status === 429 ||
      lastError.statusCode === 429 ||
      lastError.response?.status === 429 ||
      String(lastError.message).includes("429") ||
      String(lastError.message).toLowerCase().includes("quota") ||
      String(lastError.message).toLowerCase().includes("resourceexhausted") ||
      String(lastError.message).toLowerCase().includes("too many requests") ||
      String(lastError.message).toLowerCase().includes("rate limit"));

  const is503 =
    lastError &&
    !is429 &&
    (lastError.status === 503 ||
      lastError.statusCode === 503 ||
      lastError.response?.status === 503 ||
      String(lastError.message).includes("503") ||
      String(lastError.message).toLowerCase().includes("overload") ||
      String(lastError.message).toLowerCase().includes("high demand") ||
      String(lastError.message).toLowerCase().includes("service unavailable") ||
      String(lastError.message).toLowerCase().includes("temporarily unavailable") ||
      String(lastError.message).toLowerCase().includes("busy"));

  let errorMessage = "Gemini service is temporarily busy. Please retry in a few seconds.";
  let statusCode = 500;

  if (is429) {
    errorMessage = "Daily Gemini quota exceeded. Try later or use another API key.";
    statusCode = 429;
  } else if (is503) {
    errorMessage = "Gemini service is temporarily busy. Please retry in a few seconds.";
    statusCode = 503;
  } else if (lastError && lastError.message) {
    errorMessage = lastError.message;
    statusCode = lastError.statusCode || lastError.status || 500;
  }

  const finalError = new Error(errorMessage);
  finalError.statusCode = statusCode;
  finalError.is429 = is429;
  finalError.is503 = is503;
  finalError.originalError = lastError;
  throw finalError;
}

module.exports = {
  analyzeEmailWithGemini,
  parseEmlFile,
};
