require("dotenv").config();
const mongoose = require("mongoose");
const xlsx = require("xlsx");
const Student = require("./models/Student");

async function importStudents() {
  await mongoose.connect(process.env.MONGO_URI);

  const workbook = xlsx.readFile("./students.xlsx"); 
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: ["matric", "fullName"], range: 1 });

  for (const row of data) {
    if (!row.matric || !row.fullName) {
      console.log("Skipping invalid row:", row);
      continue;
    }

    console.log("Saving:", row);

    await Student.create({
      matric: row.matric.toString().trim(),
      fullName: row.fullName.trim(),
    });
  }

  console.log("✅ Import completed.");
  process.exit();
}

importStudents().catch((err) => {
  console.error("❌ Error importing students:", err);
  process.exit(1);
});
