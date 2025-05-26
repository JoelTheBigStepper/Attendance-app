// seedAdmin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");
require("dotenv").config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const existingAdmin = await Admin.findOne({ username: "admin" });
  if (existingAdmin) {
    console.log("Admin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = new Admin({
    username: "admin",
    password: hashedPassword,
  });

  await admin.save();
  console.log("Admin created successfully");
  process.exit();
}

createAdmin();
