require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const compression = require("compression"); // for gzip response compression
const helmet = require("helmet"); // for security headers
const morgan = require("morgan"); // optional: better logging

const attendanceRoutes = require("./routes/attendance");
const authRoutes = require("./routes/auth");
const fingerprintRoutes = require("./routes/fingerprint");

const app = express();

// Middleware
app.use(cors({
  origin: "https://attendancesite.vercel.app",
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression
app.use(express.json({ limit: "1mb" })); // Limit body size
app.use(morgan("tiny")); // Optional, or replace with your logger

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    maxPoolSize: 50, // 🔧 increase for high concurrency
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/attendance", attendanceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/attendance", fingerprintRoutes);

// Catch-all error handler (production safe)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ message: "Server error" });
});

app.get("/api/health", (req, res) => {
  res.send("OK");
});
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
