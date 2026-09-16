const { analyzeEmailWithGemini } = require("../services/geminiService");
const {
  saveEmailHistory,
  getEmailHistory,
  getEmailHistoryById,
  deleteEmailHistory,
  getStats: getStatsFromSupabase,
  getCases: getCasesFromSupabase,
  getReportById: getReportFromSupabase,
} = require("../services/supabaseService");
const {
  generatePhishGuardPDF,
  getFormattedTimestampForFilename,
} = require("../services/pdfService");
const { resolveDomainIntelligence } = require("../services/domainIntelService");

/**
 * Controller to handle email analysis requests.
 * Supports multipart/form-data ('email' file) and JSON/text payloads.
 * Saves successful analysis records to Supabase email_history table.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
async function analyzeEmail(req, res) {
  res.setHeader("Content-Type", "application/json");
  try {
    const body = req.body || {};

    let emailText =
      body.emailText ||
      body.rawEmail ||
      body.content ||
      body.body ||
      body.text ||
      body.email ||
      (req.file && req.file.buffer ? req.file.buffer.toString("utf-8") : "") ||
      "";

    let subject = body.subject || "";
    let sender = body.sender || body.from || "";

    // Extract headers from emailText if sender or subject missing
    if ((!sender || !subject) && typeof emailText === "string") {
      const lines = emailText.split(/\r?\n/);
      for (const line of lines) {
        if (!sender && /^from:\s*(.+)/i.test(line)) {
          sender = line.match(/^from:\s*(.+)/i)[1].trim();
        }
        if (!subject && /^subject:\s*(.+)/i.test(line)) {
          subject = line.match(/^subject:\s*(.+)/i)[1].trim();
        }
        if (line.trim() === "" && sender && subject) break;
      }
    }

    if (!emailText || typeof emailText !== "string" || !emailText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email content is required",
        error: "Email content is required",
      });
    }

    const analysisResult = await analyzeEmailWithGemini(
      { sender, subject, emailText },
      subject,
      sender
    );

    // Ensure unique IDs and compatibility with both frontend investigation & Supabase models
    const uniqueReportId = require("crypto").randomUUID();
    const caseId = `CASE-2026-${uniqueReportId.slice(0, 8).toUpperCase()}`;

    analysisResult.id = uniqueReportId;
    analysisResult.caseId = caseId;
    analysisResult.historyId = uniqueReportId;

    // Automatically resolve domain intelligence for analyzed sender domain
    let senderDomain = "";
    const senderStr = analysisResult.sender || sender || "";
    if (senderStr) {
      const emailMatch = senderStr.match(/<([^>]+)>/) || [null, senderStr];
      const addr = emailMatch[1] || senderStr;
      if (addr && addr.includes("@")) {
        senderDomain = addr.split("@").pop().trim().replace(/[>]/g, "").toLowerCase();
      }
    }
    if (senderDomain) {
      analysisResult.senderDomain = senderDomain;
      try {
        const intel = await resolveDomainIntelligence(senderDomain);
        analysisResult.domainIntel = intel;
        analysisResult.domainIntelligence = intel;
      } catch (dErr) {
        console.warn("Domain intelligence resolution warning:", dErr.message);
      }
    }

    try {
      const savedRecord = await saveEmailHistory(analysisResult);
      if (savedRecord && savedRecord.id) {
        analysisResult.id = savedRecord.id;
        analysisResult.historyId = savedRecord.id;
      }
    } catch (saveErr) {
      console.warn("Could not save record to Supabase history table:", saveErr.message);
    }

    return res.status(200).json({
      success: true,
      riskScore: analysisResult.riskScore,
      verdict: analysisResult.verdict,
      confidence: analysisResult.confidence,
      explanation: analysisResult.explanation,
      suspiciousIndicators: analysisResult.suspiciousIndicators,
      data: analysisResult,
      ...analysisResult,
    });
  } catch (error) {
    const exactError = error.originalError?.message || error.message || String(error);
    console.error("Analyze Controller Error:", exactError);

    const is429 =
      error.is429 ||
      error.statusCode === 429 ||
      String(exactError).includes("429") ||
      String(exactError).toLowerCase().includes("quota") ||
      String(exactError).toLowerCase().includes("resourceexhausted");

    const is503 =
      error.is503 ||
      error.statusCode === 503 ||
      String(exactError).includes("503") ||
      String(exactError).toLowerCase().includes("overload") ||
      String(exactError).toLowerCase().includes("busy");

    let statusCode = error.statusCode || 500;
    let userMessage = error.message;

    if (is429) {
      statusCode = 429;
      userMessage = "Daily Gemini quota exceeded. Try later or use another API key.";
    } else if (is503) {
      statusCode = 503;
      userMessage = "Gemini service is temporarily busy. Please retry in a few seconds.";
    }

    return res.status(statusCode).json({
      success: false,
      error: userMessage || "An error occurred while analyzing the email.",
    });
  }
}

/**
 * Controller to fetch dynamic dashboard stats from Supabase email_history.
 * Returns: totalReports, safeCount, lowCount, mediumCount, highCount, criticalCount, latestCase
 */
