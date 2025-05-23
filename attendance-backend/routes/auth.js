const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

// Login: check if student exists and return their data
router.post("/login", async (req, res) => {
  const { matric } = req.body;
  if (!matric) return res.status(400).json({ message: "matric is required" });

  try {
    const student = await Student.findOne({ matric });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      matric: student.matric,
      fullName: student.fullName,
      email: student.email,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
