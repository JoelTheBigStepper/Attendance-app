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

const allowedOrigins = [
  "http://localhost:3000", 
  "https://attendancesite.vercel.app",
  "https://attendance-app-dkst.vercel.app",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.options("*", cors());

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("tiny"));

mongoose
  .connect(process.env.MONGO_URI, {
    maxPoolSize: 50,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use("/api/attendance", attendanceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/attendance", fingerprintRoutes);
// app.use("/api/admin/auth", adminAuthRoutes.router);
app.use("/api/admin/students", adminStudentRoutes);
app.use("/api/admin/attendance", adminAttendanceRoutes);

app.get("/api/health", (req, res) => {
  res.send("OK");
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
