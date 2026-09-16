const { createClient } = require("@supabase/supabase-js");

/**
 * Initializes Supabase client using environment variables only.
 * Never hardcodes any credentials or URLs.
 */
function getSupabaseClient() {
  const supabaseUrl = (process.env.SUPABASE_URL || "").trim();
  const supabaseKey = (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || "").trim();

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Saves a completed analysis record to Supabase `email_history` table.
 *
 * @param {Object} analysisData - Formatted analysis report
 * @returns {Promise<Object|null>} Inserted record or null
 */
async function saveEmailHistory(analysisData) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn("⚠️ Supabase credentials not configured in server/.env. Skipping database persistence.");
    return null;
  }

  try {
    const rawScore = typeof analysisData.riskScore === "number"
      ? analysisData.riskScore
      : (typeof analysisData.risk_score === "number" ? analysisData.risk_score : 0);
    const score = Math.min(100, Math.max(0, rawScore));

    // Calculate status strictly from risk_score:
    // 0–30 → SAFE
    // 31–70 → SUSPICIOUS
    // 71–100 → HIGH RISK
    const calculatedStatus = score >= 71 ? "HIGH RISK" : score >= 31 ? "SUSPICIOUS" : "SAFE";

    const payload = {
      sender: analysisData.sender || "unknown@sender.com",
      subject: analysisData.subject || "Analyzed Email Threat Assessment",
      risk_score: score,
      status: calculatedStatus,
      confidence: typeof analysisData.confidence === "number" ? analysisData.confidence : 97.5,
      summary: analysisData.executiveSummary || analysisData.summary || "Threat assessment completed.",
      analyzed_at: new Date().toISOString(),
      device_id: analysisData.deviceId || analysisData.device_id || null,
    };

    const { data, error } = await supabase
      .from("email_history")
      .insert([payload])
      .select();

    if (error) {
      console.error("Supabase insert error in email_history:", error.message);
      return null;
    }

    return data && data.length > 0 ? data[0] : payload;
  } catch (err) {
    console.error("Supabase service error while saving history:", err.message);
    return null;
  }
}

/**
 * Calculates live dashboard KPI statistics from Supabase email_history.
 */
async function getStats() {
  const records = await getEmailHistory();
  let safeCount = 0;
  let lowCount = 0;
  let mediumCount = 0;
  let highCount = 0;
  let criticalCount = 0;

  for (const r of records) {
    const s = typeof r.risk_score === "number" ? r.risk_score : 0;
    if (s <= 20) safeCount++;
    else if (s <= 40) lowCount++;
    else if (s <= 70) mediumCount++;
    else if (s <= 90) highCount++;
    else criticalCount++;
  }

  const highRiskCount = highCount + criticalCount;
  const latestCase = records.length > 0 ? records[0] : null;

  return {
    totalReports: records.length,
    safeCount,
    lowCount,
    mediumCount,
    highCount,
    criticalCount,
    highRiskCount,
    latestCase,
  };
}

/**
 * Retrieves case investigations derived from Supabase email_history records.
 */
async function getCases() {
  const records = await getEmailHistory();
  return records.map((r) => {
    const score = typeof r.risk_score === "number" ? r.risk_score : 0;
    const severity = score >= 90 ? "CRITICAL" : score >= 71 ? "HIGH" : score >= 31 ? "MEDIUM" : "SAFE";
    const shortId = (r.id || "").slice(0, 8).toUpperCase();
    const caseId = `CASE-2026-${shortId}`;
    return {
      id: caseId,
      caseId: caseId,
      rawId: r.id,
      title: r.subject || "Email Threat Assessment",
      subject: r.subject || "Email Threat Assessment",
      severity,
      threatLevel: severity,
      level: severity,
      status: "Open",
      assignedTo: "Lead Threat Hunter",
      threatType: r.summary || "Email Threat Assessment",
      riskScore: score,
      score,
      originCountry: "Origin Node",
      targetDomain: (r.sender || "").split("@")[1] || "unknown.com",
      sender: r.sender,
      createdAt: r.analyzed_at,
      updatedAt: r.analyzed_at,
      timestamp: r.analyzed_at,
      confidence: r.confidence || 98.6,
      summary: r.summary,
      notes: [
        {
          id: `n-${r.id}`,
          author: "PhishGuard AI Engine",
          text: r.summary || "Automated deterministic forensic evaluation completed.",
          timestamp: r.analyzed_at ? new Date(r.analyzed_at).toLocaleString() : new Date().toLocaleString(),
        },
      ],
      investigationRef: {
        id: r.id,
        caseId,
        subject: r.subject,
        sender: r.sender,
        score,
        riskScore: score,
        level: severity,
        threatLevel: severity,
        verdict: r.status,
        status: r.status,
        confidence: r.confidence || 98.6,
        summary: r.summary,
        executiveSummary: r.summary,
        date: r.analyzed_at,
      },
    };
  });
}

