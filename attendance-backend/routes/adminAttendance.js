const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const { verifyToken } = require("./adminAuth");

router.get("/", verifyToken, async (req, res) => {
  const { date, student, status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (date) query.date = date;
  if (student) {
    const students = await Student.find({
      $or: [
        { matric: { $regex: student, $options: "i" } },
        { fullName: { $regex: student, $options: "i" } },
      ],
    });
    query.student = { $in: students.map(s => s._id) };
  }

  const attendanceRecords = await Attendance.find(query)
    .populate("student")
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ date: -1 });

  const total = await Attendance.countDocuments(query);

  res.json({ attendanceRecords, total });
});

router.get("/summary", verifyToken, async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: "Date is required" });

  const totalStudents = await Student.countDocuments();
  const presentCount = await Attendance.countDocuments({ date });

  res.json({
    date,
    totalStudents,
    presentCount,
    absentCount: totalStudents - presentCount,
  });
});

router.post("/override", verifyToken, async (req, res) => {
  const { matric, date, present } = req.body;
  if (!matric || !date) return res.status(400).json({ message: "matric and date required" });

  const student = await Student.findOne({ matric });
  if (!student) return res.status(404).json({ message: "Student not found" });

  if (present) {
    const exists = await Attendance.findOne({ student: student._id, date });
    if (!exists) {
      const newAttendance = new Attendance({ student: student._id, date, location: null, fingerprint: null });
      await newAttendance.save();
      return res.json({ message: "Attendance marked" });
    }
    return res.json({ message: "Attendance already marked" });
  } else {
    await Attendance.deleteOne({ student: student._id, date });
    return res.json({ message: "Attendance removed" });
  }
});

module.exports = router;
