import React, { useState } from "react";

const Login = ({ onLogin }) => {
  const [matric, setMatric] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!matric || !fullName) {
      setError("Please enter both Matric number and Full Name");
      return;
    }

    try {
      const res = await fetch("https://attendance-app-s139.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matric }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
      } else {
        // Optionally validate fullName matches server record
        if (data.fullName.toLowerCase() !== fullName.trim().toLowerCase()) {
          setError("Full name does not match our records");
          return;
        }
        onLogin(data);
      }
    } catch {
      setError("Server error");
    }
  };

  return (
    <div className="w-full max-w-sm p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Student Login</h2>
      <input
        type="text"
        placeholder="Matric Number"
        value={matric}
        onChange={(e) => setMatric(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      />
      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      />
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <button
        onClick={handleLogin}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Login
      </button>
    </div>
  );
};

export default Login;
