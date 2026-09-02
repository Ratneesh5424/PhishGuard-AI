const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load server/.env configuration
dotenv.config({ path: path.join(__dirname, ".env") });

const analyzeRoutes = require("./routes/analyze");

const app = express();

// Register CORS for http://localhost:5173 and dev clients
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "x-device-id", "X-Device-Id"],
    credentials: true,
  })
);

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Register API Routes
app.use("/api", analyzeRoutes);
app.use("/api/analyze", analyzeRoutes);

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