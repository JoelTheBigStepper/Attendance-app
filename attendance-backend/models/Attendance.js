const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  date: { type: String, required: true }, // e.g., '2025-05-21'
  timestamp: { type: Date, default: Date.now },

  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },

  fingerprint: { type: String, required: true },
});

// Unique index to prevent multiple attendance per student per date per device
attendanceSchema.index({ student: 1, date: 1, fingerprint: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
