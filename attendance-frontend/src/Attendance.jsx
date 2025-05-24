import React, { useState, useEffect } from "react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

const Attendance = ({ student }) => {
  const [fingerprint, setFingerprint] = useState("");
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("Detecting device and location...");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFingerprint = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setFingerprint(result.visitorId);
        setStatus((s) => s + " | Device ready");
      } catch (err) {
        setStatus("❌ Fingerprint failed");
        console.error("Fingerprint error:", err);
        setError("Failed to get device identity.");
      }
    };

    const loadLocation = () => {
      if (!navigator.geolocation) {
        setStatus("❌ Geolocation not supported.");
        setError("Your browser does not support location.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setStatus("✅ Location acquired. Ready to mark attendance.");
        },
        (err) => {
          console.error("GPS error:", err);
          setLocation(null);
          setStatus("❌ Location denied.");
          setError("Location access denied. Please enable GPS.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    };

    loadFingerprint();
    loadLocation();
  }, []);

  const handleMarkAttendance = async () => {
    if (!fingerprint || !location) {
      setError("Device and location must be available.");
      return;
    }

    try {
      const res = await fetch("https://attendance-app-s139.onrender.com/api/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matric: student.matric,
          fullName: student.fullName,
          fingerprint,
          location,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to mark attendance");
        setMessage("");
      } else {
        setMessage(data.message);
        setError("");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Server error while marking attendance.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow rounded space-y-4">
      <h2 className="text-xl font-bold">Welcome, {student.fullName}</h2>
      <p>Matric Number: {student.matric}</p>
      <button
        onClick={handleMarkAttendance}
        disabled={!fingerprint || !location}
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      >
        Mark Attendance
      </button>
      <p className="text-sm text-gray-600">{status}</p>
      {message && <p className="mt-2 text-green-700 font-semibold">{message}</p>}
      {error && <p className="mt-2 text-red-600 font-semibold">{error}</p>}
    </div>
  );
};

export default Attendance;
