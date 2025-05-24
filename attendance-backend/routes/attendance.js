const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");

// Classroom location and radius
const CLASSROOM_LOCATION = { lat: 8.172224, lng: 4.255816 };
const ALLOWED_RADIUS_METERS = 100000;

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

router.post("/mark", async (req, res) => {
  try {
    const { matric, fullName, fingerprint, location } = req.body;

    if (!matric || !fullName || !fingerprint || !location) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check location distance
    const dist = getDistanceFromLatLonInMeters(
      location.lat,
      location.lng,
      CLASSROOM_LOCATION.lat,
      CLASSROOM_LOCATION.lng
    );
    console.log(`📏 Distance from classroom: ${dist} meters`);
    console.log("📍 Received location:", location);

    if (dist > ALLOWED_RADIUS_METERS) {
      return res.status(403).json({
        message: `You are not in the classroom area. Distance = ${Math.round(dist)} meters`,
      });
    }

    // Find student by matric
    const student = await Student.findOne({ matric });
    if (!student) {
      return res.status(404).json({ message: "Matric number not found" });
    }

    if (student.fullName.toLowerCase() !== fullName.toLowerCase()) {
      return res.status(400).json({ message: "Name does not match our records" });
    }

    // Check if fingerprint conflicts on student record
    if (student.fingerprint && student.fingerprint !== fingerprint) {
      return res.status(403).json({
        message: "Attendance already marked from another device. Use the same device.",
      });
    }

    const today = getTodayDate();

    // Check if attendance already marked today from the same device
    const existingAttendance = await Attendance.findOne({
      student: student._id,
      date: today,
      fingerprint: fingerprint,
    });
    if (existingAttendance) {
      return res.status(409).json({ message: "Attendance already marked today from this device." });
    }

    // Save fingerprint on student record if first time
    if (!student.fingerprint) {
      student.fingerprint = fingerprint;
      await student.save();
    }

    // Save attendance with fingerprint
    const attendance = new Attendance({
      student: student._id,
      date: today,
      location,
      fingerprint,
    });
    await attendance.save();

    res.json({ message: "Attendance marked successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
