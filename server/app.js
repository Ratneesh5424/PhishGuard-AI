const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load server/.env configuration
dotenv.config({ path: path.join(__dirname, ".env") });

const analyzeRoutes = require("./routes/analyze");

const app = express();

const corsOptions = {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", "*"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-device-id",
    "Accept",
    "Origin",
    "X-Requested-With",
  ],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Register API Routes
app.use("/api", analyzeRoutes);
app.use("/api/analyze", analyzeRoutes);

// Direct aliases
app.use("/stats", (req, res, next) => { req.url = "/stats"; analyzeRoutes(req, res, next); });
app.use("/history", (req, res, next) => { req.url = "/history" + req.url; analyzeRoutes(req, res, next); });
app.use("/cases", (req, res, next) => { req.url = "/cases"; analyzeRoutes(req, res, next); });
app.use("/domain", (req, res, next) => { req.url = "/domain" + req.url; analyzeRoutes(req, res, next); });
app.use("/report", (req, res, next) => { req.url = "/report" + req.url; analyzeRoutes(req, res, next); });

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    project: "PhishGuard AI",
    status: "Backend Running 🚀",
    version: "1.0.0",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;