const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

router.post("/update-fingerprint", async (req, res) => {
  try {
    const { matric, fullName, newFingerprint } = req.body;

    if (!matric || !fullName || !newFingerprint) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const student = await Student.findOne({ matric });
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    if (student.fullName.toLowerCase() !== fullName.toLowerCase()) {
      return res.status(401).json({ message: "Full name does not match." });
    }

    // Update fingerprint
    student.fingerprint = newFingerprint;
    await student.save();

    res.json({ message: "Fingerprint updated successfully." });
  } catch (err) {
    console.error("Error updating fingerprint:", err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
