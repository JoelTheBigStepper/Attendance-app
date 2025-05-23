require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("./models/Student");

const students = [
  { matric: "S001", fullName: "Alice Johnson", email: "alice@example.com" },
  { matric: "S002", fullName: "Bob Smith", email: "bob@example.com" },
  { matric: "S003", fullName: "Charlie Brown", email: "charlie@example.com" },
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");

    for (const s of students) {
      const exists = await Student.findOne({ matric: s.matric });
      if (!exists) {
        await new Student(s).save();
        console.log(`✅ Added student: ${s.fullName}`);
      } else {
        console.log(`⚠️ Student ${s.fullName} already exists`);
      }
    }

    mongoose.disconnect();
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));
