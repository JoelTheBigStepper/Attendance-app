// utils/processAttendanceJob.js
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");

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

module.exports = async function processAttendanceJob(job) {
  const { matric, fullName, fingerprint, location } = job.data;

  if (!matric || !fullName || !fingerprint || !location?.lat || !location?.lng) {
    throw new Error("Missing required fields");
  }

  const distance = getDistanceFromLatLonInMeters(
    location.lat,
    location.lng,
    CLASSROOM_LOCATION.lat,
    CLASSROOM_LOCATION.lng
  );

  if (distance > ALLOWED_RADIUS_METERS) {
    throw new Error(`You are outside the allowed classroom area. Distance: ${Math.round(distance)} meters.`);
  }

  const student = await Student.findOne({ matric });
  if (!student) {
    throw new Error("Matric number not found.");
  }

  if (student.fullName.toLowerCase() !== fullName.toLowerCase()) {
    throw new Error("Full name does not match.");
  }

  const today = getTodayDate();

  const deviceUsed = await Attendance.findOne({ fingerprint, date: today });
  if (deviceUsed && deviceUsed.student.toString() !== student._id.toString()) {
    throw new Error("Device already used for another student today.");
  }

  const attendanceExists = await Attendance.findOne({ student: student._id, date: today });
  if (attendanceExists) {
    throw new Error("Attendance already marked today.");
  }

  if (!student.fingerprint) {
    student.fingerprint = fingerprint;
    await student.save();
  } else if (student.fingerprint !== fingerprint) {
    throw new Error("Use your registered device to mark attendance.");
  }

  const attendance = new Attendance({
    student: student._id,
    date: today,
    location,
    fingerprint,
  });

  await attendance.save();
};
