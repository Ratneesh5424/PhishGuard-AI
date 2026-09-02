const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load server/.env configuration
dotenv.config({ path: path.join(__dirname, ".env") });

const analyzeRoutes = require("./routes/analyze");

const app = express();

// Register CORS for localhost, Vercel frontend, and production clients
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      // Allow all localhost origins, vercel.app domains, or wildcard
      if (
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.endsWith(".vercel.app") ||
        origin === "https://phishguard-ai.vercel.app"
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "x-device-id",
      "X-Device-Id",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Register API Routes
app.use("/api", analyzeRoutes);
app.use("/", analyzeRoutes);

// Health check endpoints
app.get("/", (req, res) => {
  res.json({
    project: "PhishGuard AI Backend",
    status: "Backend Running 🚀",
    version: "1.0.0",
    uptime: process.uptime(),
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;