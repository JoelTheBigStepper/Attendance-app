const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  matric: { type: String, unique: true, required: true },  // changed from studentId
  fullName: { type: String, required: true },              // changed from name
  email: { type: String },
  fingerprint: { type: String },                           // device ID
});

module.exports = mongoose.model("Student", studentSchema);
