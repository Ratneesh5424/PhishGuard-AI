/**
 * PhishGuard AI Frontend API Service
 * Interacts with the real Node.js/Express forensic backend.
 * Includes strict 20-second timeout via AbortController and automatic fallback
 * to local forensic engine if the backend or Gemini is unavailable.
 */

import { generateInvestigation } from "./forensicEngine";
import { api } from "../lib/api";

const API_BASE = "/api";

/**
 * Sends raw email text or file to the real backend forensic pipeline.
 *
 * @param {string} rawEmail - RFC822 raw email string
 * @param {Array} [attachments] - Optional list of attachments
 * @returns {Promise<Object>} Canonical Step 8 Investigation Object
 */
export async function analyzeEmailApi(rawEmail, attachments = []) {
  if (!rawEmail || typeof rawEmail !== "string") {
    return generateInvestigation(rawEmail || "", attachments);
  }

  const lines = rawEmail.split(/\r?\n/);
  let sender = "";
  let subject = "";
  for (const line of lines) {
    if (!sender && /^from:\s*(.+)/i.test(line)) sender = line.match(/^from:\s*(.+)/i)[1].trim();
    if (!subject && /^subject:\s*(.+)/i.test(line)) subject = line.match(/^subject:\s*(.+)/i)[1].trim();
    if (line.trim() === "" && sender && subject) break;
  }

  const payload = {
    sender: sender || "unknown@sender.com",
    subject: subject || "Analyzed Email Threat Assessment",
    emailText: rawEmail.trim(),
  };

  try {
    // Strict 20-second timeout using AbortController as requested
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 20000);

    const result = await api("/api/analyze", {
      method: "POST",
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const investigation = result.data || result;

    if (!investigation || (!investigation.riskScore && investigation.riskScore !== 0)) {
      console.warn("Backend response format invalid. Running local forensic engine...");
      return generateInvestigation(rawEmail, attachments);
    }

    return investigation;
  } catch (err) {
    console.warn("Backend unavailable or timed out after 20s. Running local forensic engine fallback:", err.message);
    return generateInvestigation(rawEmail, attachments);
  }
}

/**
 * Device ID generator/persister for isolated session history.
 */
function getOrCreateDeviceId() {
  try {
    let id = localStorage.getItem("phishguard_device_id");
    if (!id) {
      id = "dev-" + Math.random().toString(36).substring(2, 12);
      localStorage.setItem("phishguard_device_id", id);
    }
    return id;
  } catch (e) {
    return "dev-fallback-session";
  }
}
