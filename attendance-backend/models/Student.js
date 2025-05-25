const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  matric: { type: String, unique: true, required: true },
  fullName: { type: String, required: true },
  email: { type: String },
  fingerprint: { type: String },
});

// ⚡ Indexes for performance
studentSchema.index({ matric: 1 }, { unique: true });
studentSchema.index({ fingerprint: 1 });

module.exports = mongoose.model("Student", studentSchema);
