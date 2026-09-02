const { analyzeEmailWithGemini } = require("../services/geminiService");
const {
  saveEmailHistory,
  getEmailHistory,
  getEmailHistoryById,
  deleteEmailHistory,
} = require("../services/supabaseService");
const {
  generatePhishGuardPDF,
  getFormattedTimestampForFilename,
} = require("../services/pdfService");

/**
 * Controller to handle email analysis requests.
 * Supports multipart/form-data ('email' file) and JSON/text payloads.
 * Saves successful analysis records to Supabase email_history table.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
async function analyzeEmail(req, res) {
  try {
    let emailContent = "";

    // 1. Check if a file was uploaded (.eml / .msg / .txt)
    if (req.file && req.file.buffer) {
      emailContent = req.file.buffer.toString("utf-8");
    }
    // 2. Check JSON / form body fields
    else if (req.body) {
      emailContent =
        req.body.email ||
        req.body.emailText ||
        req.body.content ||
        req.body.text ||
        "";
    }

    if (!emailContent || typeof emailContent !== "string" || emailContent.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Please provide valid email content or upload a .eml file in field 'email'.",
      });
    }

    const analysisResult = await analyzeEmailWithGemini(emailContent);

    // Requirement: Every successful analysis creates a unique report ID and saves to Supabase email_history
    const uniqueReportId = require("crypto").randomUUID();
    analysisResult.id = uniqueReportId;
    analysisResult.historyId = uniqueReportId;

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
    });
  } catch (error) {
    console.error("Get History Controller Error:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      records: [],
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
      return res.status(404).json({ success: false, error: "History record not found." });
    }

    return res.status(200).json({
      success: true,
      record,
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

module.exports = {
  analyzeEmail,
  exportPdf,
  getHistory,
  getHistoryById,
  deleteHistory,
};