async function getStats(req, res) {
  try {
    const stats = await getStatsFromSupabase();
    return res.status(200).json({
      success: true,
      totalReports: stats.totalReports,
      safeCount: stats.safeCount,
      lowCount: stats.lowCount,
      mediumCount: stats.mediumCount,
      highCount: stats.highCount,
      criticalCount: stats.criticalCount,
      highRiskCount: stats.highRiskCount,
      latestCase: stats.latestCase,
      stats: {
        totalReports: stats.totalReports,
        safeCount: stats.safeCount,
        lowCount: stats.lowCount,
        mediumCount: stats.mediumCount,
        highCount: stats.highCount,
        criticalCount: stats.criticalCount,
        highRiskCount: stats.highRiskCount,
        latestCase: stats.latestCase,
      },
    });
  } catch (error) {
    console.error("Get Stats Controller Error:", error.message);
    return res.status(200).json({
      success: true,
      totalReports: 0,
      safeCount: 0,
      lowCount: 0,
      mediumCount: 0,
      highCount: 0,
      criticalCount: 0,
      highRiskCount: 0,
      latestCase: null,
      stats: {
        totalReports: 0,
        safeCount: 0,
        lowCount: 0,
        mediumCount: 0,
        highCount: 0,
        criticalCount: 0,
        highRiskCount: 0,
        latestCase: null,
      },
    });
  }
}

/**
 * Controller to fetch cases from Supabase email_history.
 */
async function getCases(req, res) {
  try {
    const cases = await getCasesFromSupabase();
    return res.status(200).json({
      success: true,
      cases: cases || [],
      data: cases || [],
    });
  } catch (error) {
    console.error("Get Cases Controller Error:", error.message);
    return res.status(200).json({
      success: true,
      cases: [],
      data: [],
    });
  }
}

/**
 * Controller to fetch a saved report by caseId or UUID.
 */
async function getReport(req, res) {
  try {
    const { caseId } = req.params;
    if (!caseId) {
      return res.status(200).json({ success: false, error: "Case ID required", report: null });
    }
    const report = await getReportFromSupabase(caseId);
    if (!report) {
      return res.status(200).json({ success: false, error: "Report not found", report: null });
    }
    return res.status(200).json({
      success: true,
      report,
      data: report,
      ...report,
    });
  } catch (error) {
    console.error("Get Report Controller Error:", error.message);
    return res.status(200).json({ success: false, error: error.message, report: null });
  }
}

/**
 * Controller to perform domain intelligence on a target domain with real OSINT data.
 */
