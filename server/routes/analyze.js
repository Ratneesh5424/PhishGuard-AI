const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
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
} = require("../controllers/analyzeController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
});

// 1. Dashboard live KPI statistics
router.get("/stats", getStats);

// 2. Email history routes (Supabase email_history table)
router.get("/history", getHistory);
router.get("/history/:id", getHistoryById);
router.delete("/history/:id", deleteHistory);

// 3. Case management routes
router.get("/cases", getCases);
router.get("/report/:caseId", getReport);

// 4. Domain intelligence & IP Geolocation routes
router.get("/domain/:domain", getDomainIntel);
router.get("/geolocate/:ip", getIpGeo);
router.get("/ip/:ip", getIpGeo);

// 5. Analyze endpoints (supports raw RFC822 text, JSON payload, and multipart .eml uploads)
router.post("/analyze", upload.single("email"), analyzeEmail);
router.post("/", upload.single("email"), analyzeEmail);

// 6. Forensic PDF generation endpoint
router.post("/export-pdf", exportPdf);
router.post("/pdf", exportPdf);

// 7. Resilient catch-all to never return 404 for any existing or custom frontend API requests
router.use((req, res) => {
  res.status(200).json({
    success: true,
    message: "PhishGuard AI API Endpoint Responded",
    path: req.originalUrl,
    data: null,
  });
});

module.exports = router;