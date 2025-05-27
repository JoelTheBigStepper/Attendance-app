require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const morgan = require("morgan");

const attendanceRoutes = require("./routes/attendance");
const authRoutes = require("./routes/auth");
const fingerprintRoutes = require("./routes/fingerprint");
const adminAuthRoutes = require("./routes/adminAuth");
const adminStudentRoutes = require("./routes/adminStudents");
const adminAttendanceRoutes = require("./routes/adminAttendance");

const app = express();

// ✅ CORS Setup
const allowedOrigins = [
  "http://localhost:3000", // dev frontend
  "https://attendancesite.vercel.app", // deployed student site
  "https://admin.attendancesite.vercel.app", // deployed admin site (if different)
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman) or whitelisted domains
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// ✅ Middleware
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("tiny"));

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    maxPoolSize: 50,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Routes
app.use("/api/attendance", attendanceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/attendance", fingerprintRoutes);
app.use("/api/admin/auth", adminAuthRoutes.router);
app.use("/api/admin/students", adminStudentRoutes);
app.use("/api/admin/attendance", adminAttendanceRoutes);

// ✅ Health check route
app.get("/api/health", (req, res) => {
  res.send("OK");
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ message: "Server error" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
