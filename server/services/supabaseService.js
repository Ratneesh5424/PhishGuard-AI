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
 * Saves a completed analysis record to Supabase `email_history` table with device isolation.
 *
 * @param {Object} analysisData - Formatted analysis report
 * @param {string} [deviceId] - Unique device identifier
 * @returns {Promise<Object|null>} Inserted record or null
 */
async function saveEmailHistory(analysisData, deviceId) {
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
    const assignedDeviceId = deviceId || analysisData.device_id || analysisData.deviceId || null;

    const payload = {
      sender: analysisData.sender || "unknown@sender.com",
      subject: analysisData.subject || "Analyzed Email Threat Assessment",
      risk_score: score,
      status: calculatedStatus,
      confidence: typeof analysisData.confidence === "number" ? analysisData.confidence : 97.5,
      summary: analysisData.executiveSummary || analysisData.summary || "Threat assessment completed.",
      analyzed_at: new Date().toISOString(),
      ...(assignedDeviceId ? { device_id: assignedDeviceId } : {}),
    };

    let { data, error } = await supabase
      .from("email_history")
      .insert([payload])
      .select();

    // Fallback: If device_id column does not exist yet in Supabase, retry insert without device_id
    if (error && error.code === "42703") {
      delete payload.device_id;
      const retryRes = await supabase
        .from("email_history")
        .insert([payload])
        .select();
      data = retryRes.data;
      error = retryRes.error;
    }

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
 * Fetches analysis history records from Supabase for a specific device ordered by newest first (analyzed_at DESC).
 *
 * @param {string} [deviceId] - Optional device identifier to isolate records
 * @returns {Promise<Array>} List of history records for this device
 */
async function getEmailHistory(deviceId) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  try {
    let query = supabase
      .from("email_history")
      .select("*")
      .order("analyzed_at", { ascending: false });

    if (deviceId) {
      query = query.eq("device_id", deviceId);
    }

    const { data, error } = await query;

    // If device_id column does not exist yet in Supabase schema, return empty array to prevent data leakage across devices
    if (error && error.code === "42703") {
      console.warn("Supabase column 'device_id' does not exist yet in table email_history. Returning empty records for isolation.");
      return [];
    }

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
 * Fetches a single analysis history record from Supabase by ID with optional device verification.
 *
 * @param {string} id - Record UUID
 * @param {string} [deviceId] - Optional device identifier
 * @returns {Promise<Object|null>} History record or null
 */
async function getEmailHistoryById(id, deviceId) {
  const supabase = getSupabaseClient();
  if (!supabase || !id) {
    return null;
  }

  try {
    let query = supabase
      .from("email_history")
      .select("*")
      .eq("id", id);

    if (deviceId) {
      query = query.eq("device_id", deviceId);
    }

    let { data, error } = await query.maybeSingle();

    // Fallback if device_id column does not exist yet
    if (error && error.code === "42703") {
      const fallbackQuery = await supabase
        .from("email_history")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      data = fallbackQuery.data;
      error = fallbackQuery.error;
    }

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
    };
  } catch (err) {
    console.error("Supabase service error while retrieving history by id:", err.message);
    return null;
  }
}

/**
 * Deletes an email history record by ID from Supabase with optional device check.
 *
 * @param {string} id - Record UUID
 * @param {string} [deviceId] - Optional device identifier
 * @returns {Promise<boolean>} Success status
 */
async function deleteEmailHistory(id, deviceId) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return false;
  }

  try {
    let query = supabase
      .from("email_history")
      .delete()
      .eq("id", id);

    if (deviceId) {
      query = query.eq("device_id", deviceId);
    }

    const { error } = await query;

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
};
