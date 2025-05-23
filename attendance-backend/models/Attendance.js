const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  date: { type: String, required: true }, // e.g., '2025-05-21'
  timestamp: { type: Date, default: Date.now },

  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
});

// Prevent multiple attendance for same student on same date
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
