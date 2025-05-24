const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const UsedDeviceLog = require("../models/UsedDeviceLog");

// Classroom GPS coordinates and allowed radius (meters)
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

    if (!matric || !fullName || !fingerprint || !location?.lat || !location?.lng) {
      return res.status(400).json({ message: "Missing required fields including GPS location." });
    }

    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const today = getTodayDate();

    // Check classroom distance
    const dist = getDistanceFromLatLonInMeters(
      location.lat,
      location.lng,
      CLASSROOM_LOCATION.lat,
      CLASSROOM_LOCATION.lng
    );

    if (dist > ALLOWED_RADIUS_METERS) {
      return res.status(403).json({
        message: `You are not in the classroom area. Distance: ${Math.round(dist)} meters.`,
      });
    }

    const student = await Student.findOne({ matric });
    if (!student) {
      return res.status(404).json({ message: "Matric number not found." });
    }

    if (student.fullName.toLowerCase() !== fullName.toLowerCase()) {
      return res.status(400).json({ message: "Name does not match our records." });
    }

    // 🔒 Strict block: Device (IP + UA) already used for another student today
    const existingDeviceUse = await UsedDeviceLog.findOne({
      ip,
      userAgent,
      date: today,
      student: { $ne: student._id },
    });

    if (existingDeviceUse) {
      return res.status(403).json({
        message:
          "This device/browser has already been used to mark attendance for another student today.",
      });
    }

    // 🔒 Check if fingerprint already used today for different student
    const existingByFingerprint = await Attendance.findOne({
      fingerprint,
      date: today,
    });

    if (existingByFingerprint && existingByFingerprint.student.toString() !== student._id.toString()) {
      return res.status(403).json({
        message: "This device has already been used for another student today.",
      });
    }

    // 🔐 Enforce fingerprint-device match
    if (!student.fingerprint) {
      student.fingerprint = fingerprint;
      await student.save();
    } else if (student.fingerprint !== fingerprint) {
      return res.status(403).json({
        message: "This is not your registered device. Use the original device.",
      });
    }

    // Prevent duplicate attendance
    const alreadyMarked = await Attendance.findOne({
      student: student._id,
      date: today,
    });

    if (alreadyMarked) {
      return res.status(409).json({
        message: "Attendance already marked today.",
      });
    }

    // ✅ Mark attendance
    await Attendance.create({
      student: student._id,
      date: today,
      location,
      fingerprint,
    });

    // ✅ Log device usage to block reuse
    await UsedDeviceLog.create({
      student: student._id,
      date: today,
      fingerprint,
      ip,
      userAgent,
    });

    res.json({ message: "Attendance marked successfully!" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Duplicate attendance entry." });
    }

    console.error("❌ Attendance error:", err);
    res.status(500).json({ message: "Server error while marking attendance." });
  }
});

module.exports = router;
