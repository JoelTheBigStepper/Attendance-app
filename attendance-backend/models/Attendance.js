// models/Attendance.js

const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  date: { type: String, required: true }, // e.g., '2025-05-24'
  timestamp: { type: Date, default: Date.now },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  fingerprint: { type: String, required: true }, // 🔒 Required for device-level check
});

// ✅ Prevent multiple attendance per device per day
attendanceSchema.index({ fingerprint: 1, date: 1 }, { unique: true });
// ✅ Still prevent one student from marking multiple times in a day
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