async function getDomainIntel(req, res) {
  try {
    const domain = (req.params.domain || "").trim().toLowerCase();
    if (!domain) {
      return res.status(400).json({ success: false, message: "Valid domain parameter is required" });
    }

    const intel = await resolveDomainIntelligence(domain);
    return res.status(200).json({
      success: true,
      ...intel
    });
  } catch (err) {
    console.error("getDomainIntel Error:", err.message);
    return res.status(200).json({
      success: false,
      domain: req.params.domain || "",
      error: err.message,
    });
  }
}

/**
 * Controller to generate and download a forensic PDF report directly from backend.
 */
async function exportPdf(req, res) {
  try {
    const analysisData = req.body || {};
    const pdfBuffer = generatePhishGuardPDF(analysisData);
    const timestampStr = getFormattedTimestampForFilename(analysisData.date || new Date());
    const filename = `PhishGuard_Report_${timestampStr}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("Export PDF Controller Error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to generate forensic PDF report: " + error.message,
    });
  }
}

/**
 * Controller to fetch history records from Supabase email_history table.
 */
async function getHistory(req, res) {
  try {
    const records = await getEmailHistory();
    return res.status(200).json({
      success: true,
      records: records || [],
      history: records || [],
      data: records || [],
    });
  } catch (error) {
    console.error("Get History Controller Error:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      records: [],
      history: [],
      data: [],
    });
  }
}

/**
 * Controller to fetch a single history record from Supabase by ID.
 */
async function getHistoryById(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: "History record ID is required." });
    }

    const record = await getEmailHistoryById(id);
    if (!record) {
      return res.status(200).json({ success: false, error: "History record not found.", record: null });
    }

    return res.status(200).json({
      success: true,
      record,
      data: record,
    });
  } catch (error) {
    console.error("Get History By ID Controller Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Controller to delete a history record from Supabase by ID.
 */
async function deleteHistory(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: "History record ID is required." });
    }

    const deleted = await deleteEmailHistory(id);
    return res.status(200).json({ success: deleted });
  } catch (error) {
    console.error("Delete History Controller Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Perform real IP Geolocation lookup
 * Tries ip-api.com, then ipwho.is as fallback
 */
async function getIpGeo(req, res) {
  const ip = req.params.ip;
  if (!ip || typeof ip !== "string") {
    return res.status(400).json({ success: false, message: "Valid IP address required" });
  }

  try {
    const r1 = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,reverse,query`
    );
    const d1 = await r1.json();
    if (d1 && d1.status === "success") {
      return res.status(200).json({
        success: true,
        data: {
          ip: d1.query || ip,
          country: d1.country,
          countryCode: d1.countryCode,
          city: d1.city,
          region: d1.regionName || d1.region,
          latitude: d1.lat,
          longitude: d1.lon,
          asn: d1.as || "Unknown ASN",
          isp: d1.isp || d1.org || "Unknown Provider",
          reverseDns: d1.reverse || `node-${ip.replace(/\./g, "-")}.net`,
        },
      });
    }
  } catch (e) {
    console.warn("ip-api lookup error:", e.message);
  }

  try {
    const r2 = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`);
    const d2 = await r2.json();
    if (d2 && d2.success !== false) {
      return res.status(200).json({
        success: true,
        data: {
          ip: d2.ip || ip,
          country: d2.country,
          countryCode: d2.country_code,
          city: d2.city,
          region: d2.region,
          latitude: d2.latitude,
          longitude: d2.longitude,
          asn: d2.connection?.asn ? `AS${d2.connection.asn} ${d2.connection.org || d2.connection.isp}` : "Unknown ASN",
          isp: d2.connection?.isp || d2.connection?.org || "Unknown Provider",
          reverseDns: d2.connection?.domain || `node-${ip.replace(/\./g, "-")}.net`,
        },
      });
    }
  } catch (e2) {
    console.warn("ipwho.is lookup error:", e2.message);
  }

  return res.status(404).json({ success: false, message: "Geolocation not found for IP" });
}

module.exports = {
  analyzeEmail,
  getStats,
  getCases,
  getReport,
  getDomainIntel,
  getIpGeo,
  exportPdf,
  getHistory,
  getHistoryById,
  deleteHistory,
};
