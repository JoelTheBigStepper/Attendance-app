// models/UsedDeviceLog.js

const mongoose = require("mongoose");

const usedDeviceLogSchema = new mongoose.Schema({
  date: { type: String, required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  fingerprint: { type: String, required: true },
  ip: { type: String, required: true },
  userAgent: { type: String, required: true },
});

usedDeviceLogSchema.index({ ip: 1, userAgent: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("UsedDeviceLog", usedDeviceLogSchema);
