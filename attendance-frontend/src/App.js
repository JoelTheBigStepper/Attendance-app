import React, { useState } from "react";
import Login from "./Login";
import Attendance from "./Attendance";

function App() {
  const [student, setStudent] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-8">Class Attendance</h1>
      {!student ? (
        <Login onLogin={setStudent} />
      ) : (
        <Attendance student={student} />
      )}
    </div>
  );
}

export default App;