/**
 * Fetches an analysis report from Supabase by caseId or UUID.
 */
async function getReportById(caseId) {
  if (!caseId) return null;
  const cleanId = String(caseId).replace(/^CASE-\d+-/i, "").toLowerCase();
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("email_history")
      .select("*")
      .or(`id.eq.${caseId},id.ilike.${cleanId}%`)
      .limit(1);

    if (error || !data || data.length === 0) {
      const single = await getEmailHistoryById(caseId);
      return single;
    }
    const r = data[0];
    const score = typeof r.risk_score === "number" ? r.risk_score : 0;
    const severity = score >= 90 ? "CRITICAL" : score >= 71 ? "HIGH" : score >= 31 ? "MEDIUM" : "SAFE";
    return {
      ...r,
      caseId: `CASE-2026-${(r.id || "").slice(0, 8).toUpperCase()}`,
      riskScore: score,
      score,
      threatLevel: severity,
      level: severity,
      executiveSummary: r.summary,
      verdict: r.status,
    };
  } catch (err) {
    console.error("Error retrieving report by ID:", err.message);
    return null;
  }
}

/**
 * Fetches all analysis history records from Supabase ordered by newest first (analyzed_at DESC).
 *
 * @returns {Promise<Array>} List of history records
 */
async function getEmailHistory() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("email_history")
      .select("*")
      .order("analyzed_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch error for email_history:", error.message);
      return [];
    }

    // Ensure status aligns with risk_score (0-30 SAFE, 31-70 SUSPICIOUS, 71-100 HIGH RISK)
    const normalizedData = (data || []).map((r) => {
      const score = typeof r.risk_score === "number" ? r.risk_score : 0;
      const calculatedStatus = score >= 71 ? "HIGH RISK" : score >= 31 ? "SUSPICIOUS" : "SAFE";
      return {
        ...r,
        status: calculatedStatus,
      };
    });

    return normalizedData;
  } catch (err) {
    console.error("Supabase service error while retrieving history:", err.message);
    return [];
  }
}

/**
 * Fetches a single analysis history record from Supabase by ID.
 *
 * @param {string} id - Record UUID
 * @returns {Promise<Object|null>} History record or null
 */
async function getEmailHistoryById(id) {
  const supabase = getSupabaseClient();
  if (!supabase || !id) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("email_history")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Supabase fetch error for record ${id}:`, error.message);
      return null;
    }

    if (!data) return null;

    const score = typeof data.risk_score === "number" ? data.risk_score : 0;
    const calculatedStatus = score >= 71 ? "HIGH RISK" : score >= 31 ? "SUSPICIOUS" : "SAFE";

    return {
      ...data,
      status: calculatedStatus,
      riskScore: score,
      score,
      level: calculatedStatus,
      threatLevel: calculatedStatus,
    };
  } catch (err) {
    console.error("Supabase service error while retrieving history by id:", err.message);
    return null;
  }
}

/**
 * Deletes an email history record by ID from Supabase.
 *
 * @param {string} id - Record UUID
 * @returns {Promise<boolean>} Success status
 */
async function deleteEmailHistory(id) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return false;
  }

  try {
    const { error } = await supabase
      .from("email_history")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Supabase service error while deleting history:", err.message);
    return false;
  }
}

module.exports = {
  getSupabaseClient,
  saveEmailHistory,
  getEmailHistory,
  getEmailHistoryById,
  deleteEmailHistory,
  getStats,
  getCases,
  getReportById,
};
