const express = require("express");
const router = express.Router();
const processAttendanceJob = require("../utils/processAttendanceJob"); // extract the logic to a shared file

router.post("/mark", async (req, res) => {
  try {
    const { matric, fullName, fingerprint, location } = req.body;

    if (!matric || !fullName || !fingerprint || !location?.lat || !location?.lng) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // 🔧 DIRECTLY process attendance here temporarily
    await processAttendanceJob({ data: { matric, fullName, fingerprint, location } });

    res.json({ message: "Attendance marked successfully." });
  } catch (err) {
    console.error("❌ Attendance error:", err.message);
    res.status(500).json({ message: err.message || "Server error." });
  }
  console.log("📥 Attendance request:", req.body);
  console.log("📤 Job added to queue successfully");
});
