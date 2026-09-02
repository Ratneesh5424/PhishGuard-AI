const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  analyzeEmail,
  exportPdf,
  getHistory,
  getHistoryById,
  deleteHistory,
} = require("../controllers/analyzeController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
});

// Analyze endpoints
router.post("/analyze", upload.single("email"), analyzeEmail);
router.post("/", upload.single("email"), analyzeEmail);

// Forensic PDF generation endpoint
router.post("/export-pdf", exportPdf);
router.post("/pdf", exportPdf);

// History endpoints (Supabase email_history integration)
router.get("/history", getHistory);
router.get("/history/:id", getHistoryById);
router.delete("/history/:id", deleteHistory);

module.exports = router;