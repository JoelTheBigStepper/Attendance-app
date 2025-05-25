const express = require("express");
const router = express.Router();
const processAttendanceJob = require("../utils/processAttendanceJob");

router.post("/mark", async (req, res) => {
  try {
    console.log("📥 Attendance request received:", req.body);

    await processAttendanceJob({ data: req.body });

    res.json({ message: "✅ Attendance marked successfully" });
  } catch (err) {
    console.error("❌ Attendance error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
