const express = require("express");
const router = express.Router();
const attendanceQueue = require("../queue");

router.post("/mark", async (req, res) => {
  try {
    const { matric, fullName, fingerprint, location } = req.body;

    if (!matric || !fullName || !fingerprint || !location?.lat || !location?.lng) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Enqueue attendance job
    await attendanceQueue.add({
      matric,
      fullName,
      fingerprint,
      location,
    });

    // Respond immediately
    res.json({ message: "Attendance request received and is being processed." });
  } catch (err) {
    console.error("Failed to enqueue attendance:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

module.exports = router;
