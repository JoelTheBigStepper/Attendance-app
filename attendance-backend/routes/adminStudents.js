const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const { verifyToken } = require("./adminAuth");

router.get("/", verifyToken, async (req, res) => {
  const { search = "", page = 1, limit = 20 } = req.query;
  const query = {
    $or: [
      { matric: { $regex: search, $options: "i" } },
      { fullName: { $regex: search, $options: "i" } },
    ],
  };
  const students = await Student.find(query)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  const total = await Student.countDocuments(query);
  res.json({ students, total });
});

router.post("/", verifyToken, async (req, res) => {
  const { matric, fullName } = req.body;
  const exists = await Student.findOne({ matric });
  if (exists) return res.status(400).json({ message: "Matric already exists" });
  const student = new Student({ matric, fullName });
  await student.save();
  res.json(student);
});

router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { matric, fullName } = req.body;
  const student = await Student.findByIdAndUpdate(id, { matric, fullName }, { new: true });
  if (!student) return res.status(404).json({ message: "Student not found" });
  res.json(student);
});

router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  await Student.findByIdAndDelete(id);
  res.json({ message: "Deleted successfully" });
});

const multer = require("multer");
const xlsx = require("xlsx");
const upload = multer({ dest: "uploads/" });

router.post("/import", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    for (const row of data) {
      if (row.matric && row.fullName) {
        await Student.updateOne(
          { matric: row.matric },
          { fullName: row.fullName },
          { upsert: true }
        );
      }
    }
    res.json({ message: "Import successful" });
  } catch (err) {
    res.status(500).json({ message: "Failed to import" });
  }
});

module.exports = router;
